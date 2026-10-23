-- English URL slug per post (/en/blog/<slug_en>). Additive: nullable column, nothing renamed or dropped.
-- NULL slug_en = the post is served under /en/blog/<slug> (Spanish slug) until one is set.
ALTER TABLE blog_posts ADD COLUMN slug_en TEXT;

-- Backfill from title_en: lowercase, accents stripped, apostrophes dropped,
-- every other non [a-z0-9] char -> '-', repeated/edge hyphens removed
-- (same rules as slugify() in src/lib/routes.ts). SQLite lower() only folds
-- ASCII, so uppercase accented letters are listed explicitly.
-- Empty result (no title_en) -> the Spanish slug. Duplicates get -2, -3...
-- (oldest post keeps the plain slug).
WITH RECURSIVE
  src AS (
    SELECT slug, published_at, lower(trim(coalesce(title_en, ''))) AS s
    FROM blog_posts
    WHERE slug_en IS NULL
  ),
  walk(slug, i, s, out) AS (
    SELECT slug, 1, s, '' FROM src
    UNION ALL
    SELECT slug, i + 1, s, out || (
      CASE
        WHEN substr(s, i, 1) GLOB '[a-z0-9]' THEN substr(s, i, 1)
        WHEN instr('áàäâãåÁÀÄÂÃÅ', substr(s, i, 1)) > 0 THEN 'a'
        WHEN instr('éèëêÉÈËÊ', substr(s, i, 1)) > 0 THEN 'e'
        WHEN instr('íìïîÍÌÏÎ', substr(s, i, 1)) > 0 THEN 'i'
        WHEN instr('óòöôõÓÒÖÔÕ', substr(s, i, 1)) > 0 THEN 'o'
        WHEN instr('úùüûÚÙÜÛ', substr(s, i, 1)) > 0 THEN 'u'
        WHEN instr('ñÑ', substr(s, i, 1)) > 0 THEN 'n'
        WHEN instr('çÇ', substr(s, i, 1)) > 0 THEN 'c'
        WHEN instr('ýÿÝ', substr(s, i, 1)) > 0 THEN 'y'
        WHEN instr('''’', substr(s, i, 1)) > 0 THEN ''
        ELSE '-'
      END)
    FROM walk
    WHERE i <= length(s)
  ),
  raw AS (
    SELECT w.slug, w.out FROM walk w JOIN src ON src.slug = w.slug
    WHERE w.i = length(src.s) + 1
  ),
  base AS (
    SELECT r.slug, src.published_at,
      coalesce(nullif(trim(
        replace(replace(replace(replace(replace(replace(r.out,
          '--', '-'), '--', '-'), '--', '-'), '--', '-'), '--', '-'), '--', '-'),
        '-'), ''), r.slug) AS b
    FROM raw r JOIN src ON src.slug = r.slug
  ),
  ranked AS (
    SELECT slug, b,
      row_number() OVER (PARTITION BY b ORDER BY published_at, slug) AS n
    FROM base
  )
UPDATE blog_posts
SET slug_en = CASE WHEN ranked.n = 1 THEN ranked.b ELSE ranked.b || '-' || ranked.n END
FROM ranked
WHERE blog_posts.slug = ranked.slug;

-- One post per English slug (NULLs allowed, they don't collide).
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_en ON blog_posts (slug_en);
