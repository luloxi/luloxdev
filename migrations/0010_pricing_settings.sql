-- Business amounts editable from /contratar (admin with edit mode on).
-- Additive: one new table, nothing renamed, altered or dropped. The app only
-- writes it with INSERT ... ON CONFLICT DO UPDATE (never DELETE).
-- No rows = the code defaults (PRICING in src/lib/pricing.ts), so the
-- calculator looks exactly the same until the admin saves something.
-- key: one of PRICING_FIELDS in src/lib/pricing-settings.ts (rate_low,
-- rate_medium, rate_high, on_site, travel, urgency, private_project,
-- private_hourly, deposit_pct, discount_s, discount_m, discount_l).
-- value: whole US$ (or whole % for deposit_pct and discount_*). Bounds are
-- checked by the app; an unknown key or bad value falls back to the default.
CREATE TABLE IF NOT EXISTS pricing_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value INTEGER NOT NULL CHECK (typeof(value) = 'integer' AND value >= 0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
