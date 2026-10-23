import { PageShell } from "@/components/page-shell";

import { pageMetadata } from "@/lib/page-metadata";
import { getRequestLocale } from "@/lib/prefs";

export function generateMetadata() {
  return pageMetadata("/privacidad", {
    es: { title: "Privacidad", description: "Cómo maneja los datos este sitio: sin tracking, login con Google solo para el dueño." },
    en: { title: "Privacy", description: "How this site handles data: no tracking, Google sign-in only for the site owner." },
  });
}

const CONTACT = "lucianoolivabianco@gmail.com";

const TEXT = {
  es: {
    title: "Privacidad",
    intro: "lulox.com.ar es el sitio personal de Luciano Oliva Bianco. Esta página explica qué datos usa el sitio. Última actualización: 23 de octubre de 2026.",
    blocks: [
      ["Visitantes.", "Podés leer todo el sitio sin cuenta. No hay publicidad, trackers de analítica ni cookies de terceros, y no vendemos ni compartimos datos personales con nadie."],
      ["Ingreso con Google.", "\u201cIngresar con Google\u201d lo usa solo el dueño del sitio para entrar al área privada donde se editan artículos y proyectos. Cuando se usa, el sitio recibe el nombre, el email y la foto de perfil de la cuenta de Google, y solo se permite el email del dueño. Las demás cuentas se rechazan y no se guardan."],
      ["Cookies.", "El sitio usa unas pocas cookies propias, sin seguimiento: lulox-locale y lulox-theme recuerdan el idioma y el tema que elegiste. Si el admin ingresa, se suman la cookie de sesión de Better Auth, necesaria para que siga logueado, y lulox-edit-mode, que recuerda si tiene activado el modo edición. No se guarda nada más sobre los visitantes."],
      ["Hosting.", "El sitio corre en Cloudflare, que procesa datos estándar de cada pedido (como la dirección IP) para servir y proteger el sitio, bajo su propia política de privacidad."],
      ["Contacto.", "Preguntas o pedidos de borrado:"],
    ],
  },
  en: {
    title: "Privacy",
    intro: "lulox.com.ar is the personal site of Luciano Oliva Bianco. This page explains what data the site uses. Last updated: October 23, 2026.",
    blocks: [
      ["Visitors.", "You can read everything on this site without an account. We don't run ads, analytics trackers or third-party cookies, and we don't sell or share personal data with anyone."],
      ["Google sign-in.", "\u201cSign in with Google\u201d is only used by the site owner to reach the private admin area where posts and projects are edited. When used, the site receives the Google account's name, email address and profile picture, and only the owner's email is allowed in. Other accounts are rejected and not stored."],
      ["Cookies.", "The site uses a few first-party cookies, no tracking: lulox-locale and lulox-theme remember the language and theme you picked. When the admin signs in, the Better Auth session cookie (needed to stay logged in) and lulox-edit-mode (whether edit mode is on) are added. Nothing else is stored about visitors."],
      ["Hosting.", "The site runs on Cloudflare, which processes standard request data (such as IP address) to deliver and protect the site, under its own privacy policy."],
      ["Contact.", "Questions or deletion requests:"],
    ],
  },
} as const;

/** Body in the URL's language: /privacidad (es), /en/privacy (en). */
export default async function PrivacyPage() {
  const T = TEXT[await getRequestLocale()];
  const last = T.blocks.length - 1;
  return (
    <PageShell title={T.title}>
      <div
        className="cp-panel"
        style={{ ["--cp-accent" as string]: "var(--section-about)" }}
      >
        <span className="cp-nav-frame" aria-hidden>
          <span className="cp-nav-corner cp-nav-corner-tl" />
          <span className="cp-nav-corner cp-nav-corner-br" />
        </span>
        <div className="cp-panel-inner space-y-4">
          <p className="cp-prose">{T.intro}</p>
          {T.blocks.map(([b, text], i) => (
            <p key={b} className="cp-prose">
              <strong>{b}</strong> {text}
              {i === last ? (
                <>
                  {" "}
                  <a href={`mailto:${CONTACT}`} className="cp-prose-link">
                    {CONTACT}
                  </a>
                  .
                </>
              ) : null}
            </p>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
