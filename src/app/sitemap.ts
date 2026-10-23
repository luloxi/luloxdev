import type { MetadataRoute } from "next";
import { pastProjects } from "@/content/projects";
import { site } from "@/content/site";
import { getPublishedPosts } from "@/lib/blog";
import { blogPostPath, pathPair } from "@/lib/routes";
import type { Locale } from "@/i18n/types";

export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

/** One <url> per language, each listing both versions as hreflang alternates. */
function both(paths: Record<Locale, string>, rest: Omit<Entry, "url" | "alternates">): Entry[] {
  const abs = (p: string) => `${site.url}${p === "/" ? "" : p}`;
  const alternates = { languages: { "es-AR": abs(paths.es), "en-US": abs(paths.en), "x-default": abs(paths.es) } };
  return (["es", "en"] as const).map((l) => ({ url: abs(paths[l]), alternates, ...rest }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ["/", "/sobre-mi", "/proyectos", "/blog", "/contacto", "/contratar", "/privacidad"].flatMap((path) =>
    both(pathPair(path), {
      lastModified: now,
      changeFrequency: path === "/blog" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
    }),
  );
  const projects = pastProjects.flatMap((p) =>
    both(pathPair(`/proyectos/${p.id}`), { changeFrequency: "yearly", priority: 0.5 }),
  );
  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = (await getPublishedPosts()).flatMap((p) =>
      both(
        { es: blogPostPath("es", p), en: blogPostPath("en", p) },
        { lastModified: new Date(p.publishedAt), changeFrequency: "monthly", priority: 0.8 },
      ),
    );
  } catch (err) {
    console.error("[sitemap] posts", err);
  }
  return [...pages, ...projects, ...posts];
}
