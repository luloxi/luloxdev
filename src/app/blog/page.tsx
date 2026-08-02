"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CyberLoader } from "@/components/cyber-loader";
import { PageShell } from "@/components/page-shell";
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

export default function BlogPage() {
  const { t, locale } = useLocale();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blog/public")
      .then((r) => r.json())
      .then((data: { posts?: BlogPost[] }) => {
        if (!cancelled) setPosts(data.posts ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell title={t.blog.title}>
      <div className="space-y-4">
        {error ? (
          <p className="cp-prose text-[color:var(--section-tastes)]">
            {t.blog.loadError}
          </p>
        ) : null}

        {posts === null && !error ? <CyberLoader /> : null}

        <ul className="space-y-3">
          {(posts ?? []).map((post) => {
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

        {posts && posts.length === 0 ? (
          <p className="cp-prose">{t.blog.empty}</p>
        ) : null}
      </div>
    </PageShell>
  );
}
