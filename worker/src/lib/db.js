// ============================================================
// D1 Database helper — replaces Drizzle ORM with raw D1 SQL
// ============================================================

// All queries use ? placeholders (SQLite/D1 style)

// ---------------------------------------------------------------------------
// Merchants
// ---------------------------------------------------------------------------

export async function findMerchantByEmail(db, email) {
  const result = await db.prepare('SELECT * FROM merchants WHERE email = ?').bind(email).first();
  return result || null;
}

export async function findMerchantById(db, id) {
  const result = await db.prepare('SELECT * FROM merchants WHERE id = ?').bind(id).first();
  return result || null;
}

export async function findMerchantByPublicKey(db, publicKey) {
  const result = await db.prepare('SELECT * FROM merchants WHERE api_key_public = ?').bind(publicKey).first();
  return result || null;
}

export async function getAllMerchants(db) {
  const result = await db.prepare('SELECT * FROM merchants').all();
  return result.results || [];
}

export async function createMerchant(db, data) {
  const result = await db.prepare(`
    INSERT INTO merchants (email, password_hash, business_name, upi_id, phone, api_key_public, api_key_secret_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    data.email,
    data.passwordHash,
    data.businessName,
    data.upiId,
    data.phone || null,
    data.apiKeyPublic,
    data.apiKeySecretHash,
  ).first();
  return result;
}

export async function updateMerchant(db, id, updates) {
  const sets = [];
  const values = [];

  if (updates.businessName !== undefined) { sets.push('business_name = ?'); values.push(updates.businessName); }
  if (updates.upiId !== undefined) { sets.push('upi_id = ?'); values.push(updates.upiId); }
  if (updates.passwordHash !== undefined) { sets.push('password_hash = ?'); values.push(updates.passwordHash); }
  if (updates.apiKeyPublic !== undefined) { sets.push('api_key_public = ?'); values.push(updates.apiKeyPublic); }
  if (updates.apiKeySecretHash !== undefined) { sets.push('api_key_secret_hash = ?'); values.push(updates.apiKeySecretHash); }
  if (updates.totalTransactions !== undefined) { sets.push('total_transactions = ?'); values.push(updates.totalTransactions); }
  if (updates.totalCollected !== undefined) { sets.push('total_collected = ?'); values.push(updates.totalCollected); }

  sets.push("updated_at = datetime('now')");
  values.push(id);

  const sql = `UPDATE merchants SET ${sets.join(', ')} WHERE id = ? RETURNING *`;
  const result = await db.prepare(sql).bind(...values).first();
  return result;
}

export async function incrementMerchantTransactions(db, id) {
  await db.prepare(`
    UPDATE merchants SET total_transactions = total_transactions + 1, updated_at = datetime('now') WHERE id = ?
  `).bind(id).run();
}

export async function addMerchantCollected(db, id, amount) {
  await db.prepare(`
    UPDATE merchants SET total_collected = total_collected + ?, updated_at = datetime('now') WHERE id = ?
  `).bind(amount, id).run();
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export async function createTransaction(db, data) {
  const result = await db.prepare(`
    INSERT INTO transactions (
      transaction_id, merchant_id, amount, currency, order_id, description,
      customer_name, customer_email, customer_phone, upi_intent_url,
      qr_code_data_url, status, transaction_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    data.transactionId,
    data.merchantId,
    data.amount,
    data.currency || 'INR',
    data.orderId,
    data.description || null,
    data.customerName || null,
    data.customerEmail || null,
    data.customerPhone || null,
    data.upiIntentUrl,
    data.qrCodeDataUrl,
    data.status || 'PENDING',
    data.transactionHash,
  ).first();
  return result;
}

export async function findTransactionByTxnId(db, transactionId) {
  const result = await db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').bind(transactionId).first();
  return result || null;
}

export async function findTransactionByTxnIdAndMerchant(db, transactionId, merchantId) {
  const result = await db.prepare(
    'SELECT * FROM transactions WHERE transaction_id = ? AND merchant_id = ?'
  ).bind(transactionId, merchantId).first();
  return result || null;
}

export async function findPendingTransactionByUtr(db, merchantId, utrNumber) {
  const result = await db.prepare(
    "SELECT * FROM transactions WHERE merchant_id = ? AND status = 'PENDING' AND utr_number = ?"
  ).bind(merchantId, utrNumber).first();
  return result || null;
}

export async function updateTransaction(db, id, updates) {
  const sets = [];
  const values = [];

  if (updates.status !== undefined) { sets.push('status = ?'); values.push(updates.status); }
  if (updates.confirmedAt !== undefined) { sets.push('confirmed_at = ?'); values.push(updates.confirmedAt); }
  if (updates.merchantNotes !== undefined) { sets.push('merchant_notes = ?'); values.push(updates.merchantNotes); }
  if (updates.utrNumber !== undefined) { sets.push('utr_number = ?'); values.push(updates.utrNumber); }

  sets.push("updated_at = datetime('now')");
  values.push(id);

  const sql = `UPDATE transactions SET ${sets.join(', ')} WHERE id = ? RETURNING *`;
  const result = await db.prepare(sql).bind(...values).first();
  return result;
}

export async function listTransactions(db, merchantId, { status, search, page = 1, limit = 50 }) {
  let whereClauses = ['merchant_id = ?'];
  let countClauses = ['merchant_id = ?'];
  let params = [merchantId];
  let countParams = [merchantId];

  if (status) {
    whereClauses.push('status = ?');
    countClauses.push('status = ?');
    params.push(status);
    countParams.push(status);
  }

  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push('(transaction_id LIKE ? OR customer_name LIKE ? OR order_id LIKE ?)');
    countClauses.push('(transaction_id LIKE ? OR customer_name LIKE ? OR order_id LIKE ?)');
    params.push(searchPattern, searchPattern, searchPattern);
    countParams.push(searchPattern, searchPattern, searchPattern);
  }

  const whereStr = whereClauses.join(' AND ');
  const offset = (page - 1) * limit;

  params.push(limit, offset);

  const [transactions, countResult] = await Promise.all([
    db.prepare(`SELECT * FROM transactions WHERE ${whereStr} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...params).all(),
    db.prepare(`SELECT COUNT(*) as total FROM transactions WHERE ${whereStr}`)
      .bind(...countParams).first(),
  ]);

  return {
    transactions: transactions.results || [],
    total: countResult?.total || 0,
  };
}

export async function findTransactionByOrderId(db, orderId) {
  const result = await db.prepare(
    'SELECT status, created_at FROM transactions WHERE order_id = ? LIMIT 1'
  ).bind(orderId).first();
  return result || null;
}

// ---------------------------------------------------------------------------
// Merchant Stats queries
// ---------------------------------------------------------------------------

export async function getMerchantStats(db, merchantId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayStr = startOfToday.toISOString();

  const [pendingResult, confirmedTodayResult, rejectedResult, allConfirmedResult, totalCountResult, recentTxns] =
    await Promise.all([
      db.prepare("SELECT COUNT(*) as value FROM transactions WHERE merchant_id = ? AND status = 'PENDING'")
        .bind(merchantId).first(),
      db.prepare("SELECT COUNT(*) as value FROM transactions WHERE merchant_id = ? AND status = 'CONFIRMED' AND confirmed_at >= ?")
        .bind(merchantId, todayStr).first(),
      db.prepare("SELECT COUNT(*) as value FROM transactions WHERE merchant_id = ? AND status = 'REJECTED'")
        .bind(merchantId).first(),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as value FROM transactions WHERE merchant_id = ? AND status = 'CONFIRMED'")
        .bind(merchantId).first(),
      db.prepare('SELECT COUNT(*) as value FROM transactions WHERE merchant_id = ?')
        .bind(merchantId).first(),
      db.prepare('SELECT * FROM transactions WHERE merchant_id = ? ORDER BY created_at DESC LIMIT 5')
        .bind(merchantId).all(),
    ]);

  return {
    pendingCount: pendingResult?.value || 0,
    confirmedToday: confirmedTodayResult?.value || 0,
    rejectedCount: rejectedResult?.value || 0,
    totalCollected: allConfirmedResult?.value || 0,
    totalTransactions: totalCountResult?.value || 0,
    recentTransactions: recentTxns?.results || [],
  };
}
