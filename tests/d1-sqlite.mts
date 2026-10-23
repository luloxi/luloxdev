/** Minimal D1 binding over node:sqlite for tests (prepare/bind/all/first/run/batch). */
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import type { D1Database, D1PreparedStatement } from "../src/lib/db.ts";

export function d1(files: string[] = []): D1Database & { raw: DatabaseSync } {
  const raw = new DatabaseSync(":memory:");
  raw.exec("PRAGMA foreign_keys = ON");
  for (const f of files) raw.exec(readFileSync(new URL(`../migrations/${f}`, import.meta.url), "utf8"));
  const stmt = (sql: string, args: unknown[] = []): D1PreparedStatement => ({
    bind: (...a: unknown[]) => stmt(sql, a),
    all: async <T,>() => ({ results: raw.prepare(sql).all(...(args as never[])) as T[] }),
    first: async <T,>() => (raw.prepare(sql).get(...(args as never[])) as T) ?? null,
    run: async () => raw.prepare(sql).run(...(args as never[])),
  });
  return {
    raw,
    prepare: (sql: string) => stmt(sql),
    batch: async (list: D1PreparedStatement[]) => Promise.all(list.map((s) => s.run())),
  };
}
