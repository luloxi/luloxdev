"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import type { BlogPost } from "@/content/blog/types";
import { authClient } from "@/lib/auth/client";
import { useLocale } from "@/i18n/locale-provider";

export default function AdminBlogPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const sessionRes = await authClient.getSession();
    const user = sessionRes.data?.user;
    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }
    setEmail(user.email ?? null);

    const res = await fetch("/api/blog");
    if (res.status === 401) {
      router.replace("/auth/sign-in?error=forbidden");
      return;
    }
    if (!res.ok) {
      setError(t.blog.adminLoadError);
      return;
    }
    const data = (await res.json()) as { posts: BlogPost[] };
    setPosts(data.posts);
  }, [router, t.blog.adminLoadError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function signOut() {
    await authClient.signOut();
    router.push("/blog");
  }

  async function remove(slug: string) {
    if (!confirm(t.blog.confirmDelete)) return;
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (res.ok) void load();
  }

  async function togglePublished(post: BlogPost) {
    const next = !post.published;
    setPosts((prev) =>
      prev
        ? prev.map((p) => (p.slug === post.slug ? { ...p, published: next } : p))
        : prev,
    );
    const res = await fetch("/api/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: next }),
    });
    if (!res.ok) {
      setPosts((prev) =>
        prev
          ? prev.map((p) =>
              p.slug === post.slug ? { ...p, published: post.published } : p,
            )
          : prev,
      );
      setError(t.blog.saveError);
    }
  }

  return (
    <PageShell
      title={t.blog.adminTitle}
      backHref="/blog"
      backLabel={t.blog.title}
      footerHref="/blog"
      footerLabel={t.blog.backToBlog}
    >
      <div className="space-y-4">
        <div
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-[color:var(--cp-accent)]">
                {t.blog.adminAs}
              </p>
              <p className="cp-prose mt-1 text-sm">{email ?? "…"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/blog/new" className="blog-admin-btn">
                {t.blog.newPost}
              </Link>
              <button type="button" onClick={() => void signOut()} className="blog-admin-btn-ghost">
                {t.blog.signOut}
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="cp-prose text-[color:var(--section-tastes)]">{error}</p> : null}

        <ul className="space-y-2">
          {(posts ?? []).map((post) => (
            <li
              key={post.slug}
              className="cp-panel"
              style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
            >
              <span className="cp-nav-frame" aria-hidden>
                <span className="cp-nav-corner cp-nav-corner-tl" />
                <span className="cp-nav-corner cp-nav-corner-br" />
              </span>
              <div className="cp-panel-inner flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="cp-row-label text-[0.9rem]">{post.title.es}</p>
                  <p className="font-mono text-[11px] text-muted">/{post.slug}</p>
                  <p
                    className={
                      post.published
                        ? "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--section-blog)]"
                        : "mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"
                    }
                  >
                    {post.published ? t.blog.statusPublished : t.blog.statusDraft}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={post.published}
                    onClick={() => void togglePublished(post)}
                    className={
                      post.published
                        ? "blog-publish-toggle blog-publish-toggle-on"
                        : "blog-publish-toggle"
                    }
                  >
                    <span className="blog-publish-toggle-knob" aria-hidden />
                    <span className="blog-publish-toggle-text">
                      {post.published ? t.blog.statusPublished : t.blog.statusDraft}
                    </span>
                  </button>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="blog-admin-btn-ghost"
                  >
                    {t.blog.view}
                  </Link>
                  <Link
                    href={`/admin/blog/${post.slug}`}
                    className="blog-admin-btn"
                  >
                    {t.blog.edit}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void remove(post.slug)}
                    className="blog-admin-btn-ghost"
                  >
                    {t.blog.delete}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {posts && posts.length === 0 ? (
          <p className="cp-prose">{t.blog.empty}</p>
        ) : null}
      </div>
    </PageShell>
  );
}
