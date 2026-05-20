// ============================================================
// Merchant Routes — /api/merchant/*
// Preserves exact same request/response structure
// ============================================================

import { jsonResponse, parseJsonBody, formatTransaction } from '../lib/utils.js';
import {
  generateApiKeys,
  hashApiKey,
  hashPassword,
  comparePassword,
} from '../lib/auth.js';
import {
  updateMerchant,
  getMerchantStats,
  getSystemGrowthStats,
} from '../lib/db.js';
import { authenticate } from '../middleware/auth.js';

export async function handleMerchant(request, env, path, method) {
  // GET /api/merchant/stats
  if (path === '/api/merchant/stats' && method === 'GET') {
    return handleStats(request, env);
  }

  // GET /api/merchant/admin-growth
  if (path === '/api/merchant/admin-growth' && method === 'GET') {
    return handleAdminGrowth(request, env);
  }

  // PUT /api/merchant/profile
  if (path === '/api/merchant/profile' && method === 'PUT') {
    return handleUpdateProfile(request, env);
  }

  // POST /api/merchant/api-keys/regenerate
  if (path === '/api/merchant/api-keys/regenerate' && method === 'POST') {
    return handleRegenerateKeys(request, env);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// ---------------------------------------------------------------------------
// GET /api/merchant/admin-growth
// ---------------------------------------------------------------------------
async function handleAdminGrowth(request, env) {
  if (!isAdminGrowthAuthorized(request, env)) {
    return jsonResponse({ error: 'Invalid admin credentials', code: 'ADMIN_UNAUTHORIZED' }, 401);
  }

  const stats = await getSystemGrowthStats(env.DB);
  return jsonResponse(stats);
}

function isAdminGrowthAuthorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Basic ')) return false;

  try {
    const decoded = atob(header.slice(6));
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    const expectedUsername = env.ADMIN_GROWTH_USERNAME || 'Brucewayne';
    const expectedPassword = env.ADMIN_GROWTH_PASSWORD || 'Hemaraju@0322';

    return username === expectedUsername && password === expectedPassword;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// GET /api/merchant/stats
// ---------------------------------------------------------------------------
async function handleStats(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const stats = await getMerchantStats(env.DB, merchant.id);

  const totalTransactions = stats.totalTransactions;
  const pendingCount = stats.pendingCount;
  const confirmedCount = totalTransactions - pendingCount;
  const successRate = totalTransactions > 0 ? (confirmedCount / totalTransactions) * 100 : 0;

  return jsonResponse({
    totalCollected: stats.totalCollected,
    pendingCount: stats.pendingCount,
    confirmedToday: stats.confirmedToday,
    rejectedCount: stats.rejectedCount,
    successRate: Math.round(successRate * 10) / 10,
    totalTransactions: stats.totalTransactions,
    recentTransactions: stats.recentTransactions.map(formatTransaction),
  });
}

// ---------------------------------------------------------------------------
// PUT /api/merchant/profile
// ---------------------------------------------------------------------------
async function handleUpdateProfile(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const body = await parseJsonBody(request);
  if (!body) return jsonResponse({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, 400);

  const { businessName, upiId, currentPassword, newPassword } = body;

  const updates = {};

  if (businessName) updates.businessName = businessName;
  if (upiId) {
    const upiRegex = /^[a-zA-Z0-9._]+@[a-zA-Z]+$/;
    if (!upiRegex.test(upiId)) {
      return jsonResponse({ error: 'Invalid UPI ID format', code: 'INVALID_UPI_ID' }, 400);
    }
    updates.upiId = upiId;
  }

  if (newPassword) {
    if (!currentPassword) {
      return jsonResponse({ error: 'Current password required to change password', code: 'CURRENT_PASSWORD_REQUIRED' }, 400);
    }
    const valid = await comparePassword(currentPassword, merchant.password_hash);
    if (!valid) {
      return jsonResponse({ error: 'Current password is incorrect', code: 'WRONG_PASSWORD' }, 400);
    }
    if (newPassword.length < 8) {
      return jsonResponse({ error: 'New password must be at least 8 characters', code: 'PASSWORD_TOO_SHORT' }, 400);
    }
    updates.passwordHash = await hashPassword(newPassword);
  }

  const updated = await updateMerchant(env.DB, merchant.id, updates);

  return jsonResponse({
    id: String(updated.id),
    email: updated.email,
    businessName: updated.business_name,
    upiId: updated.upi_id,
    phone: updated.phone,
    apiKeyPublic: updated.api_key_public,
    createdAt: updated.created_at,
  });
}

// ---------------------------------------------------------------------------
// POST /api/merchant/api-keys/regenerate
// ---------------------------------------------------------------------------
async function handleRegenerateKeys(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const { publicKey, secretKey } = generateApiKeys();
  const secretHash = await hashApiKey(secretKey);

  await updateMerchant(env.DB, merchant.id, {
    apiKeyPublic: publicKey,
    apiKeySecretHash: secretHash,
  });

  return jsonResponse({
    apiKeyPublic: publicKey,
    apiKeySecret: secretKey,
  });
}
