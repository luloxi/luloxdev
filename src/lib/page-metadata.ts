import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/types";
import { getRequestLocale } from "@/lib/prefs";
import { pathPair } from "@/lib/routes";

/**
 * Per-route share metadata (og:* + twitter:* + canonical + hreflang) in the
 * language of the URL: /contratar -> es (og:locale es_AR), /en/hire -> en
 * (en_US). Cookie and Accept-Language are never read.
 *
 * Child openGraph/twitter objects REPLACE the root ones (no deep merge),
 * so every field the card needs (image, siteName, url) is repeated here.
 */
export type PageCopy = Record<Locale, { title: string | null; description: string }>;

export const ogImageUrl = () => new URL(site.ogImage, site.url).href;

export const OG_LOCALE: Record<Locale, string> = { es: "es_AR", en: "en_US" };

/** "Página | Lulox", or just "Lulox" when title is null (home). */
export const shareTitle = (title: string | null) =>
  title ? `${title} | ${site.name}` : site.name;

/**
 * Short plain-text excerpt of a Markdown body (share card fallback when a post
 * has no summary in that language): no markup, cut at a word, max ~160 chars.
 */
export function excerpt(md: string, max = 160): string {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

const abs = (path: string) => new URL(path, site.url).href;

/** Own canonical + hreflang es-AR / en-US / x-default (= Spanish). */
export function alternatesFor(locale: Locale, paths: Record<Locale, string>): Metadata["alternates"] {
  return {
    canonical: abs(paths[locale]),
    languages: { "es-AR": abs(paths.es), "en-US": abs(paths.en), "x-default": abs(paths.es) },
  };
}

export function buildPageMetadata(
  locale: Locale,
  paths: Record<Locale, string>,
  copy: { title: string | null; description: string },
  extra?: { type?: "website" | "article"; images?: string[] },
): Metadata {
  const full = shareTitle(copy.title);
  const url = abs(paths[locale]);
  const images = extra?.images ?? [ogImageUrl()];
  return {
    title: { absolute: full },
    description: copy.description,
    alternates: alternatesFor(locale, paths),
    openGraph: {
      type: extra?.type ?? "website",
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === "es" ? "en" : "es"]],
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

/** Static route, given by its Spanish path ("/contratar"): copy and URLs in the request's language. */
export async function pageMetadata(esPath: string, copy: PageCopy): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildPageMetadata(locale, pathPair(esPath), copy[locale]);
}
