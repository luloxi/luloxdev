import { seedPosts } from "@/content/blog/seed";
import {
  rowToPost,
  type BlogPost,
  type BlogPostRow,
} from "@/content/blog/types";
import { getSql, hasDatabase } from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

export async function ensureBlogSchemaAndSeed() {
  if (!hasDatabase()) return;
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
          slug TEXT PRIMARY KEY,
          published_at TIMESTAMPTZ NOT NULL,
          cover_image TEXT NOT NULL DEFAULT '',
          tags TEXT[] NOT NULL DEFAULT '{}',
          title_es TEXT NOT NULL,
          title_en TEXT NOT NULL,
          summary_es TEXT NOT NULL,
          summary_en TEXT NOT NULL,
          body_es TEXT NOT NULL,
          body_en TEXT NOT NULL,
          published BOOLEAN NOT NULL DEFAULT true,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      const countRows = await sql`SELECT COUNT(*)::int AS n FROM blog_posts`;
      const n = Number((countRows[0] as { n: number }).n ?? 0);
      if (n > 0) return;

      for (const post of seedPosts) {
        await sql`
          INSERT INTO blog_posts (
            slug, published_at, cover_image, tags,
            title_es, title_en, summary_es, summary_en,
            body_es, body_en, published, updated_at
          ) VALUES (
            ${post.slug},
            ${post.publishedAt},
            ${post.coverImage},
            ${post.tags as unknown as string},
            ${post.title.es},
            ${post.title.en},
            ${post.summary.es},
            ${post.summary.en},
            ${post.body.es},
            ${post.body.en},
            ${post.published !== false},
            NOW()
          )
          ON CONFLICT (slug) DO NOTHING
        `;
      }
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }
  await ensurePromise;
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
  if (!hasDatabase()) {
    return seedPostsFiltered(opts?.includeDrafts);
  }

  try {
    await ensureBlogSchemaAndSeed();
    const sql = getSql();
    const rows = opts?.includeDrafts
      ? await sql`SELECT * FROM blog_posts ORDER BY published_at DESC`
      : await sql`
          SELECT * FROM blog_posts
          WHERE published = true
          ORDER BY published_at DESC
        `;
    return (rows as BlogPostRow[]).map(rowToPost);
  } catch (err) {
    console.error("[blog] getAllPosts fallback to seed:", err);
    return seedPostsFiltered(opts?.includeDrafts);
  }
}

export async function getPostBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<BlogPost | null> {
  if (!hasDatabase()) {
    return seedPostBySlug(slug, opts?.includeDrafts);
  }

  try {
    await ensureBlogSchemaAndSeed();
    const sql = getSql();
    const rows = opts?.includeDrafts
      ? await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1`
      : await sql`
          SELECT * FROM blog_posts
          WHERE slug = ${slug} AND published = true
          LIMIT 1
        `;
    const row = (rows as BlogPostRow[])[0];
    return row ? rowToPost(row) : null;
  } catch (err) {
    console.error("[blog] getPostBySlug fallback to seed:", err);
    return seedPostBySlug(slug, opts?.includeDrafts);
  }
}

export async function upsertPost(post: BlogPost) {
  await ensureBlogSchemaAndSeed();
  const sql = getSql();
  const published = post.published;

  await sql`
    INSERT INTO blog_posts (
      slug, published_at, cover_image, tags,
      title_es, title_en, summary_es, summary_en,
      body_es, body_en, published, updated_at
    ) VALUES (
      ${post.slug},
      ${post.publishedAt},
      ${post.coverImage},
      ${post.tags as unknown as string},
      ${post.title.es},
      ${post.title.en},
      ${post.summary.es},
      ${post.summary.en},
      ${post.body.es},
      ${post.body.en},
      ${published},
      NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      published_at = EXCLUDED.published_at,
      cover_image = EXCLUDED.cover_image,
      tags = EXCLUDED.tags,
      title_es = EXCLUDED.title_es,
      title_en = EXCLUDED.title_en,
      summary_es = EXCLUDED.summary_es,
      summary_en = EXCLUDED.summary_en,
      body_es = EXCLUDED.body_es,
      body_en = EXCLUDED.body_en,
      published = EXCLUDED.published,
      updated_at = NOW()
  `;
}

export async function deletePost(slug: string) {
  await ensureBlogSchemaAndSeed();
  const sql = getSql();
  await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
}

export async function requireAdminSession() {
  const { auth, isAuthConfigured } = await import("@/lib/auth/server");
  const { isAdminUser } = await import("@/lib/auth/admin");

  if (!isAuthConfigured() || !auth) {
    return { ok: false as const, reason: "auth_not_configured" as const };
  }

  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user || !isAdminUser(user)) {
    return { ok: false as const, reason: "unauthorized" as const, user };
  }

  return { ok: true as const, user, session };
}
