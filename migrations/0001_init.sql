-- lulox.dev content schema for Cloudflare D1 (SQLite).
-- Equivalent of the Neon Postgres tables public.blog_posts and public.project_overrides.
-- Postgres -> SQLite: TEXT[] -> JSON text, BOOLEAN -> INTEGER 0/1, TIMESTAMPTZ -> ISO-8601 UTC text.

CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  published_at TEXT NOT NULL,
  cover_image TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_es TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  body_es TEXT NOT NULL,
  body_en TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS blog_posts_published_at ON blog_posts (published, published_at DESC);

CREATE TABLE IF NOT EXISTS project_overrides (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'disabled',
  disabled_reason_es TEXT NOT NULL DEFAULT '',
  disabled_reason_en TEXT NOT NULL DEFAULT '',
  live_url TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  team_json TEXT NOT NULL DEFAULT '',
  title_es TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  body_es TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  paragraphs_es TEXT NOT NULL DEFAULT '',
  paragraphs_en TEXT NOT NULL DEFAULT '',
  awards_es TEXT NOT NULL DEFAULT '',
  awards_en TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
