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

Necesitás **Node.js 24.22.1+** (la última LTS; está en `.nvmrc`, corré `nvm use`) y una cuenta gratis de Cloudflare (solo para publicar). Te recomiendo **pnpm** (está fijado en `package.json`); npm también funciona.

```bash
# 1. Instalar
pnpm install                  # o: npm install

# 2. Variables (secretos locales, ignorados por git)
cp .dev.vars.example .dev.vars
# completá BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, TURNSTILE_SECRET_KEY (RESEND_API_KEY es opcional)

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
| `TURNSTILE_SECRET_KEY` | secret | Clave secreta de Cloudflare Turnstile. El formulario de /contratar verifica el token en el server (siteverify) antes de mandar el mail; sin ella responde 503. La site key pública está en `src/content/site.ts` (`turnstileSiteKey`); si forkeás, creá tu widget (dominios: el tuyo y `localhost`) y cambiala |
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
3. `pnpm db:migrate:remote` (el script usa el binding `DB` de `wrangler.jsonc`, no el nombre de la base: no hace falta tocar `package.json`)
4. Secrets: `npx wrangler secret put BETTER_AUTH_SECRET` (igual para los de Google, `TURNSTILE_SECRET_KEY` y `RESEND_API_KEY`)
5. `pnpm run deploy` (si falla una vez, volvé a correrlo)

## 🎨 Hacelo tuyo

**Primero esto** 👇
- `src/content/site.ts`: nombre, secciones del menú, redes, links de gustos, `CALL_BOOKING_URL` (tu agenda).
- `src/lib/auth/admin.ts`: `ADMIN_EMAILS`, las únicas cuentas de Google que pueden editar.
- `src/lib/auth/options.ts`: `ALLOWED_HOSTS` y `TRUSTED_ORIGINS` (tus dominios, si no el login los rechaza).
- `public/`: reemplazá las fotos (`avatar*.jpg`), imágenes de proyectos y logos.
- `public/og.png`: la imagen para compartir (og:image/twitter:image, 1200x630), recorte desde arriba de `avatar-hero.jpg`. Si cambiás la foto, regenerala. Los posts con portada usan su propia portada.
- **Tarjetas para compartir (SEO):** cada ruta tiene su propio `og:title`, `twitter:title`, descripciones y `og:url` canónica (`https://lulox.com.ar/...`), en español por defecto (inglés solo con la cookie `lulox-locale=en`; se ignora `Accept-Language`, así X y otros crawlers ven "Contratar | Lulox"). El formato es "Página | Lulox"; la home queda "Lulox" y cada artículo usa su título y su resumen. El helper está en `src/lib/page-metadata.ts`; el texto de cada ruta vive en su `layout.tsx` (o en `privacidad/page.tsx`) dentro de `generateMetadata`. Si agregás una ruta, sumale su `pageMetadata(...)`.
- `wrangler.jsonc` y el link del footer en `src/app/page.tsx`.

**Sección por sección**

| Sección | Ruta | Archivos | Cómo se edita |
|---|---|---|---|
| Inicio + menú | `/` | `src/app/page.tsx`, `src/components/section-nav.tsx`, `src/components/hire-button.tsx` | Ítems y orden: `sections` en `src/content/site.ts`. El primero (`hire`) es la píldora que brilla. En desktop el título "lulox" queda centrado sobre los botones del menú, sin línea debajo. |
| Blog | `/blog`, `/blog/[slug]` | `src/app/blog/`, `src/components/views/blog-*.tsx`, `src/lib/blog.ts` | Los posts viven en D1 (`blog_posts`). Entrá como admin y escribí en `/blog/nuevo` o editá cualquier post. Ejemplos: `src/content/blog/seed.ts`. Borradores: solo los ve el admin con el modo edición encendido (cookie `lulox-edit-mode`, espejo del localStorage, ver `src/lib/edit-mode.ts`); con el modo edición apagado el admin ve el blog como un visitante (sin borradores en la lista y el slug de un borrador da 404). |
| Extras del editor | | `src/components/blog-post-edit.tsx`, `md-wysiwyg.tsx`, `section-reorder.tsx`, `src/lib/article-sections.ts` | Portadas e imágenes van a R2 (`/api/media`, servidas en `/media/...`). "Orden de secciones" corta el post por títulos y `---` y te deja arrastrarlas. |
| Sobre mí | `/sobre-mi` | `src/app/sobre-mi/page.tsx`, `src/lib/page-layout.ts`, `src/lib/md-sections.ts` | Texto y cards de experiencia (`about.timeline`) en `src/i18n/messages.ts`. Como admin editás inline; se guarda en D1 (`site_copy`) y gana sobre el código. |
| Links (LinkedIn + gustos) | al final de `/sobre-mi` | `src/app/sobre-mi/page.tsx`, `tasteLinks` en `src/content/site.ts`, textos en `src/i18n/messages.ts` (`about.linkedInCta`/`about.linkedInDetail`, `tastes.platforms`) | Un solo grupo de cuatro botones sin título: LinkedIn (azul), Letterboxd, Last.fm y Spotify, cada uno con título y descripción corta. `/tastes` y `/gustos` redirigen a `/sobre-mi`. Todo lo clickeable lleva `cursor: pointer` (deshabilitado: `not-allowed`). |
| Proyectos | `/proyectos`, `/proyectos/[id]` | `src/content/projects.ts`, `src/components/views/project*.tsx` | Agregá proyectos en `projects.ts`. El admin puede pisar estado y textos (D1 `project_overrides`). |
| Contacto | `/contacto` | `src/app/contacto/page.tsx` | Muestra `contactSocials` de `site.ts` y el botón de contratar. |
| Contratar | `/contratar` | `src/components/hire-calculator.tsx`, `src/lib/pricing.ts` | Tarifas, tamaños, descuentos y límites en `PRICING` (`pricing.ts`, con tests en `tests/pricing.test.mts`). Formulario "Escribime": campos con `id`/`name`/`autocomplete` (`hire-name`, `hire-email`, `hire-message`), mensaje de hasta 280 caracteres contados por code point (un emoji cuenta 1; se aplica en JS con `clampMessage` de `src/lib/hire-limits.ts` y el server valida igual). Urgencia: en modo por hora es un toggle fijo de +US$ 100 (el trabajo por hora se estima como un día, sin selector de días; el server fuerza 1 día y el mail dice "Urgencia: sí"); en modo por proyecto se cobra por día. Horas: slider + campo numérico sincronizados (solo enteros, `clampHours` en `pricing.ts`: 1 a 6 por hora, 8 a 40 por proyecto; el server aplica el mismo recorte). Por proyecto: menos de 8 h es trabajo por hora y más de 40 h se negocia (la calculadora lo aclara). Tamaños: Chico 20 h, Mediano 30 h, Grande 40 h (los botones ponen esas horas). Descuento por tamaño sobre horas × tarifa: 8–19 h sin descuento, 20–29 h 15% (Chico), 30–39 h 20% (Mediano), 40 h 25% (Grande). Si se pasa o llega al tope aparece un modal (`src/components/limit-modal.tsx`): fondo carmesí, borde arcoíris de los CTA girando, solo el título "Máximo 280 caracteres" y un anillo con la cuenta; no se cierra solo: los primeros 5 s no se puede cerrar (Esc, tocar afuera y el botón no hacen nada; el botón muestra la cuenta y el foco queda atrapado en el diálogo), después "Entendido" se habilita y cierra con el botón, Esc o tocando afuera, devolviendo el foco al mensaje; pegar de nuevo reinicia la cuenta a 5; se centra con `visualViewport` (sirve con el teclado abierto). El resumen que se envía arranca por el total, honeypot `hire_hp`, Turnstile y rate limit. También acepta un POST de formulario normal (sin fetch) en `/api/hire-contact`. Para agentes de IA, `public/llms.txt` explica cómo usarlo (si forkeás, cambiá el dominio y el link de la agenda). |
| Mail del formulario | `/api/hire-contact` | `src/lib/hire-contact.ts`, `src/app/api/hire-contact/route.ts` | Valida (280 caracteres, email), honeypot, rate limit (`CONTACT_RL`), recalcula el presupuesto en el server y manda el mail a `CONTACT_TO` con el visitante como reply-to. |
| Textos e i18n | todo el sitio | `src/i18n/messages.ts`, `src/i18n/locale-provider.tsx` | Cada texto en `es` y `en`. El idioma sale de una cookie; las URLs en español son las canónicas (las viejas en inglés redirigen, ver `next.config.ts`). |
| Temas | todo el sitio | `src/components/providers/theme-provider.tsx`, `src/app/globals.css` | Claro/oscuro con la clase `.dark`. En el header va primero oscuro y después claro (como 🇦🇷 → 🇺🇸), con el activo resaltado. Sin preferencia guardada sigue al sistema (`prefers-color-scheme`): el script inline del `<head>` (`PREFS_HEAD_SCRIPT` en `src/lib/prefs-shared.ts`) lo aplica antes del primer render, sin flash, y si el sistema cambia con la página abierta se actualiza en vivo. Si elegís un tema a mano se guarda en la cookie `lulox-theme` y manda sobre el sistema. Los colores son variables CSS arriba de `globals.css`. |
| Footer | `/` | `src/app/page.tsx` (`home-steal`) | El link "¡Robate este portfolio!" / "Steal this portfolio!" (`ui.stealPortfolio` en `src/i18n/messages.ts`). Apuntalo a tu fork o sacalo. |

### 🖱️ Convención de cursor

Todo lo clickeable muestra `cursor: pointer` y lo deshabilitado `cursor: not-allowed`. Lo resuelve una regla global al final de `src/app/globals.css` (links, botones, roles ARIA clickeables, `label[for]`, `select`, `summary`, inputs tipo range/checkbox/radio/submit/file/color y sus thumbs), así que componentes nuevos no necesitan nada extra. Excepciones a propósito: `.sec-reorder-handle` (`grab`), `.avatar-hud` (easter egg de doble click) y `.md-acc-btn-edit` (contenedor editable). Para chequearlo: con `pnpm dev` corriendo, `pnpm audit:cursor` recorre todas las rutas (home, blog y artículos, contratar, tastes, rothko, privacidad, ingresar, 404) en ES/EN × claro/oscuro con Chrome headless y falla si algo clickeable no tiene el cursor correcto (`AUDIT_URL`, `AUDIT_ROUTES`, `AUDIT_WAIT=load` para apuntar a otro sitio). El admin necesita sesión, así que no se recorre en vivo; lo cubre la regla global.

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
