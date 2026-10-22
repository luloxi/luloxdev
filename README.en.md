[Español](README.md) | **English**

# Steal this portfolio! 🦝

The personal site of Luciano Oliva Bianco (Lulox), live at **https://lulox.com.ar**.
It's a simple, bilingual (ES/EN) portfolio with a blog, an inline admin editor and a quote calculator, running on one Cloudflare Worker.
Fork it, swap the content, deploy. That's the whole idea. ✨
It's copyleft on purpose: take it, make it better, and keep it open for the next person. 🏴‍☠️

## ✨ Features

- 🏠 **Landing**: photo, name and a menu (Contratar, Blog, Sobre mí, Proyectos, Contacto). Screen-sized on desktop, made to fit the first screen on mobile.
- ✍️ **Blog** with a Markdown/WYSIWYG editor, drafts, cover images (uploaded to R2) and drag-and-drop section reordering.
- 👤 **Sobre mí** (about): your story plus experience cards, editable inline when you're signed in as admin.
- 🧪 **Proyectos**: project cards and detail pages.
- 💸 **Contratar** (hire me): a quote calculator plus a contact form that emails you the visitor's message and their quote.
- 🌗 Dark and light themes, 🇦🇷/🇺🇸 Spanish and English.
- 🔐 Admin sign-in with Google (only the emails you allow).

## 🧰 Stack

- [Next.js](https://nextjs.org) (App Router) built for Cloudflare with [OpenNext](https://opennext.js.org/cloudflare)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) + **D1** (SQLite) + **R2** (media) + Rate Limiting
- [Better Auth](https://www.better-auth.com) with Google sign-in
- [Resend](https://resend.com) for the contact form email (Cloudflare Email Routing `send_email` as fallback)
- Tailwind CSS 4, TypeScript, `tsx --test` for tests

## 🚀 Quick start

You need **Node.js 24.22.1+** (the latest LTS; pinned in `.nvmrc`, run `nvm use`) and a free Cloudflare account (only for deploying).
**pnpm is recommended** (the repo pins it in `package.json`); npm works too.

```bash
# 1. Install
pnpm install                 # or: npm install

# 2. Env vars (local secrets, git-ignored)
cp .dev.vars.example .dev.vars
# fill in BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, TURNSTILE_SECRET_KEY (RESEND_API_KEY optional)

# 3. Local database (D1 in .wrangler/state) + sample posts
pnpm db:migrate:local        # or: npm run db:migrate:local
pnpm seed:blog               # or: npm run seed:blog

# 4. Run it
pnpm dev                     # or: npm run dev  → http://localhost:3000
```

### Env vars

| Name | Where | What |
|---|---|---|
| `BETTER_AUTH_SECRET` | secret | Random string for sessions |
| `BETTER_AUTH_URL` | optional | Public site URL |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | secret | Google OAuth client. Redirect URI: `<site>/api/auth/callback/google` |
| `RESEND_API_KEY` | optional secret | Sends the contact form email |
| `TURNSTILE_SECRET_KEY` | secret | Cloudflare Turnstile secret. The /contratar form verifies the token server-side (siteverify) before sending; without it the form returns 503. The public site key lives in `src/content/site.ts` (`turnstileSiteKey`); if you fork, create your own widget (domains: yours and `localhost`) and swap it |
| `CONTACT_TO`, `CONTACT_FROM`, `CONTACT_INBOX` | `vars` in `wrangler.jsonc` | Where the form email goes, the sender (a domain verified in Resend) and the inbox for your copy |

Locally they live in `.dev.vars`. In production: `npx wrangler secret put <NAME>`.

### Everyday commands

| pnpm | npm | Does |
|---|---|---|
| `pnpm test` | `npm test` | Unit tests (`tests/*.test.mts`) |
| `pnpm typecheck` | `npm run typecheck` | TypeScript check |
| `pnpm lint` | `npm run lint` | ESLint |
| `pnpm cf:build` | `npm run cf:build` | Production build for Cloudflare |
| `pnpm preview` | `npm run preview` | Build + run the real Worker locally |
| `pnpm run deploy` | `npm run deploy` | Build + deploy to Cloudflare |

### ☁️ Deploy to Cloudflare

1. `npx wrangler login`
2. Create your own resources and put their names/ids in `wrangler.jsonc`:
   - `npx wrangler d1 create <your-db>` (copy `database_id`)
   - `npx wrangler r2 bucket create <your-bucket>`
   - change `name`, `routes` (your domain), the `send_email` destination and `vars` (`CONTACT_TO`, `CONTACT_FROM`, `CONTACT_INBOX`)
3. `pnpm db:migrate:remote` (the script uses the db name `luloxdev`; change it in `package.json` if yours differs)
4. Set secrets: `npx wrangler secret put BETTER_AUTH_SECRET` (same for the Google ones, `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY`)
5. `pnpm run deploy` (if it fails the first time, just run it again)

## 🎨 Make it yours

**Do this first** 👇
- `src/content/site.ts`: name, menu sections, socials, taste links, `CALL_BOOKING_URL` (your calendar booking page).
- `src/lib/auth/admin.ts`: `ADMIN_EMAILS`, the only Google accounts that can edit.
- `src/lib/auth/options.ts`: `ALLOWED_HOSTS` and `TRUSTED_ORIGINS` (your domains, or sign-in will refuse them).
- `public/`: replace the photos (`avatar*.jpg`), project images and logos.
- `public/og.png`: the share preview image (og:image/twitter:image, 1200x630), a top-anchored crop of `avatar-hero.jpg`. Regenerate it if you change the photo. Posts with a cover image use their own cover.
- `wrangler.jsonc` and the footer link in `src/app/page.tsx`.

**Section by section**

| Section | Route | Files | How to edit |
|---|---|---|---|
| Landing + menu | `/` | `src/app/page.tsx`, `src/components/section-nav.tsx`, `src/components/hire-button.tsx` | Menu items and order: `sections` in `src/content/site.ts`. The first one (`hire`) renders as the glowing pill. |
| Blog | `/blog`, `/blog/[slug]` | `src/app/blog/`, `src/components/views/blog-*.tsx`, `src/lib/blog.ts` | Posts live in D1 (`blog_posts`). Sign in as admin and write at `/blog/nuevo` or edit any post. Sample posts: `src/content/blog/seed.ts`. |
| Blog editor extras | | `src/components/blog-post-edit.tsx`, `md-wysiwyg.tsx`, `section-reorder.tsx`, `src/lib/article-sections.ts` | Covers and images upload to R2 (`/api/media`, served at `/media/...`). "Section order" splits the post by headings and `---` and lets you drag sections. |
| Sobre mí | `/sobre-mi` | `src/app/sobre-mi/page.tsx`, `src/lib/page-layout.ts`, `src/lib/md-sections.ts` | Default text and experience cards (`about.timeline`) are in `src/i18n/messages.ts`. As admin you edit inline and add sections; edits are saved to D1 (`site_copy`) and win over the code. |
| Gustos (tastes) | inside `/sobre-mi` | `tasteLinks` in `src/content/site.ts` | `/tastes` and `/gustos` redirect to `/sobre-mi`. |
| Proyectos | `/proyectos`, `/proyectos/[id]` | `src/content/projects.ts`, `src/components/views/project*.tsx` | Add projects in `projects.ts`. Admin can override status and texts (stored in D1 `project_overrides`). |
| Contacto | `/contacto` | `src/app/contacto/page.tsx` | Shows `contactSocials` from `site.ts` and the hire button. |
| Contratar | `/contratar` | `src/components/hire-calculator.tsx`, `src/lib/pricing.ts` | All prices, presets, discounts and limits are in `PRICING` (`pricing.ts`, covered by `tests/pricing.test.mts`). |
| Contact form email | `/api/hire-contact` | `src/lib/hire-contact.ts`, `src/app/api/hire-contact/route.ts` | Validates (280 chars, email), honeypot, rate limit (`CONTACT_RL`), recalculates the quote on the server and emails `CONTACT_TO` with the visitor as reply-to. |
| Texts and i18n | everywhere | `src/i18n/messages.ts`, `src/i18n/locale-provider.tsx` | Every UI string in `es` and `en`. Language comes from a cookie; Spanish URLs are canonical (old English paths redirect, see `next.config.ts`). |
| Themes | everywhere | `src/components/providers/theme-provider.tsx`, `src/app/globals.css` | Dark/light via the `.dark` class. Colors are CSS variables at the top of `globals.css`. |
| Footer | `/` | `src/app/page.tsx` (`home-steal`) | The "Steal this portfolio!" link. Point it at your fork or remove it. |

## 🗂️ Project structure

```
├── src/
│   ├── app/            # routes (pages + api/), globals.css
│   ├── components/     # UI pieces (calculator, editor, nav, icons...)
│   ├── content/        # site.ts, projects.ts, blog seed
│   ├── i18n/           # messages.ts (ES/EN), locale provider
│   └── lib/            # pricing, blog, auth, db, contact form logic
├── migrations/         # D1 SQL migrations
├── scripts/            # seed and maintenance scripts
├── tests/              # unit tests (pnpm test)
├── public/             # images, audio
├── worker.ts           # Worker entry (www → apex redirect, then OpenNext)
└── wrangler.jsonc      # Cloudflare config: D1, R2, email, rate limit, vars
```

## 🦝 Who's behind this

I'm **Luciano Oliva Bianco**, but folks call me **Lulox** (Lulo as a kid, the X came later, courtesy of Carlitox's laugh). I research, build, create, from La Boca, Buenos Aires.

- 🎬 **FEDUN** (2015 - 2020): community manager, filming classes, marketing and web development.
- 🛠️ **BuidlGuidl** (2023 - 2024): fullstack Web3 developer, building dApps with Scaffold-ETH 2 and Solidity as public goods.
- 🔬 **Input Output Global** (Jul 2025 - Oct 2026): research and development on blockchain, finance and AI, plus automations, agents and web apps. Co-authored papers on tokenization and the legal context of agentic commerce.

I mined Bitcoin around 2009 and lost the seed phrase, so trust me on the "keep your secrets out of git" part. 😅

### 💼 Hire me

Like the site? I build things like this, plus automations, AI agents and blockchain apps.
Get a quote in seconds at **[lulox.com.ar/contratar](https://lulox.com.ar/contratar)**: US$ 10 - 25/h depending on complexity, volume discounts on bigger projects, on-site work available. 50% upfront, 50% on delivery. ☕ Coffee and a good conversation included.

## 🤝 Contributing

Issues and PRs are welcome. Keep it simple:
1. `pnpm test && pnpm typecheck` before pushing.
2. One change per PR, with a clear description.
3. If you add or change a feature, update both READMEs (`README.md` in Spanish and `README.en.md` in English).
4. Copy style: no em dashes in anything a visitor reads (see `AGENTS.md`).

## 📄 License

The **code** is licensed under the [GNU AGPL-3.0-or-later](LICENSE). If you run a modified version on a server, you must share its source with its users.

The **personal content is not** part of that license: Luciano's photos, texts, blog posts, project data, audio and the organization logos (`public/orgs/`). They're his (or their owners'). Replace them with your own. Fonts come from Google Fonts under their own (OFL) licenses.
