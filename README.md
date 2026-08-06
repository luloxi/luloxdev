# Lulox

Minimal personal site. Hero home (sections + socials as icons) → full-page sections.

## Run

```bash
pnpm install
pnpm dev
```

Copy env from Vercel when needed:

```bash
vercel env pull .env.local --yes
```

## Content

- Identity and static sections: `src/content/*`
- Blog seed posts: `src/content/blog/seed.ts` (loaded into Neon on first request)
- Project structure (ids, icons, team, github): `src/content/projects.ts`
- Live edits: `/rothko` (Google sign-in, admin email only)
  - Blog posts (full CRUD)
  - Past projects: status, disabled reason (ES/EN), live URL

## Rothko admin

- Public: `/blog`, `/blog/[slug]`, `/projects`, `/projects/[id]`
- Sign-in: `/auth/sign-in` (Google via Neon Auth)
- Editor: `/rothko` for `lucianoolivabianco@gmail.com` only
- Neon Auth supports Google (and GitHub / Vercel), not X yet
- Project overrides live in Neon table `project_overrides` (status + bilingual reason). Static data is the base; DB wins when present.

### Production Google login (Neon trusted domains)

Localhost is allowed by default. Production OAuth needs trusted origins:

1. Open [Neon Console](https://console.neon.tech) → project for this app → **Auth** → **Configuration** → **Domains**
2. Add (with `https://`, no trailing slash):
   - `https://www.lulox.dev`
   - `https://lulox.dev`
3. Retry Google sign-in on production

If OAuth still fails after that, configure your own Google OAuth client in Neon Auth (production should not rely on shared dev Google credentials): redirect URI = `{NEON_AUTH_BASE_URL}/callback/google`.

## Structure

- `/` - hero, section grid
- `/about` `/projects` `/blog` `/tastes` `/contact` - full pages
- `/rothko` - protected admin (blog + project status/reasons)
- Back link on every section → home
