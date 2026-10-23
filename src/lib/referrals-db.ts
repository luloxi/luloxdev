/**
 * D1 side of the referral program (tables from migrations/0009_referrals.sql).
 * Every function takes the D1 handle, so tests run them against SQLite.
 * Pure SQL, no Next imports.
 */
import type { D1Database } from "@/lib/db";
import { payoutCents, payoutTotals, type Currency, type PayoutStatus, type Totals } from "@/lib/referrals";

export type Referrer = {
  id: string;
  code: string;
  name: string;
  email: string;
  whatsapp: string | null;
  user_id: string | null;
  active: number;
  created_at: string;
};

export type Payout = { lead_id: string; currency: Currency; amount_cents: number; payout_cents: number; status: PayoutStatus; paid_at: string | null };

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  total_usd: number;
  ref_code: string | null;
  referrer_id: string | null;
  payout: Payout | null;
};

const now = () => new Date().toISOString();
const COLS = "id, code, name, email, whatsapp, user_id, active, created_at";

export async function getReferrerByCode(db: D1Database, code: string): Promise<Referrer | null> {
  return db.prepare(`SELECT ${COLS} FROM referrers WHERE code = ?`).bind(code.toLowerCase()).first<Referrer>();
}

/** Active referrer for a code (attribution: cookie, hire form). */
export async function getActiveReferrer(db: D1Database, code: string): Promise<Referrer | null> {
  const r = await getReferrerByCode(db, code);
  return r && r.active ? r : null;
}

/** The viewer's own referrer row: always looked up by the session user id, never by a client value. */
export async function getReferrerByUserId(db: D1Database, userId: string): Promise<Referrer | null> {
  return db.prepare(`SELECT ${COLS} FROM referrers WHERE user_id = ?`).bind(userId).first<Referrer>();
}

export type NewReferrer = { name: string; email: string; whatsapp: string | null; code: string; userId: string | null };

/** Insert; returns "taken" when the code (or the account) already has a row. */
export async function createReferrer(db: D1Database, r: NewReferrer, id = crypto.randomUUID()): Promise<{ ok: true; id: string } | { ok: false; error: "code_taken" | "already_has_code" }> {
  try {
    const t = now();
    await db
      .prepare("INSERT INTO referrers (id, code, name, email, whatsapp, user_id, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)")
      .bind(id, r.code.toLowerCase(), r.name, r.email, r.whatsapp, r.userId, t, t)
      .run();
    return { ok: true, id };
  } catch (err) {
    const msg = String((err as Error)?.message ?? err);
    if (/UNIQUE/i.test(msg)) return { ok: false, error: /user_id/i.test(msg) ? "already_has_code" : "code_taken" };
    throw err;
  }
}

export async function setReferrerActive(db: D1Database, id: string, active: boolean): Promise<boolean> {
  const before = await db.prepare("SELECT id FROM referrers WHERE id = ?").bind(id).first();
  if (!before) return false;
  await db.prepare("UPDATE referrers SET active = ?, updated_at = ? WHERE id = ?").bind(active ? 1 : 0, now(), id).run();
  return true;
}

export type NewLead = { name: string; email: string; message: string; budgetJson: string; totalUsd: number; refCode: string | null; referrerId: string | null };

export async function insertLead(db: D1Database, l: NewLead, id = crypto.randomUUID()): Promise<string> {
  await db
    .prepare("INSERT INTO hire_leads (id, created_at, name, email, message, budget_json, total_usd, ref_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, now(), l.name, l.email, l.message, l.budgetJson, Math.round(l.totalUsd), l.refCode, l.referrerId)
    .run();
  return id;
}

type LeadRow = Omit<Lead, "payout"> & { p_currency: Currency | null; amount_cents: number | null; payout_cents: number | null; status: PayoutStatus | null; paid_at: string | null };

const LEAD_SQL = `SELECT l.id, l.created_at, l.name, l.email, l.message, l.total_usd, l.ref_code, l.referrer_id,
  p.currency AS p_currency, p.amount_cents, p.payout_cents, p.status, p.paid_at
  FROM hire_leads l LEFT JOIN referral_payouts p ON p.lead_id = l.id`;

const toLead = (r: LeadRow): Lead => ({
  id: r.id,
  created_at: r.created_at,
  name: r.name,
  email: r.email,
  message: r.message,
  total_usd: r.total_usd,
  ref_code: r.ref_code,
  referrer_id: r.referrer_id,
  payout: r.p_currency
    ? { lead_id: r.id, currency: r.p_currency, amount_cents: Number(r.amount_cents), payout_cents: Number(r.payout_cents), status: r.status ?? "pending", paid_at: r.paid_at }
    : null,
});

export type ReferrerWithLeads = Referrer & { leads: Lead[]; totals: Totals };

/** Admin: every referrer (newest first) with its leads and owed/paid totals per currency. */
export async function listReferrersWithLeads(db: D1Database): Promise<ReferrerWithLeads[]> {
  const [{ results: refs }, { results: leads }] = await Promise.all([
    db.prepare(`SELECT ${COLS} FROM referrers ORDER BY created_at DESC`).all<Referrer>(),
    db.prepare(`${LEAD_SQL} WHERE l.referrer_id IS NOT NULL ORDER BY l.created_at DESC`).all<LeadRow>(),
  ]);
  const byRef = new Map<string, Lead[]>();
  for (const row of leads ?? []) {
    const l = toLead(row);
    const list = byRef.get(l.referrer_id!) ?? [];
    list.push(l);
    byRef.set(l.referrer_id!, list);
  }
  return (refs ?? []).map((r) => {
    const ls = byRef.get(r.id) ?? [];
    return { ...r, leads: ls, totals: payoutTotals(ls.map((l) => l.payout)) };
  });
}

export type MyReferral = {
  referrer: Pick<Referrer, "code" | "name" | "email" | "whatsapp" | "active" | "created_at">;
  leads: number;
  totals: Totals;
};

/**
 * The signed-in user's own panel: code, how many leads it brought and the
 * owed/paid totals. Only aggregates: never the clients' names or messages.
 */
export async function getMyReferral(db: D1Database, userId: string): Promise<MyReferral | null> {
  const r = await getReferrerByUserId(db, userId);
  if (!r) return null;
  const { results } = await db
    .prepare("SELECT p.currency, p.payout_cents, p.status FROM hire_leads l LEFT JOIN referral_payouts p ON p.lead_id = l.id WHERE l.referrer_id = ?")
    .bind(r.id)
    .all<{ currency: Currency | null; payout_cents: number | null; status: PayoutStatus | null }>();
  const rows = results ?? [];
  return {
    referrer: { code: r.code, name: r.name, email: r.email, whatsapp: r.whatsapp, active: r.active, created_at: r.created_at },
    leads: rows.length,
    totals: payoutTotals(rows.map((x) => (x.currency ? { currency: x.currency, payout_cents: Number(x.payout_cents), status: x.status ?? "pending" } : null))),
  };
}

export type PaymentUpdate = { currency: Currency; amountCents: number; status: PayoutStatus };

/**
 * Admin: what the client paid for a referred lead. The 15% is computed here.
 * paid_at is set when it becomes "paid" (kept if it already was), cleared on "pending".
 */
export async function upsertPayout(db: D1Database, leadId: string, u: PaymentUpdate): Promise<Payout | null> {
  const lead = await db.prepare("SELECT id, referrer_id FROM hire_leads WHERE id = ?").bind(leadId).first<{ id: string; referrer_id: string | null }>();
  if (!lead || !lead.referrer_id) return null;
  const prev = await db.prepare("SELECT status, paid_at FROM referral_payouts WHERE lead_id = ?").bind(leadId).first<{ status: PayoutStatus; paid_at: string | null }>();
  const t = now();
  const paidAt = u.status === "paid" ? (prev?.status === "paid" && prev.paid_at ? prev.paid_at : t) : null;
  const payout = payoutCents(u.amountCents);
  await db
    .prepare(
      `INSERT INTO referral_payouts (lead_id, currency, amount_cents, payout_cents, status, paid_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (lead_id) DO UPDATE SET currency = excluded.currency, amount_cents = excluded.amount_cents,
       payout_cents = excluded.payout_cents, status = excluded.status, paid_at = excluded.paid_at, updated_at = excluded.updated_at`,
    )
    .bind(leadId, u.currency, u.amountCents, payout, u.status, paidAt, t)
    .run();
  return { lead_id: leadId, currency: u.currency, amount_cents: u.amountCents, payout_cents: payout, status: u.status, paid_at: paidAt };
}
