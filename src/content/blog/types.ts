import type { Locale } from "@/i18n/types";

export type BlogPost = {
  slug: string;
  /** ISO date string (YYYY-MM-DD or full ISO) */
  publishedAt: string;
  /** Cover image path under /public or absolute URL */
  coverImage: string;
  tags: string[];
  /** Public listing / public post page when true */
  published: boolean;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  /** Markdown body per locale */
  body: Record<Locale, string>;
};

export type BlogPostRow = {
  slug: string;
  published_at: string;
  cover_image: string;
  tags: string[] | null;
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
    publishedAt: row.published_at,
    coverImage: row.cover_image,
    tags: row.tags ?? [],
    published: Boolean(row.published),
    title: { es: row.title_es, en: row.title_en },
    summary: { es: row.summary_es, en: row.summary_en },
    body: { es: row.body_es, en: row.body_en },
  };
}

export function localizePost(post: BlogPost, locale: Locale) {
  return {
    slug: post.slug,
    publishedAt: post.publishedAt,
    coverImage: post.coverImage,
    tags: post.tags,
    title: post.title[locale],
    summary: post.summary[locale],
    body: post.body[locale],
  };
}
