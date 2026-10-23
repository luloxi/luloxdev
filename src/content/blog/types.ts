import type { Locale } from "@/i18n/types";

export type BlogPost = {
  /** Spanish URL slug (/blog/<slug>), primary key. */
  slug: string;
  /** English URL slug (/en/blog/<slugEn>). null/missing: /en/blog/<slug> is used. */
  slugEn?: string | null;
  /** ISO date string (YYYY-MM-DD or full ISO) */
  publishedAt: string;
  /** Cover image path under /public or absolute URL */
  coverImage: string;
  tags: string[];
  /** Opt-in research topic ids explained at the end of the post */
  topics?: string[];
  /** Public listing / public post page when true */
  published: boolean;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  /** Markdown body per locale */
  body: Record<Locale, string>;
};

export type BlogPostRow = {
  slug: string;
  slug_en?: string | null;
  published_at: string;
  cover_image: string;
  tags: string[] | null;
  topics?: string[] | null;
  title_es: string;
  title_en: string;
  summary_es: string;
  summary_en: string;
  body_es: string;
  body_en: string;
  published: boolean;
  updated_at: string;
};

export function rowToPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    slugEn: row.slug_en || null,
    publishedAt: row.published_at,
    coverImage: row.cover_image,
    tags: row.tags ?? [],
    topics: row.topics ?? [],
    published: Boolean(row.published),
    title: { es: row.title_es, en: row.title_en },
    summary: { es: row.summary_es, en: row.summary_en },
    body: { es: row.body_es, en: row.body_en },
  };
}

export function localizePost(post: BlogPost, locale: Locale) {
  return {
    slug: post.slug,
    slugEn: post.slugEn ?? null,
    publishedAt: post.publishedAt,
    coverImage: post.coverImage,
    tags: post.tags,
    topics: post.topics ?? [],
    title: post.title[locale],
    summary: post.summary[locale],
    body: post.body[locale],
  };
}
