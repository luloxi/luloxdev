import type { Metadata } from "next";
import { localizePost } from "@/content/blog/types";
import { getPublishedPost } from "@/lib/blog";
import { getServerPrefs } from "@/lib/prefs";

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
  const images = post.coverImage ? [{ url: post.coverImage }] : undefined;
  return {
    title: L.title,
    description: L.summary,
    alternates: { canonical: url },
    keywords: post.tags,
    openGraph: {
      type: "article",
      locale: locale === "es" ? "es_AR" : "en_US",
      url,
      title: L.title,
      description: L.summary,
      publishedTime: post.publishedAt,
      authors: ["Luciano Oliva Bianco"],
      tags: post.tags,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary",
      title: L.title,
      description: L.summary,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
