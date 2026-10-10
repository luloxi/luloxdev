# lulox.dev: Neon Postgres -> Cloudflare D1

Branch `d1-migration`. Nothing here is live: `main`, the deployed Worker, Vercel, DNS and Neon are untouched.

## Inventory (Neon, read-only, 2026-10-10)

| Schema.table | Rows | Owner | Migrate? |
|---|---|---|---|
| public.blog_posts | 8 (1 published, 7 drafts) | app content | yes, to D1 |
| public.project_overrides | 0 | app content (/rothko project edits) | schema only (no rows) |
| neon_auth.user / account / session / verification / jwks / project_config | 2 / 2 (google) / 6 / 5 / 1 / 1 | Neon Auth | no, replaced (re-login once) |
| neon_auth.organization / member / invitation | 0 | Neon Auth | no |

Projects themselves (punksociety, sami, mochi) live in `src/content/projects.ts`; the DB only stores optional overrides.
Images: all covers are local `/public/projects/focus/*` files; no blob/remote images in post bodies.
Note: Neon has 2 drafts not in `seed.ts` (x402, erc8004), so the DB, not the seed, is the source of truth.

## Schema mapping

`migrations/0001_init.sql`: TEXT[] -> JSON text, BOOLEAN -> INTEGER 0/1, TIMESTAMPTZ -> ISO-8601 UTC text. Same primary keys, plus an index on (published, published_at).

## Data move

1. Read-only export of Neon to JSON (outside the repo).
2. `python3 scripts/neon-export-to-d1-sql.py <export_dir> d1-import.sql` writes INSERTs and prints per-table sha256 over canonical rows.
3. `wrangler d1 migrations apply luloxdev --remote` then `wrangler d1 execute luloxdev --remote --file d1-import.sql`.
4. Re-hash rows read back from D1 and compare (done locally: 8/8 rows, hashes equal; public API output byte-identical to www.lulox.dev).

## Status (2026-10-10)

- D1 `luloxdev` (id 61d3b739-db00-4fed-86d5-0387bf50b2cc, region WNAM) created; migrations 0001 + 0002 applied remotely.
- Content imported: 8 posts (1 published, 7 drafts), 0 project overrides. Remote per-table sha256 equals the Neon export.
- Not live yet: the deployed Worker still uses Neon until this branch is merged and deployed.

## Code

- `src/lib/db.ts`: D1 binding `DB` via `getCloudflareContext()`; null outside a Worker (static seed fallback).
- `src/lib/blog.ts`, `src/lib/projects.ts`: prepared statements on D1. Schema lives in `migrations/`.
- Auth: Better Auth 1.7.7 on D1 (native binding) + Google. `src/lib/auth/options.ts` (config, allowed hosts,
  admin-only account creation hook), `server.ts` (per-request instance), `client.ts`, `/api/auth/[...path]`,
  `proxy.ts` (cookie check, real admin check in API handlers). Sign-in page unchanged.
- `migrations/0002_better_auth.sql` generated with `pnpm db:auth-schema`.
- `pnpm seed:blog [--remote]` inserts missing default posts into D1 without overwriting.
- `pnpm test` (allowlist), `pnpm typecheck`, `pnpm cf:build`.
- Removed `@neondatabase/auth`, `@neondatabase/serverless`, `NEON_AUTH_BASE_URL` var.

## Cutover (needs Luciano)

1. Google Cloud OAuth client (Web) with JS origins https://www.lulox.dev, https://lulox.dev,
   https://luloxdev.lucianoolivabianco.workers.dev and redirect URIs
   https://www.lulox.dev/api/auth/callback/google, https://luloxdev.lucianoolivabianco.workers.dev/api/auth/callback/google.
2. `wrangler secret put` GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BETTER_AUTH_SECRET (random 32+ bytes).
3. Re-export Neon and re-import if posts changed since 2026-10-10, merge, deploy, delete old secrets
   DATABASE_URL and NEON_AUTH_COOKIE_SECRET from the Worker.

## Auth replacement (Neon Auth lives in the Neon DB, so it has to go too)

Recommended: **Better Auth on D1 with Google sign-in**, keeping `ADMIN_EMAILS` allowlist and the current `/auth/sign-in` UX.
- New tables user/session/account/verification in D1 (migration 0002).
- Needs a Google OAuth client owned by Luciano (Google Cloud console), with redirect URIs
  `https://www.lulox.dev/api/auth/callback/google` and `https://luloxdev.lucianoolivabianco.workers.dev/api/auth/callback/google`.
- Worker secrets: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Remove `NEON_AUTH_*`.

Alternative with less code: **Cloudflare Access** (Zero Trust) in front of `/rothko*`, `/api/blog`, `/api/projects` writes, Google or email one-time PIN, app verifies the `Cf-Access-Jwt-Assertion` JWT. Needs a Zero Trust team set up in the dashboard and the domain proxied by Cloudflare.
