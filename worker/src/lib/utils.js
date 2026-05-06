// ============================================================
// Shared utilities — response helpers
// ============================================================

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function parseJsonBody(request) {
  try {
    const text = await request.text();
    if (!text || text.trim() === '') return {};
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Format a raw D1 transaction row to the API response shape
export function formatTransaction(t) {
  return {
    id: String(t.id),
    transactionId: t.transaction_id,
    merchantId: String(t.merchant_id),
    amount: Number(t.amount),
    currency: t.currency,
    orderId: t.order_id,
    description: t.description || null,
    customerName: t.customer_name || null,
    customerEmail: t.customer_email || null,
    customerPhone: t.customer_phone || null,
    upiIntentUrl: t.upi_intent_url,
    qrCodeDataUrl: t.qr_code_data_url,
    status: t.status,
    merchantNotes: t.merchant_notes || null,
    utrNumber: t.utr_number || null,
    createdAt: t.created_at,
    confirmedAt: t.confirmed_at || null,
    updatedAt: t.updated_at,
  };
}
