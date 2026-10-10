import { seedPosts } from "@/content/blog/seed";
import {
  rowToPost,
  type BlogPost,
  type BlogPostRow,
} from "@/content/blog/types";
import { getDb, nowIso, requireDb } from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

/**
 * Schema lives in migrations/0001_init.sql (applied with wrangler d1 migrations).
 * This only seeds the default posts if the table is empty (fresh local DB).
 */
export async function ensureBlogSchemaAndSeed() {
  const db = await getDb();
  if (!db) return;
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const row = await db
        .prepare("SELECT COUNT(*) AS n FROM blog_posts")
        .first<{ n: number }>();
      if (Number(row?.n ?? 0) > 0) return;
      await db.batch(
        seedPosts.map((post) =>
          db
            .prepare(
              `INSERT INTO blog_posts (
                slug, published_at, cover_image, tags,
                title_es, title_en, summary_es, summary_en,
                body_es, body_en, published, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT (slug) DO NOTHING`,
            )
            .bind(
              post.slug,
              toIsoDate(post.publishedAt),
              post.coverImage,
              JSON.stringify(post.tags ?? []),
              post.title.es,
              post.title.en,
              post.summary.es,
              post.summary.en,
              post.body.es,
              post.body.en,
              post.published !== false ? 1 : 0,
              nowIso(),
            ),
        ),
      );
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }
  await ensurePromise;
}

/** Normalize YYYY-MM-DD or any ISO string to full ISO UTC (matches Neon export). */
function toIsoDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? nowIso() : d.toISOString();
}

type D1BlogRow = Omit<BlogPostRow, "tags" | "published"> & {
  tags: string | null;
  published: number;
};

function d1RowToPost(row: D1BlogRow): BlogPost {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags ?? "[]") as unknown;
    if (Array.isArray(parsed)) tags = parsed.map(String);
  } catch {
    tags = [];
  }
  return rowToPost({ ...row, tags, published: row.published === 1 });
}

function sortByDateDesc(posts: BlogPost[]) {
  return [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function seedPostsFiltered(includeDrafts?: boolean) {
  const posts = includeDrafts
    ? seedPosts
    : seedPosts.filter((p) => p.published !== false);
  return sortByDateDesc(posts);
}

function seedPostBySlug(slug: string, includeDrafts?: boolean) {
  const post = seedPosts.find((p) => p.slug === slug) ?? null;
  if (!post) return null;
  if (!includeDrafts && post.published === false) return null;
  return post;
}

export async function getAllPosts(opts?: {
  includeDrafts?: boolean;
}): Promise<BlogPost[]> {
  const db = await getDb();
  if (!db) {
    return seedPostsFiltered(opts?.includeDrafts);
  }

  try {
    await ensureBlogSchemaAndSeed();
    const { results } = await db
      .prepare(
        opts?.includeDrafts
          ? "SELECT * FROM blog_posts ORDER BY published_at DESC"
          : "SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC",
      )
      .all<D1BlogRow>();
    return results.map(d1RowToPost);
  } catch (err) {
    console.error("[blog] getAllPosts fallback to seed:", err);
    return seedPostsFiltered(opts?.includeDrafts);
  }
}

export async function getPostBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<BlogPost | null> {
  const db = await getDb();
  if (!db) {
    return seedPostBySlug(slug, opts?.includeDrafts);
  }

  try {
    await ensureBlogSchemaAndSeed();
    const row = await db
      .prepare(
        opts?.includeDrafts
          ? "SELECT * FROM blog_posts WHERE slug = ? LIMIT 1"
          : "SELECT * FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1",
      )
      .bind(slug)
      .first<D1BlogRow>();
    return row ? d1RowToPost(row) : null;
  } catch (err) {
    console.error("[blog] getPostBySlug fallback to seed:", err);
    return seedPostBySlug(slug, opts?.includeDrafts);
  }
}

export async function upsertPost(post: BlogPost) {
  await ensureBlogSchemaAndSeed();
  const db = await requireDb();
  await db
    .prepare(
      `INSERT INTO blog_posts (
        slug, published_at, cover_image, tags,
        title_es, title_en, summary_es, summary_en,
        body_es, body_en, published, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (slug) DO UPDATE SET
        published_at = excluded.published_at,
        cover_image = excluded.cover_image,
        tags = excluded.tags,
        title_es = excluded.title_es,
        title_en = excluded.title_en,
        summary_es = excluded.summary_es,
        summary_en = excluded.summary_en,
        body_es = excluded.body_es,
        body_en = excluded.body_en,
        published = excluded.published,
        updated_at = excluded.updated_at`,
    )
    .bind(
      post.slug,
      toIsoDate(post.publishedAt),
      post.coverImage,
      JSON.stringify(post.tags ?? []),
      post.title.es,
      post.title.en,
      post.summary.es,
      post.summary.en,
      post.body.es,
      post.body.en,
      post.published ? 1 : 0,
      nowIso(),
    )
    .run();
}

export async function deletePost(slug: string) {
  await ensureBlogSchemaAndSeed();
  const db = await requireDb();
  await db.prepare("DELETE FROM blog_posts WHERE slug = ?").bind(slug).run();
}

export async function requireAdminSession() {
  const { getAuth } = await import("@/lib/auth/server");
  const { isAdminUser } = await import("@/lib/auth/admin");
  const { headers } = await import("next/headers");

  const auth = await getAuth();
  if (!auth) {
    return { ok: false as const, reason: "auth_not_configured" as const };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user || !isAdminUser(user)) {
    return { ok: false as const, reason: "unauthorized" as const, user };
  }

  return { ok: true as const, user, session };
}
