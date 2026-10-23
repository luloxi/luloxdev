-- Sobre mí "Publicaciones" / "Publications" (src/lib/publications.ts).
-- Additive: one new table, nothing renamed, altered or dropped. The app only
-- writes it with INSERT ... ON CONFLICT DO UPDATE and UPDATE (never DELETE):
-- removing a publication sets hidden = 1, restoring sets it back to 0.
-- No rows = the code defaults (DEFAULT_PUBLICATIONS), so the page shows the
-- two current articles until the admin saves the list for the first time.
CREATE TABLE IF NOT EXISTS publications (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 40),
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
  title_en TEXT NOT NULL DEFAULT '' CHECK (length(title_en) <= 300),
  note_es TEXT NOT NULL DEFAULT '' CHECK (length(note_es) <= 160),
  note_en TEXT NOT NULL DEFAULT '' CHECK (length(note_en) <= 160),
  authors TEXT NOT NULL DEFAULT '' CHECK (length(authors) <= 400),
  year INTEGER CHECK (year IS NULL OR (typeof(year) = 'integer' AND year BETWEEN 1900 AND 2100)),
  venue TEXT NOT NULL DEFAULT '' CHECK (length(venue) <= 80),
  url TEXT NOT NULL CHECK (url LIKE 'https://%' AND length(url) <= 600),
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS publications_position ON publications (position);
