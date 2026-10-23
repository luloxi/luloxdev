/**
 * D1 side of the editable pricing (table from migrations/0010_pricing_settings.sql).
 * Reads never throw: no binding, a missing table or bad rows fall back to the
 * code defaults (PRICING), field by field.
 */
import { cache } from "react";
import { getDb, nowIso, type D1Database } from "@/lib/db";
import { PRICING, type Pricing } from "@/lib/pricing";
import { mergeStoredPricing, PRICING_KEYS, type PricingValues } from "@/lib/pricing-settings";

export async function loadPricing(db: D1Database | null): Promise<Pricing> {
  if (!db) return PRICING;
  try {
    const { results } = await db.prepare("SELECT key, value FROM pricing_settings").all<{ key: string; value: unknown }>();
    return mergeStoredPricing(results);
  } catch (err) {
    console.error("[pricing] fallback to code defaults:", err);
    return PRICING;
  }
}

/** Per request (React cache): the /contratar page reads it once. Not cached across requests. */
export const getPricing = cache(async () => loadPricing(await getDb()));

/** Upsert every editable key (validated values). Never deletes. */
export async function savePricing(db: D1Database, values: PricingValues): Promise<void> {
  const now = nowIso();
  await db.batch(
    PRICING_KEYS.map((k) =>
      db
        .prepare(
          `INSERT INTO pricing_settings (key, value, updated_at) VALUES (?, ?, ?)
           ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        )
        .bind(k, values[k], now),
    ),
  );
}
