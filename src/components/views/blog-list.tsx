"use client";

import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { useIsAdmin } from "@/components/admin-context";
import type { BlogPost } from "@/content/blog/types";
import { localizePost } from "@/content/blog/types";
import { useLocale } from "@/i18n/locale-provider";

function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/** Blog index, rendered on the server with posts from D1 (published only). */
export function BlogList({ posts, error }: { posts: BlogPost[]; error?: boolean }) {
  const { t, locale } = useLocale();
  const isAdmin = useIsAdmin();

  return (
    <PageShell title={t.blog.title}>
      {isAdmin ? (
        <div className="mb-5 flex">
          <Link href="/rothko" className="admin-pill">
            {locale === "es" ? "Administrar blog" : "Manage blog"}
          </Link>
        </div>
      ) : null}
      <div className="space-y-4">
        {error ? (
          <p className="cp-prose text-[color:var(--section-tastes)]">
            {t.blog.loadError}
          </p>
        ) : null}

        <ul className="space-y-3">
          {posts.map((post) => {
            const L = localizePost(post, locale);
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="cp-panel blog-card group block"
                  style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
                >
                  <span className="cp-nav-frame" aria-hidden>
                    <span className="cp-nav-corner cp-nav-corner-tl" />
                    <span className="cp-nav-corner cp-nav-corner-br" />
                  </span>
                  <div className="cp-panel-inner flex items-center gap-4">
                    {post.coverImage ? (
                      <span className="blog-card-icon">
                        <Image
                          src={post.coverImage}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] text-[color:var(--cp-accent)]">
                        {formatDate(post.publishedAt, locale)}
                      </p>
                      <p className="cp-row-label mt-1.5 text-[0.95rem] leading-snug">
                        {L.title}
                      </p>
                      <p className="cp-prose mt-2 text-[0.88rem] line-clamp-3">
                        {L.summary}
                      </p>
                    </div>
                    <span
                      className="cp-nav-chevron self-center opacity-70 group-hover:opacity-100"
                      aria-hidden
                    >
                      ▸
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {!error && posts.length === 0 ? (
          <p className="cp-prose">{t.blog.empty}</p>
        ) : null}
      </div>
    </PageShell>
  );
}
