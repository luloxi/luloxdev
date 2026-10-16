import { getDb } from "@/lib/db";

export const COOLDOWN_MS = 24 * 60 * 60 * 1000;

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type Ids = { ip?: string; fp?: string; cid?: string; email?: string };

async function hashes(secret: string, ids: Ids) {
  const out: { kind: string; hash: string }[] = [];
  for (const [kind, raw] of Object.entries(ids)) {
    const v = typeof raw === "string" ? raw.trim().toLowerCase().slice(0, 200) : "";
    if (!v || v === "unknown") continue;
    out.push({ kind, hash: await hmac(secret, `${kind}:${v}`) });
  }
  return out;
}

/** Latest "allowed again" time (ms) if any id is still cooling down, else null. */
export async function cooldownUntil(secret: string, ids: Ids): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const hs = await hashes(secret, ids);
  if (hs.length === 0) return null;
  const now = Date.now();
  const placeholders = hs.map(() => "?").join(",");
  const row = await db
    .prepare(
      `SELECT MAX(until_ms) AS u FROM contact_cooldown WHERE until_ms > ? AND key_hash IN (${placeholders})`,
    )
    .bind(now, ...hs.map((h) => h.hash))
    .first<{ u: number | null }>();
  return row?.u ? Number(row.u) : null;
}

export async function startCooldown(secret: string, ids: Ids): Promise<number> {
  const until = Date.now() + COOLDOWN_MS;
  const db = await getDb();
  if (!db) return until;
  const hs = await hashes(secret, ids);
  await db.batch([
    db.prepare("DELETE FROM contact_cooldown WHERE until_ms < ?").bind(Date.now()),
    ...hs.map((h) =>
      db
        .prepare(
          "INSERT INTO contact_cooldown (key_hash, kind, until_ms) VALUES (?, ?, ?) ON CONFLICT (key_hash) DO UPDATE SET until_ms = excluded.until_ms",
        )
        .bind(h.hash, h.kind, until),
    ),
  ]);
  return until;
}
