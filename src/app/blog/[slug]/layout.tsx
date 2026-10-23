import type { Metadata } from "next";
import { localizePost } from "@/content/blog/types";
import { getPublishedPost } from "@/lib/blog";
import { getRequestLocale } from "@/lib/prefs";
import { site } from "@/content/site";
import { OG_LOCALE, alternatesFor, excerpt, shareTitle } from "@/lib/page-metadata";
import { blogPostPath } from "@/lib/routes";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Published only: drafts must not leak their title/summary.
  const post = await getPublishedPost(slug);
  if (!post) {
    return { title: "Blog", robots: { index: false } };
  }
  // Language = URL's: /blog/<slug> es, /en/blog/<slug_en> en (proxy.ts rewrites the latter here).
  const locale = await getRequestLocale();
  const L = localizePost(post, locale);
  const paths = { es: blogPostPath("es", post), en: blogPostPath("en", post) };
  const url = paths[locale];
  const full = shareTitle(L.title || post.title.es);
  // Share text: the summary in this language, else the start of the article, else the blog line.
  const description =
    L.summary.trim() ||
    excerpt(L.body) ||
    (locale === "es"
      ? "Artículos sobre AI, blockchain, tokenización y comercio agéntico."
      : "Articles on AI, blockchain, tokenization and agentic commerce.");
  // Own cover if any, else the site share image (child openGraph replaces the root one).
  const images = [{ url: new URL(post.coverImage || site.ogImage, site.url).href }];
  return {
    title: { absolute: full },
    description,
    alternates: alternatesFor(locale, paths),
    keywords: post.tags,
    openGraph: {
      type: "article",
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === "es" ? "en" : "es"]],
      url: new URL(url, site.url).href,
      siteName: site.name,
      title: full,
      description,
      publishedTime: post.publishedAt,
      authors: ["Luciano Oliva Bianco"],
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: images.map((i) => i.url),
      creator: site.xHandle,
      site: site.xHandle,
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
