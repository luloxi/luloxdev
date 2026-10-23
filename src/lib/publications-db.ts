/**
 * D1 side of Sobre mí publications (table from migrations/0011_publications.sql).
 * Reads never throw: no binding, a missing table or bad rows fall back to the
 * code defaults. Writes are INSERT ... ON CONFLICT DO UPDATE and UPDATE only:
 * nothing is ever deleted (a removed item is hidden = 1).
 */
import { cache } from "react";
import { getDb, nowIso, type D1Database } from "@/lib/db";
import { DEFAULT_PUBLICATIONS, publicationsFromRows, type Publication, type PublicationRow } from "@/lib/publications";

export async function loadPublications(db: D1Database | null): Promise<Publication[]> {
  if (!db) return DEFAULT_PUBLICATIONS.map((p) => ({ ...p }));
  try {
    const { results } = await db
      .prepare(
        "SELECT id, title, title_en, note_es, note_en, authors, year, venue, url, hidden, position FROM publications ORDER BY position, created_at, id",
      )
      .all<PublicationRow>();
    return publicationsFromRows(results);
  } catch (err) {
    console.error("[publications] fallback to code defaults:", err);
    return DEFAULT_PUBLICATIONS.map((p) => ({ ...p }));
  }
}

/** Per request (React cache), not across requests: saved changes show on the next load. */
export const getPublications = cache(async () => loadPublications(await getDb()));

/**
 * Save the whole ordered list (validated). Position = list order. Rows already
 * stored but missing from the list are hidden (UPDATE), never deleted.
 */
export async function savePublications(db: D1Database, items: readonly Publication[]): Promise<void> {
  const now = nowIso();
  const stmts = items.map((p, position) =>
    db
      .prepare(
        `INSERT INTO publications (id, position, title, title_en, note_es, note_en, authors, year, venue, url, hidden, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET position = excluded.position, title = excluded.title, title_en = excluded.title_en,
           note_es = excluded.note_es, note_en = excluded.note_en, authors = excluded.authors, year = excluded.year,
           venue = excluded.venue, url = excluded.url, hidden = excluded.hidden, updated_at = excluded.updated_at`,
      )
      .bind(p.id, position, p.title, p.title_en, p.note_es, p.note_en, p.authors, p.year, p.venue, p.url, p.hidden ? 1 : 0, now, now),
  );
  const ids = items.map((p) => p.id);
  const placeholders = ids.map(() => "?").join(", ");
  stmts.push(
    db
      .prepare(
        `UPDATE publications SET hidden = 1, position = ? + position, updated_at = ? WHERE hidden = 0${ids.length ? ` AND id NOT IN (${placeholders})` : ""}`,
      )
      .bind(items.length, now, ...ids),
  );
  await db.batch(stmts);
}
