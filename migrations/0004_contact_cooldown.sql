-- Contact form: 1 successful send per 24h. Only HMAC-SHA256 hashes are stored
-- (of IP, browser fingerprint, client id, requester email), never raw values.
CREATE TABLE IF NOT EXISTS contact_cooldown (
  key_hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  until_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_cooldown_until ON contact_cooldown (until_ms);
