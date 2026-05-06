// ============================================================
// Public Routes — /api/public/*
// No authentication required
// Preserves exact same request/response structure
// ============================================================

import { jsonResponse, parseJsonBody } from '../lib/utils.js';
import {
  findTransactionByTxnId,
  updateTransaction,
  findMerchantById,
} from '../lib/db.js';

export async function handlePublic(request, env, path, method) {
  // POST /api/public/payment/:transactionId/utr
  const utrMatch = path.match(/^\/api\/public\/payment\/([^/]+)\/utr$/);
  if (utrMatch && method === 'POST') {
    return handleSubmitUtr(request, env, utrMatch[1]);
  }

  // GET /api/public/payment/:transactionId
  const getMatch = path.match(/^\/api\/public\/payment\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    return handleGetPublicPayment(request, env, getMatch[1]);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// ---------------------------------------------------------------------------
// POST /api/public/payment/:transactionId/utr — Submit UTR proof
// ---------------------------------------------------------------------------
async function handleSubmitUtr(request, env, transactionId) {
  if (typeof transactionId !== 'string') {
    return jsonResponse({ error: 'Invalid transaction ID' }, 400);
  }

  const body = await parseJsonBody(request);
  const raw = body?.utrNumber;

  if (!raw || typeof raw !== 'string' || raw.length < 6 || raw.length > 22 || !/^[a-zA-Z0-9]+$/.test(raw)) {
    return jsonResponse({ error: 'Invalid UTR number. Must be 6-22 alphanumeric characters.' }, 400);
  }

  const transaction = await findTransactionByTxnId(env.DB, transactionId);
  if (!transaction) {
    return jsonResponse({ error: 'Transaction not found', code: 'NOT_FOUND' }, 404);
  }

  if (transaction.status !== 'PENDING') {
    return jsonResponse({ error: 'This payment has already been processed.', code: 'ALREADY_PROCESSED' }, 400);
  }

  await updateTransaction(env.DB, transaction.id, { utrNumber: raw });

  return jsonResponse({ message: 'Payment proof submitted successfully. The merchant will verify and confirm shortly.' });
}

// ---------------------------------------------------------------------------
// GET /api/public/payment/:transactionId — Get public payment details
// ---------------------------------------------------------------------------
async function handleGetPublicPayment(request, env, transactionId) {
  const transaction = await findTransactionByTxnId(env.DB, transactionId);
  if (!transaction) {
    return jsonResponse({ error: 'Transaction not found', code: 'NOT_FOUND' }, 404);
  }

  const merchant = await findMerchantById(env.DB, transaction.merchant_id);

  return jsonResponse({
    transactionId: transaction.transaction_id,
    amount: Number(transaction.amount),
    currency: transaction.currency,
    merchantName: merchant?.business_name || 'Merchant',
    orderId: transaction.order_id,
    description: transaction.description,
    status: transaction.status,
    qrCodeDataUrl: transaction.qr_code_data_url,
    upiIntentUrl: transaction.upi_intent_url,
    utrNumber: transaction.utr_number,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
  });
}
