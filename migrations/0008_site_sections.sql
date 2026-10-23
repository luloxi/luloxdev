-- Site admin strip (edit mode): order and visibility of the main sections
-- and of the projects. Hiding takes something out of the public site (menu,
-- landing, footer links, sitemap, and its pages answer 404) without deleting
-- any content; showing it again brings it back exactly as it was.
-- Additive: two new tables, nothing renamed or dropped. No rows = the code
-- defaults (everything visible, in the order of src/content/site.ts and
-- src/content/projects.ts), so the site looks the same until the admin acts.

-- key: section id from src/content/site.ts (hire, blog, about, projects, contact).
-- The home page is not a section and can't be hidden.
CREATE TABLE IF NOT EXISTS site_sections (
  key TEXT PRIMARY KEY NOT NULL,
  position INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1 CHECK (visible IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- id: project id from src/content/projects.ts (mochi, sami, punksociety).
-- Separate from project_overrides (texts/status) so order and visibility
-- never touch the edited copy.
CREATE TABLE IF NOT EXISTS project_settings (
  id TEXT PRIMARY KEY NOT NULL,
  position INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1 CHECK (visible IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
