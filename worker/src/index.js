// ============================================================
// Cloudflare Worker — UPI Orchestrator API
// Single fetch handler with manual routing
// ============================================================

import { handleAuth } from './routes/auth.js';
import { handlePayments } from './routes/payments.js';
import { handleMerchant } from './routes/merchant.js';
import { handlePublic } from './routes/public.js';
import { handleStatusChecker } from './routes/statusChecker.js';
import { jsonResponse } from './lib/utils.js';

// Simple in-memory rate limiter (per isolate)
// Resets every 60 seconds
const rateLimitMap = new Map();
let lastReset = Date.now();

function checkRateLimit(ip) {
  const now = Date.now();
  if (now - lastReset > 60000) {
    rateLimitMap.clear();
    lastReset = now;
  }
  const count = (rateLimitMap.get(ip) || 0) + 1;
  rateLimitMap.set(ip, count);
  return count <= 100; // Max 100 requests per minute per IP per isolate
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // 1. HTTPS only (force redirect) - skip for localhost
    if (url.protocol === 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    // 2. Rate Limiting
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return applySecurityHeaders(
        jsonResponse({ error: 'Too many requests' }, 429),
        env
      );
    }

    // 3. Handle CORS preflight
    if (method === 'OPTIONS') {
      return applySecurityHeaders(new Response(null, { status: 204 }), env);
    }

    try {
      let response;

      // Root endpoint
      if (path === '/' && method === 'GET') {
        response = jsonResponse({
          name: 'UPI Orchestrator API',
          status: 'ok',
          health: '/api/healthz',
        });
      }
      // Health check
      else if (path === '/api/healthz' && method === 'GET') {
        response = jsonResponse({ status: 'ok' });
      }
      // Auth routes
      else if (path.startsWith('/api/auth/')) {
        response = await handleAuth(request, env, path, method);
      }
      // Payment routes  
      else if (path.startsWith('/api/payments')) {
        response = await handlePayments(request, env, path, method);
      }
      // Merchant routes
      else if (path.startsWith('/api/merchant/')) {
        response = await handleMerchant(request, env, path, method);
      }
      // Public payment routes
      else if (path.startsWith('/api/public/')) {
        response = await handlePublic(request, env, path, method);
      }
      // Status checker
      else if (path === '/api/check-status' && method === 'POST') {
        response = await handleStatusChecker(request, env);
      }
      // 404
      else {
        response = jsonResponse({ error: 'Not found' }, 404);
      }

      return applySecurityHeaders(response, env);
    } catch (err) {
      console.error('Unhandled error:', err);
      return applySecurityHeaders(
        jsonResponse({ error: 'Internal server error' }, 500),
        env
      );
    }
  },
};

function applySecurityHeaders(response, env) {
  const headers = new Headers(response.headers);
  
  // CORS Setup
  const origin = (env && env.FRONTEND_URL) ? env.FRONTEND_URL : '*';
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  headers.set('Access-Control-Max-Age', '86400');

  // CSP & Security headers
  headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
