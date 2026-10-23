-- Sobre mí copy change for the Publications block (feat/publications).
-- MANUAL, NOT a migration: run it by hand once 0011_publications is applied and
-- the new code is live, after a backup of site_copy, e.g.
--   wrangler d1 execute DB --remote --command "SELECT key, locale, value FROM site_copy WHERE key = 'about.body'" --json > about-body-backup.json
--   wrangler d1 execute DB --remote --file scripts/sql/about-publications-copy.sql
-- What it does, per locale: in the 'about.body' row, replaces the end of the
-- "Agentes e investigación" / "Agents and research" story (the sentence that
-- introduced the two links + the two-link list) with a closed sentence. The
-- links now live in the Publications block right below that story.
-- Safe: UPDATE only, scoped by key + locale, and guarded by matching the
-- exact current text (instr > 0). If the text was already changed or edited,
-- it matches nothing and changes nothing; running it twice is a no-op.
-- The page does not depend on it: until it runs, the old trailing link list
-- is hidden when rendering (src/lib/publications.ts, stripPublicationLinks).
--
-- Check before / after (both positions > 0 before, 0 after):
--   SELECT locale, instr(value, 'papers analizando:') AS es_old, instr(value, 'papers analyzing:') AS en_old FROM site_copy WHERE key = 'about.body';

-- ES before (exact):
--   papers analizando:
--   
--   - [El panorama actual de tokenización](https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/)
--   - [El contexto legal del comercio agéntico](https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link) 
-- ES after:
--   papers sobre tokenización y comercio agéntico.
UPDATE site_copy
SET value = replace(value, 'papers analizando:

- [El panorama actual de tokenización](https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/)
- [El contexto legal del comercio agéntico](https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link) ', 'papers sobre tokenización y comercio agéntico.'),
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE key = 'about.body' AND locale = 'es'
  AND instr(value, 'papers analizando:

- [El panorama actual de tokenización](https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/)
- [El contexto legal del comercio agéntico](https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link) ') > 0;

-- EN before (exact):
--   papers analyzing:
--   
--   - [The current landscape of tokenization.](https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/)
--   - [The legal context of agentic commerce](https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link).
-- EN after:
--   papers on tokenization and agentic commerce.
UPDATE site_copy
SET value = replace(value, 'papers analyzing:

- [The current landscape of tokenization.](https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/)
- [The legal context of agentic commerce](https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link).', 'papers on tokenization and agentic commerce.'),
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE key = 'about.body' AND locale = 'en'
  AND instr(value, 'papers analyzing:

- [The current landscape of tokenization.](https://www.linkedin.com/feed/update/urn:li:activity:7501713293321854976/)
- [The legal context of agentic commerce](https://drive.google.com/file/d/1Malx_E4Z1flmVr5hQgCRejJEWL8HxjiQ/view?usp=drive_link).') > 0;
