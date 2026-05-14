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
  // POST /api/public/payment/:transactionId/customer
  const customerMatch = path.match(/^\/api\/public\/payment\/([^/]+)\/customer$/);
  if (customerMatch && method === 'POST') {
    return handleSaveCustomerDetails(request, env, customerMatch[1]);
  }

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

function validateCustomerDetails(body) {
  const customerName = body?.customerName;
  const customerEmail = body?.customerEmail;

  if (!customerName || typeof customerName !== 'string') {
    return { error: 'Customer name is required.' };
  }

  const trimmedName = customerName.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100 || !/^[A-Za-z ]+$/.test(trimmedName)) {
    return { error: 'Invalid customer name. Use 2-100 letters and spaces only.' };
  }

  if (!customerEmail || typeof customerEmail !== 'string') {
    return { error: 'Customer email is required.' };
  }

  const trimmedEmail = customerEmail.trim();
  if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: 'Invalid customer email address.' };
  }

  return { customerName: trimmedName, customerEmail: trimmedEmail };
}

async function findPendingPublicTransaction(db, transactionId) {
  const transaction = await findTransactionByTxnId(db, transactionId);
  if (!transaction) {
    return { error: jsonResponse({ error: 'Transaction not found', code: 'NOT_FOUND' }, 404) };
  }

  if (transaction.status !== 'PENDING') {
    return { error: jsonResponse({ error: 'This payment has already been processed.', code: 'ALREADY_PROCESSED' }, 400) };
  }

  return { transaction };
}

// ---------------------------------------------------------------------------
// POST /api/public/payment/:transactionId/customer — Save customer details
// ---------------------------------------------------------------------------
async function handleSaveCustomerDetails(request, env, transactionId) {
  if (typeof transactionId !== 'string') {
    return jsonResponse({ error: 'Invalid transaction ID' }, 400);
  }

  const body = await parseJsonBody(request);
  if (!body) return jsonResponse({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, 400);

  const validated = validateCustomerDetails(body);
  if (validated.error) return jsonResponse({ error: validated.error }, 400);

  const lookup = await findPendingPublicTransaction(env.DB, transactionId);
  if (lookup.error) return lookup.error;

  await updateTransaction(env.DB, lookup.transaction.id, {
    customerName: validated.customerName,
    customerEmail: validated.customerEmail,
  });

  return jsonResponse({
    message: 'Customer details saved successfully.',
    customerName: validated.customerName,
    customerEmail: validated.customerEmail,
  });
}

// ---------------------------------------------------------------------------
// POST /api/public/payment/:transactionId/utr — Submit UTR proof
// ---------------------------------------------------------------------------
async function handleSubmitUtr(request, env, transactionId) {
  if (typeof transactionId !== 'string') {
    return jsonResponse({ error: 'Invalid transaction ID' }, 400);
  }

  const body = await parseJsonBody(request);
  if (!body) return jsonResponse({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }, 400);

  const raw = body?.utrNumber;
  const validated = validateCustomerDetails(body);

  if (!raw || typeof raw !== 'string' || raw.length < 6 || raw.length > 22 || !/^[a-zA-Z0-9]+$/.test(raw)) {
    return jsonResponse({ error: 'Invalid UTR number. Must be 6-22 alphanumeric characters.' }, 400);
  }

  if (validated.error) return jsonResponse({ error: validated.error }, 400);

  const lookup = await findPendingPublicTransaction(env.DB, transactionId);
  if (lookup.error) return lookup.error;

  await updateTransaction(env.DB, lookup.transaction.id, {
    utrNumber: raw,
    customerName: validated.customerName,
    customerEmail: validated.customerEmail,
  });

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
    customerName: transaction.customer_name,
    customerEmail: transaction.customer_email,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
  });
}
