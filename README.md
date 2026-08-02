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
- Live blog edits: `/rothko` (Google sign-in, admin email only)

## Blog admin

- Public: `/blog` and `/blog/[slug]`
- Sign-in: `/auth/sign-in` (Google via Neon Auth)
- Editor: `/rothko` for `lucianoolivabianco@gmail.com` only
- Neon Auth supports Google (and GitHub / Vercel), not X yet

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
- `/rothko` - protected blog editor
- Back link on every section → home
