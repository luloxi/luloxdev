import type { MetadataRoute } from "next";
import { pastProjects } from "@/content/projects";
import { site } from "@/content/site";
import { getPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const now = new Date();
  const pages = ["", "/sobre-mi", "/proyectos", "/blog", "/contacto", "/privacidad"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === "/blog" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    }),
  );
  const projects = pastProjects.map((p) => ({
    url: `${base}/projects/${p.id}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = (await getPublishedPosts()).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] posts", err);
  }
  return [...pages, ...projects, ...posts];
}
