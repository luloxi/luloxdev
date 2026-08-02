"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogEditor } from "@/components/blog-editor";
import { PageShell } from "@/components/page-shell";
import type { BlogPost } from "@/content/blog/types";
import { useLocale } from "@/i18n/locale-provider";

export default function EditBlogPostPage() {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug ?? "");
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch("/api/blog")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/auth/sign-in?error=forbidden");
          return null;
        }
        return r.json();
      })
      .then((data: { posts?: BlogPost[] } | null) => {
        if (cancelled || !data) return;
        const found = data.posts?.find((p) => p.slug === slug) ?? null;
        setPost(found);
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  if (post === undefined) {
    return (
      <PageShell title={t.blog.edit} backHref="/admin/blog" backLabel={t.blog.adminTitle}>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--section-blog)]">
          {t.blog.loading}
        </p>
      </PageShell>
    );
  }

  if (post === null) {
    return (
      <PageShell title={t.blog.edit} backHref="/admin/blog" backLabel={t.blog.adminTitle}>
        <p className="cp-prose">{t.blog.notFound}</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={t.blog.edit}
      backHref="/admin/blog"
      backLabel={t.blog.adminTitle}
      footerHref="/admin/blog"
      footerLabel={t.blog.adminTitle}
    >
      <div
        className="cp-panel"
        style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
      >
        <span className="cp-nav-frame" aria-hidden>
          <span className="cp-nav-corner cp-nav-corner-tl" />
          <span className="cp-nav-corner cp-nav-corner-br" />
        </span>
        <div className="cp-panel-inner">
          <BlogEditor initial={post} />
        </div>
      </div>
    </PageShell>
  );
}
