import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { CosmicBg } from "@/components/cosmic-bg";
import { SiteControls } from "@/components/site-controls";
import { LocaleProvider } from "@/i18n/locale-provider";
import { getServerPrefs } from "@/lib/prefs";
import { getCopyOverrides } from "@/lib/site-copy";
import { isAdminRequest } from "@/lib/admin-request";
import { AdminProvider } from "@/components/admin-context";
import { PREFS_HEAD_SCRIPT } from "@/lib/prefs-shared";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site } from "@/content/site";
import { buildPageMetadata } from "@/lib/page-metadata";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return site.url;
}

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: "Luciano Oliva Bianco", url: siteUrl() }],
  creator: site.name,
  keywords: [
    "Lulox",
    "Luciano Oliva Bianco",
    "AI",
    "blockchain",
    "tokenización",
    "comercio agéntico",
    "Midnight",
    "Cardano",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    alternateLocale: ["en_US"],
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: "/",
    images: [
      {
        url: new URL(site.ogImage, site.url).href,
        width: 1200,
        height: 630,
        alt: `${site.name} · Luciano Oliva Bianco`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [new URL(site.ogImage, site.url).href],
    creator: site.xHandle,
    site: site.xHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Home share card stays "Lulox"; description follows the request locale. */
const HOME_DESCRIPTION = {
  es: site.description,
  en: "I'm Luciano Oliva Bianco (Lulox). I research and build with AI, blockchain, tokenization and agentic commerce.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerPrefs();
  const home = buildPageMetadata(locale, "/", { title: null, description: HOME_DESCRIPTION[locale] });
  // Keep the "%s | Lulox" template for routes that only set a plain title.
  return { ...baseMetadata, ...home, title: baseMetadata.title };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0607" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Per-request: language + theme from cookies (else Accept-Language / dark).
  const [{ locale, theme }, overrides, isAdmin] = await Promise.all([
    getServerPrefs(),
    getCopyOverrides(),
    isAdminRequest(),
  ]);
  return (
    <html
      lang={locale}
      data-ssr-locale={locale}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${orbitron.variable} ${theme} h-full`}
      style={{ colorScheme: theme === "light" ? "only light" : "dark" }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_HEAD_SCRIPT }} />
      </head>
      <body
        className={`${spaceGrotesk.className} relative min-h-full`}
        suppressHydrationWarning
      >
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider initialLocale={locale} overrides={overrides}>
            <CosmicBg />
            <SiteControls isAdmin={isAdmin} />
            <AdminProvider isAdmin={isAdmin}>
              <div className="relative z-10">{children}</div>
            </AdminProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
