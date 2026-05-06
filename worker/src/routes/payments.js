// ============================================================
// Payment Routes — /api/payments*
// Preserves exact same request/response structure
// QR code uses external API instead of Node.js qrcode library
// ============================================================

import { jsonResponse, parseJsonBody, formatTransaction } from '../lib/utils.js';
import {
  generateTransactionId,
  generateTransactionHash,
  generateUPIIntentURLs,
} from '../lib/auth.js';
import {
  createTransaction,
  findTransactionByTxnIdAndMerchant,
  findPendingTransactionByUtr,
  updateTransaction,
  listTransactions,
  incrementMerchantTransactions,
  addMerchantCollected,
} from '../lib/db.js';
import { authenticate, apiKeyOrJwtAuth } from '../middleware/auth.js';

export async function handlePayments(request, env, path, method) {
  // POST /api/payments — Create payment
  if (path === '/api/payments' && method === 'POST') {
    return handleCreatePayment(request, env);
  }

  // GET /api/payments — List payments
  if (path === '/api/payments' && method === 'GET') {
    return handleListPayments(request, env);
  }

  // POST /api/payments/confirm-by-utr — Confirm by UTR
  if (path === '/api/payments/confirm-by-utr' && method === 'POST') {
    return handleConfirmByUtr(request, env);
  }

  // POST /api/payments/:transactionId/confirm
  const confirmMatch = path.match(/^\/api\/payments\/([^/]+)\/confirm$/);
  if (confirmMatch && method === 'POST') {
    return handleConfirmPayment(request, env, confirmMatch[1]);
  }

  // POST /api/payments/:transactionId/reject
  const rejectMatch = path.match(/^\/api\/payments\/([^/]+)\/reject$/);
  if (rejectMatch && method === 'POST') {
    return handleRejectPayment(request, env, rejectMatch[1]);
  }

  // GET /api/payments/:transactionId — Get single payment
  const getMatch = path.match(/^\/api\/payments\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    return handleGetPayment(request, env, getMatch[1]);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// ---------------------------------------------------------------------------
// POST /api/payments — Create payment request
// ---------------------------------------------------------------------------
async function handleCreatePayment(request, env) {
  const auth = await apiKeyOrJwtAuth(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const body = await parseJsonBody(request);
  if (!body) return jsonResponse({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, 400);

  const { amount, orderId, description, customerName, customerEmail, customerPhone } = body;

  if (!amount || !orderId) {
    return jsonResponse({ error: 'Missing required fields: amount, orderId', code: 'VALIDATION_ERROR' }, 400);
  }

  if (typeof amount !== 'number' || amount < 100 || amount > 10000000) {
    return jsonResponse({ error: 'Amount must be between 100 and 10000000 paise', code: 'VALIDATION_ERROR' }, 400);
  }

  const transactionId = generateTransactionId();
  const timestamp = Date.now();
  const transactionHash = await generateTransactionHash(
    merchant.id, amount, orderId, transactionId, timestamp, env.TRANSACTION_SECRET
  );

  const upiUrls = generateUPIIntentURLs(
    merchant.upi_id, merchant.business_name, amount, orderId, transactionId
  );
  const upiIntentUrl = upiUrls.generic;

  // Use external QR code API instead of Node.js qrcode library
  const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentUrl)}`;

  const transaction = await createTransaction(env.DB, {
    transactionId,
    merchantId: merchant.id,
    amount,
    currency: 'INR',
    orderId,
    description: description || null,
    customerName: customerName || null,
    customerEmail: customerEmail || null,
    customerPhone: customerPhone || null,
    upiIntentUrl,
    qrCodeDataUrl,
    status: 'PENDING',
    transactionHash,
  });

  await incrementMerchantTransactions(env.DB, merchant.id);

  const baseUrl = env.FRONTEND_URL || '';
  const paymentUrl = `${baseUrl}/pay/${transactionId}`;

  return jsonResponse({
    transactionId: transaction.transaction_id,
    paymentUrl,
    qrCodeDataUrl,
    upiIntentUrl,
    status: transaction.status,
  }, 201);
}

// ---------------------------------------------------------------------------
// GET /api/payments — List payments
// ---------------------------------------------------------------------------
async function handleListPayments(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const search = url.searchParams.get('search') || undefined;

  const { transactions, total } = await listTransactions(env.DB, merchant.id, {
    status,
    search,
    page,
    limit,
  });

  return jsonResponse({
    transactions: transactions.map(formatTransaction),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// ---------------------------------------------------------------------------
// GET /api/payments/:transactionId — Get single payment
// ---------------------------------------------------------------------------
async function handleGetPayment(request, env, transactionId) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const transaction = await findTransactionByTxnIdAndMerchant(env.DB, transactionId, merchant.id);
  if (!transaction) {
    return jsonResponse({ error: 'Transaction not found', code: 'NOT_FOUND' }, 404);
  }

  return jsonResponse(formatTransaction(transaction));
}

// ---------------------------------------------------------------------------
// POST /api/payments/:transactionId/confirm — Confirm payment
// ---------------------------------------------------------------------------
async function handleConfirmPayment(request, env, transactionId) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const body = await parseJsonBody(request);

  const transaction = await findTransactionByTxnIdAndMerchant(env.DB, transactionId, merchant.id);
  if (!transaction) {
    return jsonResponse({ error: 'Transaction not found', code: 'NOT_FOUND' }, 404);
  }

  if (transaction.status !== 'PENDING') {
    return jsonResponse({ error: `Transaction is already ${transaction.status}`, code: 'ALREADY_PROCESSED' }, 400);
  }

  // UTR Matching Logic
  const merchantUtr = body?.utrNumber;
  const customerUtr = transaction.utr_number;

  if (merchantUtr && customerUtr && merchantUtr !== customerUtr) {
    return jsonResponse({
      error: 'UTR mismatch. The UTR provided by the customer does not match your entry.',
      code: 'UTR_MISMATCH',
    }, 400);
  }

  const updated = await updateTransaction(env.DB, transaction.id, {
    status: 'CONFIRMED',
    confirmedAt: new Date().toISOString(),
    merchantNotes: body?.notes || null,
    utrNumber: merchantUtr || customerUtr || null,
  });

  await addMerchantCollected(env.DB, merchant.id, transaction.amount);

  return jsonResponse(formatTransaction(updated));
}

// ---------------------------------------------------------------------------
// POST /api/payments/confirm-by-utr — Confirm by UTR match
// ---------------------------------------------------------------------------
async function handleConfirmByUtr(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const body = await parseJsonBody(request);
  const { utrNumber } = body || {};

  if (!utrNumber || typeof utrNumber !== 'string') {
    return jsonResponse({ error: 'UTR number is required' }, 400);
  }

  const transaction = await findPendingTransactionByUtr(env.DB, merchant.id, utrNumber);
  if (!transaction) {
    return jsonResponse({
      error: 'No pending transaction found with this UTR number. Please verify if the customer has submitted the proof.',
      code: 'UTR_NOT_FOUND',
    }, 404);
  }

  const updated = await updateTransaction(env.DB, transaction.id, {
    status: 'CONFIRMED',
    confirmedAt: new Date().toISOString(),
    merchantNotes: 'Automatically confirmed via UTR match',
  });

  await addMerchantCollected(env.DB, merchant.id, transaction.amount);

  return jsonResponse({
    message: 'Payment automatically confirmed via UTR match!',
    transaction: formatTransaction(updated),
  });
}

// ---------------------------------------------------------------------------
// POST /api/payments/:transactionId/reject — Reject payment
// ---------------------------------------------------------------------------
async function handleRejectPayment(request, env, transactionId) {
  const auth = await authenticate(request, env);
  if (auth.error) return auth.error;
  const merchant = auth.merchant;

  const body = await parseJsonBody(request);

  const transaction = await findTransactionByTxnIdAndMerchant(env.DB, transactionId, merchant.id);
  if (!transaction) {
    return jsonResponse({ error: 'Transaction not found', code: 'NOT_FOUND' }, 404);
  }

  if (transaction.status !== 'PENDING') {
    return jsonResponse({ error: `Transaction is already ${transaction.status}`, code: 'ALREADY_PROCESSED' }, 400);
  }

  const updated = await updateTransaction(env.DB, transaction.id, {
    status: 'REJECTED',
    merchantNotes: body?.notes || null,
  });

  return jsonResponse(formatTransaction(updated));
}
