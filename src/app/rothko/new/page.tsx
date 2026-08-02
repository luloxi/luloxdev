"use client";

import { BlogEditor } from "@/components/blog-editor";
import { PageShell } from "@/components/page-shell";
import { useLocale } from "@/i18n/locale-provider";

export default function NewBlogPostPage() {
  const { t } = useLocale();

  return (
    <PageShell
      title={t.blog.newPost}
      backHref="/rothko"
      backLabel={t.blog.adminTitle}
      footerHref="/rothko"
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
          <BlogEditor isNew />
        </div>
      </div>
    </PageShell>
  );
}
