import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/types";
import { getMetadataLocale } from "@/lib/prefs";

/**
 * Per-route share metadata (og:* + twitter:*), localized by the same
 * ES by default; EN only with an explicit lulox-locale=en cookie (crawlers send none; see getMetadataLocale).
 *
 * Child openGraph/twitter objects REPLACE the root ones (no deep merge),
 * so every field the card needs (image, siteName, url) is repeated here.
 * og:url is always the canonical Spanish path on site.url.
 */
export type PageCopy = Record<Locale, { title: string | null; description: string }>;

export const ogImageUrl = () => new URL(site.ogImage, site.url).href;

/** "Página | Lulox", or just "Lulox" when title is null (home). */
export const shareTitle = (title: string | null) =>
  title ? `${title} | ${site.name}` : site.name;

export function buildPageMetadata(
  locale: Locale,
  path: string,
  copy: { title: string | null; description: string },
  extra?: { type?: "website" | "article"; images?: string[] },
): Metadata {
  const full = shareTitle(copy.title);
  const url = new URL(path, site.url).href;
  const images = extra?.images ?? [ogImageUrl()];
  return {
    title: { absolute: full },
    description: copy.description,
    alternates: { canonical: path },
    openGraph: {
      type: extra?.type ?? "website",
      locale: locale === "es" ? "es_AR" : "en_US",
      alternateLocale: [locale === "es" ? "en_US" : "es_AR"],
      siteName: site.name,
      url,
      title: full,
      description: copy.description,
      images: images.map((u) => ({ url: u, width: 1200, height: 630 })),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: copy.description,
      images,
      creator: site.xHandle,
      site: site.xHandle,
    },
  };
}

/** Static route: pick ES/EN copy from the request locale. */
export async function pageMetadata(path: string, copy: PageCopy): Promise<Metadata> {
  const locale = await getMetadataLocale();
  return buildPageMetadata(locale, path, copy[locale]);
}
