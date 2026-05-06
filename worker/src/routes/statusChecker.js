// ============================================================
// Status Checker Route — /api/check-status
// Preserves exact same request/response structure
// ============================================================

import { jsonResponse, parseJsonBody } from '../lib/utils.js';
import { findTransactionByOrderId } from '../lib/db.js';

const ORDER_ID_PATTERN = /^[a-zA-Z0-9_\-\.]{1,100}$/;

export async function handleStatusChecker(request, env) {
  const body = await parseJsonBody(request);
  const raw = body?.order_id;

  if (!raw || typeof raw !== 'string') {
    return jsonResponse({ error: 'order_id is required.' }, 400);
  }

  const orderId = raw.trim();

  if (!ORDER_ID_PATTERN.test(orderId)) {
    return jsonResponse({ error: 'Invalid order_id format.' }, 400);
  }

  const transaction = await findTransactionByOrderId(env.DB, orderId);
  if (!transaction) {
    return jsonResponse({ error: 'Order not found' }, 404);
  }

  return jsonResponse({
    status: transaction.status,
    created_at: transaction.created_at,
  });
}
