-- Referral program: whoever brings a client earns 15% of what that client pays.
-- Additive: three new tables and indexes, nothing renamed, altered or dropped.

-- One row per referrer. code: lowercase, a-z 0-9 and inner hyphens, 3-24 chars
-- (validated in src/lib/referrals.ts), unique. user_id: Better Auth "user".id of
-- the Google account that created it (nullable, unique when set: one code per account).
-- active = 0 pauses the code (new ?ref= links and leads stop counting) without deleting anything.
CREATE TABLE IF NOT EXISTS referrers (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK (length(code) BETWEEN 3 AND 24 AND code = lower(code)),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  user_id TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS referrers_user_id ON referrers (user_id) WHERE user_id IS NOT NULL;

-- Every message sent from /contratar (/en/hire), with the budget recomputed on
-- the server. ref_code / referrer_id: the validated, active referrer at send
-- time (NULL = no referral).
CREATE TABLE IF NOT EXISTS hire_leads (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  budget_json TEXT NOT NULL,
  total_usd INTEGER NOT NULL,
  ref_code TEXT,
  referrer_id TEXT REFERENCES referrers (id)
);
CREATE INDEX IF NOT EXISTS hire_leads_referrer ON hire_leads (referrer_id, created_at);

-- What the client paid for a lead and the 15% owed to its referrer (one row per lead).
-- Amounts in cents of the currency. payout_cents is computed by the server
-- (round(amount_cents * 15 / 100)), never sent by the browser.
CREATE TABLE IF NOT EXISTS referral_payouts (
  lead_id TEXT PRIMARY KEY NOT NULL REFERENCES hire_leads (id),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  payout_cents INTEGER NOT NULL CHECK (payout_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
