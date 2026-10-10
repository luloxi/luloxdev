/**
 * Seed the default blog posts into D1 (only inserts slugs that don't exist yet,
 * never overwrites edits or drafts made in /rothko).
 *
 *   pnpm seed:blog            # local D1 (.wrangler/state)
 *   pnpm seed:blog --remote   # Cloudflare D1 "luloxdev"
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { seedPosts } from "../src/content/blog/seed.ts";

const remote = process.argv.includes("--remote");
const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const now = new Date().toISOString();

const statements = seedPosts.map((post) => {
  const publishedAt = new Date(post.publishedAt).toISOString();
  const values = [
    q(post.slug),
    q(publishedAt),
    q(post.coverImage ?? ""),
    q(JSON.stringify(post.tags ?? [])),
    q(post.title.es),
    q(post.title.en),
    q(post.summary.es),
    q(post.summary.en),
    q(post.body.es),
    q(post.body.en),
    post.published !== false ? "1" : "0",
    q(now),
  ].join(", ");
  return `INSERT INTO blog_posts (slug, published_at, cover_image, tags, title_es, title_en, summary_es, summary_en, body_es, body_en, published, updated_at) VALUES (${values}) ON CONFLICT (slug) DO NOTHING;`;
});

mkdirSync(".wrangler", { recursive: true });
const file = ".wrangler/seed-blog.sql";
writeFileSync(file, statements.join("\n") + "\n");

execFileSync(
  "wrangler",
  ["d1", "execute", "luloxdev", remote ? "--remote" : "--local", "--file", file, "-y"],
  { stdio: "inherit" },
);
console.log(`Seeded ${statements.length} posts (existing slugs untouched) into ${remote ? "remote" : "local"} D1.`);
