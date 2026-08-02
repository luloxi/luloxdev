import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

/** Lazy Neon client so `next build` works without DATABASE_URL at module load. */
export function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    sql = neon(url);
  }
  return sql;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
