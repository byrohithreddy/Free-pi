// ============================================================
// Auth Routes — /api/auth/*
// Preserves exact same request/response structure
// ============================================================

import { jsonResponse, parseJsonBody } from '../lib/utils.js';
import {
  hashPassword,
  comparePassword,
  signToken,
  generateApiKeys,
  hashApiKey,
} from '../lib/auth.js';
import {
  findMerchantByEmail,
  createMerchant,
} from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';

export async function handleAuth(request, env, path, method) {
  // POST /api/auth/register
  if (path === '/api/auth/register' && method === 'POST') {
    return handleRegister(request, env);
  }

  // POST /api/auth/login
  if (path === '/api/auth/login' && method === 'POST') {
    return handleLogin(request, env);
  }

  // GET /api/auth/me
  if (path === '/api/auth/me' && method === 'GET') {
    return handleMe(request, env);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

async function handleRegister(request, env) {
  const body = await parseJsonBody(request);
  if (!body) return jsonResponse({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, 400);

  const { email, password, businessName, upiId, phone } = body;

  if (!email || !password || !businessName || !upiId) {
    return jsonResponse({ error: 'Missing required fields: email, password, businessName, upiId', code: 'VALIDATION_ERROR' }, 400);
  }

  if (typeof password !== 'string' || password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters', code: 'VALIDATION_ERROR' }, 400);
  }

  const upiRegex = /^[a-zA-Z0-9._]+@[a-zA-Z]+$/;
  if (!upiRegex.test(upiId)) {
    return jsonResponse({ error: 'Invalid UPI ID format. Expected: username@bank', code: 'INVALID_UPI_ID' }, 400);
  }

  const existing = await findMerchantByEmail(env.DB, email.toLowerCase());
  if (existing) {
    return jsonResponse({ error: 'Email already registered', code: 'EMAIL_EXISTS' }, 409);
  }

  const passwordHash = await hashPassword(password);
  const { publicKey, secretKey } = generateApiKeys();
  const secretHash = await hashApiKey(secretKey);

  const merchant = await createMerchant(env.DB, {
    email: email.toLowerCase(),
    passwordHash,
    businessName,
    upiId,
    phone: phone || null,
    apiKeyPublic: publicKey,
    apiKeySecretHash: secretHash,
  });

  const token = await signToken({ merchantId: merchant.id, email: merchant.email }, env.JWT_SECRET);

  return jsonResponse({
    token,
    merchant: {
      id: String(merchant.id),
      email: merchant.email,
      businessName: merchant.business_name,
      upiId: merchant.upi_id,
      phone: merchant.phone || undefined,
      apiKeyPublic: merchant.api_key_public,
      createdAt: merchant.created_at,
    },
    apiKeyPublic: publicKey,
    apiKeySecret: secretKey,
  }, 201);
}

async function handleLogin(request, env) {
  const body = await parseJsonBody(request);
  if (!body) return jsonResponse({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, 400);

  const { email, password } = body;
  if (!email || !password) {
    return jsonResponse({ error: 'Missing required fields: email, password', code: 'VALIDATION_ERROR' }, 400);
  }

  const merchant = await findMerchantByEmail(env.DB, email.toLowerCase());
  if (!merchant) {
    return jsonResponse({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401);
  }

  const valid = await comparePassword(password, merchant.password_hash);
  if (!valid) {
    return jsonResponse({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401);
  }

  const token = await signToken({ merchantId: merchant.id, email: merchant.email }, env.JWT_SECRET);

  return jsonResponse({
    token,
    merchant: {
      id: String(merchant.id),
      email: merchant.email,
      businessName: merchant.business_name,
      upiId: merchant.upi_id,
      phone: merchant.phone || undefined,
      apiKeyPublic: merchant.api_key_public,
      createdAt: merchant.created_at,
    },
  });
}

async function handleMe(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  return jsonResponse({
    id: String(merchant.id),
    email: merchant.email,
    businessName: merchant.business_name,
    upiId: merchant.upi_id,
    phone: merchant.phone || undefined,
    apiKeyPublic: merchant.api_key_public,
    createdAt: merchant.created_at,
  });
}
