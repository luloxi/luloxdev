-- Merge Sobre mí paragraphs into one body key per locale (old keys kept as fallback).
INSERT OR IGNORE INTO site_copy (key, locale, value)
SELECT 'about.body', locale, group_concat(value, char(10) || char(10))
FROM (
  SELECT locale, value FROM site_copy
  WHERE key LIKE 'about.paragraphs.%'
  ORDER BY locale, CAST(substr(key, length('about.paragraphs.') + 1) AS INTEGER)
)
GROUP BY locale;
