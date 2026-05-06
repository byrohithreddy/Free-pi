// ============================================================
// Middleware — JWT Authentication & API Key Authentication
// ============================================================

import { verifyToken, compareApiKey } from '../lib/auth.js';
import { findMerchantById, getAllMerchants } from '../lib/db.js';
import { jsonResponse } from '../lib/utils.js';

export async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: jsonResponse({ error: 'Missing or invalid authorization header' }, 401) };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verifyToken(token, env.JWT_SECRET);
    const merchant = await findMerchantById(env.DB, decoded.merchantId);

    if (!merchant) {
      return { error: jsonResponse({ error: 'Merchant not found' }, 401) };
    }

    return { merchant };
  } catch {
    return { error: jsonResponse({ error: 'Invalid or expired token' }, 401) };
  }
}

export async function apiKeyOrJwtAuth(request, env) {
  const apiKey = request.headers.get('X-API-Key');

  if (apiKey) {
    if (!apiKey.startsWith('sk_live_')) {
      return { error: jsonResponse({ error: 'Missing or invalid API key. Use sk_live_ secret key.' }, 401) };
    }

    const merchants = await getAllMerchants(env.DB);
    let foundMerchant = null;
    for (const merchant of merchants) {
      const match = await compareApiKey(apiKey, merchant.api_key_secret_hash);
      if (match) {
        foundMerchant = merchant;
        break;
      }
    }

    if (!foundMerchant) {
      return { error: jsonResponse({ error: 'Invalid API key' }, 401) };
    }

    return { merchant: foundMerchant };
  }

  // Fall back to JWT
  return authenticate(request, env);
}
