import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { CosmicBg } from "@/components/cosmic-bg";
import { LocaleProvider } from "@/i18n/locale-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
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
      className={`${inter.variable} ${syne.variable} dark h-full`}
    >
      <body className={`${inter.className} relative min-h-full`}>
        <ThemeProvider>
          <LocaleProvider>
            <CosmicBg />
            <div className="relative z-10">{children}</div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
