**Español** | [English](README.en.md)

# ¡Robate este portfolio! 🦝

El sitio personal de Luciano Oliva Bianco (Lulox), online en **https://lulox.com.ar**.
Un portfolio simple y bilingüe (ES/EN) con blog, editor inline para el admin y una calculadora de presupuesto, todo en un solo Cloudflare Worker.
Forkealo, cambiá el contenido y publicalo. Esa es toda la idea. ✨
Es copyleft a propósito: llevátelo, mejoralo y dejalo abierto para el que venga. 🏴‍☠️

## ✨ Qué trae

- 🏠 **Inicio**: foto, nombre y menú (Contratar, Blog, Sobre mí, Proyectos, Contacto). En desktop ocupa la pantalla justa y en el celu entra en la primera pantalla.
- ✍️ **Blog** con editor Markdown/WYSIWYG, borradores, portadas (subidas a R2) y reordenar secciones arrastrando.
- 👤 **Sobre mí**: tu historia y las cards de experiencia, editables inline como admin.
- 🧪 **Proyectos**: cards y páginas de detalle.
- 💸 **Contratar**: calculadora de presupuesto y un formulario que te manda por mail el mensaje y el presupuesto.
- 🌗 Tema claro y oscuro, 🇦🇷/🇺🇸 español e inglés.
- 🔐 Login de admin con Google (solo los emails que permitas).

## 🧰 Stack

- [Next.js](https://nextjs.org) (App Router), compilado para Cloudflare con [OpenNext](https://opennext.js.org/cloudflare)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) + **D1** (SQLite) + **R2** (imágenes y archivos) + Rate Limiting
- [Better Auth](https://www.better-auth.com) con login de Google
- [Resend](https://resend.com) para el mail del formulario (con `send_email` de Cloudflare Email Routing como respaldo)
- Tailwind CSS 4, TypeScript y `tsx --test` para los tests

## 🚀 Arranque rápido

Necesitás **Node.js 22.13+** y una cuenta gratis de Cloudflare (solo para publicar). Te recomiendo **pnpm** (está fijado en `package.json`); npm también funciona.

```bash
# 1. Instalar
pnpm install                  # o: npm install

# 2. Variables (secretos locales, ignorados por git)
cp .dev.vars.example .dev.vars
# completá BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (RESEND_API_KEY es opcional)

# 3. Base local (D1 en .wrangler/state) + posts de ejemplo
pnpm db:migrate:local         # o: npm run db:migrate:local
pnpm seed:blog                # o: npm run seed:blog

# 4. Correrlo
pnpm dev                      # o: npm run dev  → http://localhost:3000
```

### Variables

| Nombre | Dónde | Qué es |
|---|---|---|
| `BETTER_AUTH_SECRET` | secret | String aleatorio para las sesiones |
| `BETTER_AUTH_URL` | opcional | URL pública del sitio |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | secret | Cliente OAuth de Google. Redirect: `<sitio>/api/auth/callback/google` |
| `RESEND_API_KEY` | secret opcional | Envía el mail del formulario |
| `CONTACT_TO`, `CONTACT_FROM`, `CONTACT_INBOX` | `vars` en `wrangler.jsonc` | A dónde llega el mail del formulario, el remitente (un dominio verificado en Resend) y la casilla para tu copia |

En local van en `.dev.vars`. En producción: `npx wrangler secret put <NOMBRE>`.

### Comandos de todos los días

| pnpm | npm | Hace |
|---|---|---|
| `pnpm test` | `npm test` | Tests (`tests/*.test.mts`) |
| `pnpm typecheck` | `npm run typecheck` | Chequeo de TypeScript |
| `pnpm lint` | `npm run lint` | ESLint |
| `pnpm cf:build` | `npm run cf:build` | Build de producción para Cloudflare |
| `pnpm preview` | `npm run preview` | Build + el Worker real en local |
| `pnpm run deploy` | `npm run deploy` | Build + publicar en Cloudflare |

### ☁️ Publicar en Cloudflare

1. `npx wrangler login`
2. Creá tus recursos y poné nombres/ids en `wrangler.jsonc`:
   - `npx wrangler d1 create <tu-db>` (copiá el `database_id`)
   - `npx wrangler r2 bucket create <tu-bucket>`
   - cambiá `name`, `routes` (tu dominio), el destino de `send_email` y `vars` (`CONTACT_TO`, `CONTACT_FROM`, `CONTACT_INBOX`)
3. `pnpm db:migrate:remote` (el script usa la base `luloxdev`; si la tuya se llama distinto, cambialo en `package.json`)
4. Secrets: `npx wrangler secret put BETTER_AUTH_SECRET` (igual para los de Google y `RESEND_API_KEY`)
5. `pnpm run deploy` (si falla una vez, volvé a correrlo)

## 🎨 Hacelo tuyo

**Primero esto** 👇
- `src/content/site.ts`: nombre, secciones del menú, redes, links de gustos, `CALL_BOOKING_URL` (tu agenda).
- `src/lib/auth/admin.ts`: `ADMIN_EMAILS`, las únicas cuentas de Google que pueden editar.
- `src/lib/auth/options.ts`: `ALLOWED_HOSTS` y `TRUSTED_ORIGINS` (tus dominios, si no el login los rechaza).
- `public/`: reemplazá las fotos (`avatar*.jpg`), imágenes de proyectos y logos.
- `wrangler.jsonc` y el link del footer en `src/app/page.tsx`.

**Sección por sección**

| Sección | Ruta | Archivos | Cómo se edita |
|---|---|---|---|
| Inicio + menú | `/` | `src/app/page.tsx`, `src/components/section-nav.tsx`, `src/components/hire-button.tsx` | Ítems y orden: `sections` en `src/content/site.ts`. El primero (`hire`) es la píldora que brilla. |
| Blog | `/blog`, `/blog/[slug]` | `src/app/blog/`, `src/components/views/blog-*.tsx`, `src/lib/blog.ts` | Los posts viven en D1 (`blog_posts`). Entrá como admin y escribí en `/blog/nuevo` o editá cualquier post. Ejemplos: `src/content/blog/seed.ts`. |
| Extras del editor | | `src/components/blog-post-edit.tsx`, `md-wysiwyg.tsx`, `section-reorder.tsx`, `src/lib/article-sections.ts` | Portadas e imágenes van a R2 (`/api/media`, servidas en `/media/...`). "Orden de secciones" corta el post por títulos y `---` y te deja arrastrarlas. |
| Sobre mí | `/sobre-mi` | `src/app/sobre-mi/page.tsx`, `src/lib/page-layout.ts`, `src/lib/md-sections.ts` | Texto y cards de experiencia (`about.timeline`) en `src/i18n/messages.ts`. Como admin editás inline; se guarda en D1 (`site_copy`) y gana sobre el código. |
| Gustos | dentro de `/sobre-mi` | `tasteLinks` en `src/content/site.ts` | `/tastes` y `/gustos` redirigen a `/sobre-mi`. |
| Proyectos | `/proyectos`, `/proyectos/[id]` | `src/content/projects.ts`, `src/components/views/project*.tsx` | Agregá proyectos en `projects.ts`. El admin puede pisar estado y textos (D1 `project_overrides`). |
| Contacto | `/contacto` | `src/app/contacto/page.tsx` | Muestra `contactSocials` de `site.ts` y el botón de contratar. |
| Contratar | `/contratar` | `src/components/hire-calculator.tsx`, `src/lib/pricing.ts` | Tarifas, tamaños, descuentos y límites en `PRICING` (`pricing.ts`, con tests en `tests/pricing.test.mts`). |
| Mail del formulario | `/api/hire-contact` | `src/lib/hire-contact.ts`, `src/app/api/hire-contact/route.ts` | Valida (280 caracteres, email), honeypot, rate limit (`CONTACT_RL`), recalcula el presupuesto en el server y manda el mail a `CONTACT_TO` con el visitante como reply-to. |
| Textos e i18n | todo el sitio | `src/i18n/messages.ts`, `src/i18n/locale-provider.tsx` | Cada texto en `es` y `en`. El idioma sale de una cookie; las URLs en español son las canónicas (las viejas en inglés redirigen, ver `next.config.ts`). |
| Temas | todo el sitio | `src/components/providers/theme-provider.tsx`, `src/app/globals.css` | Claro/oscuro con la clase `.dark`. Los colores son variables CSS arriba de `globals.css`. |
| Footer | `/` | `src/app/page.tsx` (`home-steal`) | El link "Steal this portfolio!". Apuntalo a tu fork o sacalo. |

## 🗂️ Estructura del proyecto

```
├── src/
│   ├── app/            # rutas (páginas + api/), globals.css
│   ├── components/     # piezas de UI (calculadora, editor, nav, íconos...)
│   ├── content/        # site.ts, projects.ts, posts de ejemplo
│   ├── i18n/           # messages.ts (ES/EN), provider de idioma
│   └── lib/            # presupuestos, blog, auth, base de datos, lógica del formulario
├── migrations/         # migraciones SQL de D1
├── scripts/            # scripts de seed y mantenimiento
├── tests/              # tests unitarios (pnpm test)
├── public/             # imágenes, audio
├── worker.ts           # entrada del Worker (redirige www al dominio raíz y después OpenNext)
└── wrangler.jsonc      # config de Cloudflare: D1, R2, email, rate limit, vars
```

## 🦝 Quién está atrás

Soy **Luciano Oliva Bianco**, pero me dicen **Lulox** (Lulo de chico, la X llegó después, por la risa de Carlitox). Investigo, construyo, creo, desde La Boca, Buenos Aires.

- 🎬 **FEDUN** (2015 - 2020): community manager, filmación de clases, marketing y desarrollo web.
- 🛠️ **BuidlGuidl** (2023 - 2024): desarrollador fullstack Web3, dApps con Scaffold-ETH 2 y Solidity como bienes públicos.
- 🔬 **Input Output Global** (jul 2025 - oct 2026): investigación y desarrollo en blockchain, finanzas e IA, además de automatizaciones, agentes y web apps. Coautor de papers sobre tokenización y el contexto legal del comercio agéntico.

Minué Bitcoin por 2009 y perdí la seed phrase, así que creeme con lo de "no subas tus secretos a git". 😅

### 💼 Contratame

¿Te gustó el sitio? Hago cosas así, y también automatizaciones, agentes de IA y apps blockchain.
Sacá tu presupuesto en segundos en **[lulox.com.ar/contratar](https://lulox.com.ar/contratar)**: US$ 10 - 25/h según complejidad, descuento por volumen en proyectos grandes y opción presencial. 50% al arrancar, 50% al entregar. ☕ Café y buena charla incluidos.

## 🤝 Contribuir

Issues y PRs bienvenidos. Simple:
1. `pnpm test && pnpm typecheck` antes de pushear.
2. Un cambio por PR, con una descripción clara.
3. Si agregás o cambiás algo, actualizá los dos READMEs (`README.md` en español y `README.en.md` en inglés).
4. Estilo: nada de rayas largas en textos que lea un visitante (ver `AGENTS.md`).

## 📄 Licencia

El **código** es [GNU AGPL-3.0-or-later](LICENSE). Si corrés una versión modificada en un servidor, tenés que compartir su código con sus usuarios.

El **contenido personal no** entra en esa licencia: las fotos, textos, posts, datos de proyectos, audio y logos de organizaciones (`public/orgs/`) son de Luciano (o de sus dueños). Reemplazalos por los tuyos. Las fuentes vienen de Google Fonts con sus propias licencias (OFL).
