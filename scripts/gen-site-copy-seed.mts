// Generates migrations/0005_site_copy.sql: table + seed from src/i18n/messages.ts.
import { writeFileSync } from "node:fs";
import { messages } from "../src/i18n/messages.ts";
import { flattenCopy } from "../src/i18n/copy-overrides.ts";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const lines = [
  "-- Editable site copy (admin inline edit). key = dotted path into src/i18n/messages.ts.",
  "-- Seeded from the code; the code stays the fallback for missing keys.",
  "CREATE TABLE IF NOT EXISTS site_copy (",
  "  key TEXT NOT NULL,",
  "  locale TEXT NOT NULL CHECK (locale IN ('es', 'en')),",
  "  value TEXT NOT NULL,",
  "  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),",
  "  PRIMARY KEY (key, locale)",
  ");",
];
for (const locale of ["es", "en"] as const) {
  for (const [k, v] of Object.entries(flattenCopy(messages[locale]))) {
    lines.push(`INSERT OR IGNORE INTO site_copy (key, locale, value) VALUES (${q(k)}, '${locale}', ${q(v)});`);
  }
}
writeFileSync("migrations/0005_site_copy.sql", lines.join("\n") + "\n");
console.log("rows", lines.length - 9);
