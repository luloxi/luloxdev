"use client";

import { CopyMarkdown } from "@/components/copy-markdown";
import Image from "next/image";
import { BlogMarkdown } from "@/components/blog-markdown";
import { PageShell } from "@/components/page-shell";
import { ResearchTopics } from "@/components/research-topics";
import type { BlogPost } from "@/content/blog/types";
import { localizePost } from "@/content/blog/types";
import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";
import { useEditMode } from "@/components/admin-context";
import { useBlogPostEditor } from "@/components/blog-post-edit";
import { useRef, type ReactNode } from "react";
import { ReadingProgress } from "@/components/reading-progress";


function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

type Slots = { titleNode: ReactNode; summaryNode: ReactNode; bodyNode: ReactNode; metaPanel: ReactNode; coverNode: ReactNode; dateNode: ReactNode };

/** One post, rendered on the server (D1). Admin edit mode edits it in place. */
export function BlogPostView({ post }: { post: BlogPost }) {
  const editOn = useEditMode();
  return editOn ? <EditablePost post={post} /> : <PostLayout post={post} />;
}

function EditablePost({ post }: { post: BlogPost }) {
  const slots = useBlogPostEditor(post);
  return <PostLayout post={post} slots={slots} />;
}

function PostLayout({ post, slots }: { post: BlogPost; slots?: Slots }) {
  const { t, locale } = useLocale();
  const L = localizePost(post, locale);
  const articleRef = useRef<HTMLElement>(null);

  return (
    <PageShell
      reading
      title={t.blog.title}
      backHref="/blog"
      backLabel={t.blog.title}
      footerHref="/blog"
      footerLabel={t.blog.backToBlog}
    >
      <ReadingProgress target={articleRef} />
      <article ref={articleRef} className="space-y-6">
        <header
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            {slots ? slots.coverNode : post.coverImage ? (
              <div className="blog-cover">
                <Image
                  src={post.coverImage}
                  alt=""
                  width={120}
                  height={120}
                  className="blog-cover-img"
                  priority
                />
              </div>
            ) : null}
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--cp-accent)]">
              {slots ? slots.dateNode : formatDate(post.publishedAt, locale)}
              {!post.published ? <span className="blog-draft-tag">{t.blog.statusDraft}</span> : null}
            </p>
            {slots ? slots.titleNode : <h1 className="blog-post-title">{L.title}</h1>}
            {slots ? slots.summaryNode : <p className="cp-prose">{L.summary}</p>}
            {slots?.metaPanel}
          </div>
        </header>

        <div
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-blog)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner">
            {slots ? slots.bodyNode : <BlogMarkdown content={L.body} />}
          </div>
        </div>

        {post.topics && post.topics.length > 0 ? (
          <ResearchTopics ids={post.topics} />
        ) : null}

        <aside
          className="cp-panel"
          style={{ ["--cp-accent" as string]: "var(--section-contact)" }}
        >
          <span className="cp-nav-frame" aria-hidden>
            <span className="cp-nav-corner cp-nav-corner-tl" />
            <span className="cp-nav-corner cp-nav-corner-br" />
          </span>
          <div className="cp-panel-inner space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--cp-accent)]">
              {t.blog.authorHeading}
            </p>
            <CopyMarkdown copyKey="blog.authorBio" text={t.blog.authorBio} />
            <Link href="/contacto" className="blog-author-contact">
              {t.blog.authorContact}
              <span aria-hidden>▸</span>
            </Link>
          </div>
        </aside>
      </article>
    </PageShell>
  );
}
