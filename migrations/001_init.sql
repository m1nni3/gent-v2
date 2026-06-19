-- Migration 001: Create properties, transactions, contacts tables
-- Run: npx wrangler d1 execute gent-v2-db --file=migrations/001_init.sql

CREATE TABLE IF NOT EXISTS properties (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  address     TEXT,
  type        TEXT NOT NULL DEFAULT 'Single Family',
  value       INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'Occupied',
  region      TEXT DEFAULT 'Other',
  added_date  TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  property    TEXT,
  type        TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  amount      INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  date        TEXT NOT NULL DEFAULT (date('now')),
  contact     TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'Tenant',
  property    TEXT
);

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role);
