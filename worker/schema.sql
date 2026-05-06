-- ============================================================
-- UPI Orchestrator — Cloudflare D1 (SQLite) Schema
-- ============================================================

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  business_name TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  phone TEXT,
  api_key_public TEXT NOT NULL UNIQUE,
  api_key_secret_hash TEXT NOT NULL,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  total_collected INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL UNIQUE,
  merchant_id INTEGER NOT NULL REFERENCES merchants(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  order_id TEXT NOT NULL,
  description TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  upi_intent_url TEXT NOT NULL,
  qr_code_data_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  transaction_hash TEXT NOT NULL,
  merchant_notes TEXT,
  utr_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_status_created
  ON transactions(merchant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id
  ON transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id
  ON transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_transactions_utr_number
  ON transactions(utr_number);
