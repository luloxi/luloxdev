import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { seedPosts } from "../src/content/blog/seed.ts";

try {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* ignore */
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const sql = neon(process.env.DATABASE_URL);

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
      -- Keep admin publish state; only insert uses seed published flag
      updated_at = NOW()
  `;
  console.log("upserted", post.slug, "(published not overwritten on conflict)");
}

console.log("done", seedPosts.length);
