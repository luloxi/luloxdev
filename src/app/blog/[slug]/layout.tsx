import type { Metadata } from "next";
import { localizePost } from "@/content/blog/types";
import { getPublishedPost } from "@/lib/blog";
import { getServerPrefs } from "@/lib/prefs";
import { site } from "@/content/site";
import { shareTitle } from "@/lib/page-metadata";

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
  const { locale } = await getServerPrefs();
  const L = localizePost(post, locale);
  const url = `/blog/${post.slug}`;
  const full = shareTitle(L.title);
  // Own cover if any, else the site share image (child openGraph replaces the root one).
  const images = [{ url: new URL(post.coverImage ?? site.ogImage, site.url).href }];
  return {
    title: { absolute: full },
    description: L.summary,
    alternates: { canonical: url },
    keywords: post.tags,
    openGraph: {
      type: "article",
      locale: locale === "es" ? "es_AR" : "en_US",
      url: new URL(url, site.url).href,
      siteName: site.name,
      title: full,
      description: L.summary,
      publishedTime: post.publishedAt,
      authors: ["Luciano Oliva Bianco"],
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: L.summary,
      images: images.map((i) => i.url),
      creator: site.xHandle,
      site: site.xHandle,
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
