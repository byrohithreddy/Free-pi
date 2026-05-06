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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return corsResponse(new Response(null, { status: 204 }));
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

      return corsResponse(response);
    } catch (err) {
      console.error('Unhandled error:', err);
      return corsResponse(
        jsonResponse({ error: 'Internal server error' }, 500)
      );
    }
  },
};

function corsResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  headers.set('Access-Control-Max-Age', '86400');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
