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

export const metadata: Metadata = {
  title: {
    default: `${site.name}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08060e" },
    { media: "(prefers-color-scheme: light)", color: "#f4f0fb" },
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
