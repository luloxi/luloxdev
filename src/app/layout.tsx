import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { CosmicBg } from "@/components/cosmic-bg";
import { SiteControls } from "@/components/site-controls";
import { LocaleProvider } from "@/i18n/locale-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site } from "@/content/site";
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

export const metadata: Metadata = {
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
        url: site.avatar,
        width: 1551,
        height: 1551,
        alt: `${site.name} · Luciano Oliva Bianco`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [site.avatar],
    creator: site.xHandle,
    site: site.xHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08060e" },
    { media: "(prefers-color-scheme: light)", color: "#efeaf7" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${orbitron.variable} dark h-full`}
    >
      <body
        className={`${spaceGrotesk.className} relative min-h-full`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LocaleProvider>
            <CosmicBg />
            <SiteControls />
            <div className="relative z-10">{children}</div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
