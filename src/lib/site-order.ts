/**
 * D1 side of the site admin strip (tables from migrations/0008_site_sections.sql).
 * Reads never throw: no binding, a missing table or a bad row fall back to the
 * code defaults, so the public site keeps working exactly as before.
 */
import { cache } from "react";
import { getDb, nowIso, requireDb } from "@/lib/db";
import {
  KIND_KEYS,
  mergeProjects,
  mergeSections,
  type OrderItem,
  type OrderKind,
  type OrderRow,
  type SiteSection,
} from "@/lib/site-sections";

export type SiteOrder = { sections: SiteSection[]; projects: OrderItem[] };

const TABLE: Record<OrderKind, { table: string; key: string }> = {
  sections: { table: "site_sections", key: "key" },
  projects: { table: "project_settings", key: "id" },
};

async function readRows(kind: OrderKind): Promise<OrderRow[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const { table, key } = TABLE[kind];
    const { results } = await db
      .prepare(`SELECT ${key} AS key, position, visible FROM ${table}`)
      .all<OrderRow>();
    return results ?? [];
  } catch (err) {
    console.error(`[site-order] ${kind} fallback to defaults:`, err);
    return [];
  }
}

/** Not cached: proxy.ts calls this outside React. */
export async function loadSiteOrder(): Promise<SiteOrder> {
  const [s, p] = await Promise.all([readRows("sections"), readRows("projects")]);
  return { sections: mergeSections(s), projects: mergeProjects(p) };
}

/** Per-request (React cache): layout, pages and sitemap share one read. */
export const getSiteOrder = cache(loadSiteOrder);

/** Upsert the whole list (position = index). Never deletes rows. */
export async function saveOrder(kind: OrderKind, items: readonly OrderItem[]): Promise<void> {
  const keys = KIND_KEYS[kind];
  if (items.length !== keys.length) throw new Error("incomplete order");
  const db = await requireDb();
  const { table, key } = TABLE[kind];
  const now = nowIso();
  await db.batch(
    items.map((it, i) =>
      db
        .prepare(
          `INSERT INTO ${table} (${key}, position, visible, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT (${key}) DO UPDATE SET position = excluded.position, visible = excluded.visible, updated_at = excluded.updated_at`,
        )
        .bind(it.key, i, it.visible ? 1 : 0, now),
    ),
  );
}

/**
 * Real admin check from raw request headers (proxy.ts has no next/headers).
 * Same rule as requireAdminSession: a Better Auth session whose email is on
 * the allowlist. Any failure = not admin.
 */
export async function isAdminHeaders(headers: Headers): Promise<boolean> {
  try {
    const { getAuth } = await import("@/lib/auth/server");
    const { isAdminUser } = await import("@/lib/auth/admin");
    const auth = await getAuth();
    if (!auth) return false;
    const session = await auth.api.getSession({ headers });
    return isAdminUser(session?.user);
  } catch {
    return false;
  }
}
