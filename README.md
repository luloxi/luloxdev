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
- Live blog edits: `/admin/blog` (Google sign-in, admin email only)

## Blog admin

- Public: `/blog` and `/blog/[slug]`
- Sign-in: `/auth/sign-in` (Google via Neon Auth)
- Editor: `/admin/blog` for `lucianoolivabianco@gmail.com` only
- Neon Auth supports Google (and GitHub / Vercel), not X yet

## Structure

- `/` - hero, section grid
- `/about` `/projects` `/blog` `/tastes` `/contact` - full pages
- `/admin/blog` - protected editor
- Back link on every section → home
