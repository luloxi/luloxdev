"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlogPost } from "@/content/blog/types";
import { useLocale } from "@/i18n/locale-provider";

type Props = {
  initial?: BlogPost;
  isNew?: boolean;
};

export function BlogEditor({ initial, isNew }: Props) {
  const { t } = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [publishedAt, setPublishedAt] = useState(
    (initial?.publishedAt ?? new Date().toISOString()).slice(0, 10),
  );
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [titleEs, setTitleEs] = useState(initial?.title.es ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? "");
  const [summaryEs, setSummaryEs] = useState(initial?.summary.es ?? "");
  const [summaryEn, setSummaryEn] = useState(initial?.summary.en ?? "");
  const [bodyEs, setBodyEs] = useState(initial?.body.es ?? "");
  const [bodyEn, setBodyEn] = useState(initial?.body.en ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  async function save() {
    setSaving(true);
    setError(null);
    const payload: BlogPost = {
      slug: slug.trim(),
      publishedAt,
      coverImage: coverImage.trim(),
      tags: initial?.tags ?? [],
      published,
      title: { es: titleEs, en: titleEn },
      summary: { es: summaryEs, en: summaryEn },
      body: { es: bodyEs, en: bodyEn },
    };

    const res = await fetch("/api/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      setError(t.blog.saveError);
      return;
    }
    const data = (await res.json()) as { slug: string };
    router.push(`/admin/blog/${data.slug}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="blog-field">
        <label className="blog-label" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className="blog-input"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={!isNew && Boolean(initial?.slug)}
          placeholder="mi-articulo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="blog-field">
          <label className="blog-label" htmlFor="date">
            {t.blog.fieldDate}
          </label>
          <input
            id="date"
            type="date"
            className="blog-input"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <div className="blog-field">
          <label className="blog-label" htmlFor="cover">
            {t.blog.fieldCover}
          </label>
          <input
            id="cover"
            className="blog-input"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="/projects/focus/lcp.svg"
          />
        </div>
      </div>

      <div className="blog-field">
        <span className="blog-label">{t.blog.fieldPublished}</span>
        <button
          type="button"
          role="switch"
          aria-checked={published}
          onClick={() => setPublished((v) => !v)}
          className={
            published ? "blog-publish-toggle blog-publish-toggle-on" : "blog-publish-toggle"
          }
        >
          <span className="blog-publish-toggle-knob" aria-hidden />
          <span className="blog-publish-toggle-text">
            {published ? t.blog.statusPublished : t.blog.statusDraft}
          </span>
        </button>
      </div>

      <fieldset className="blog-fieldset">
        <legend className="blog-legend">ES</legend>
        <div className="blog-field">
          <label className="blog-label" htmlFor="title-es">
            {t.blog.fieldTitle}
          </label>
          <input
            id="title-es"
            className="blog-input"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
          />
        </div>
        <div className="blog-field">
          <label className="blog-label" htmlFor="summary-es">
            {t.blog.fieldSummary}
          </label>
          <textarea
            id="summary-es"
            className="blog-textarea"
            rows={2}
            value={summaryEs}
            onChange={(e) => setSummaryEs(e.target.value)}
          />
        </div>
        <div className="blog-field">
          <label className="blog-label" htmlFor="body-es">
            {t.blog.fieldBody} (Markdown)
          </label>
          <textarea
            id="body-es"
            className="blog-textarea blog-textarea-lg"
            rows={16}
            value={bodyEs}
            onChange={(e) => setBodyEs(e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="blog-fieldset">
        <legend className="blog-legend">EN</legend>
        <div className="blog-field">
          <label className="blog-label" htmlFor="title-en">
            {t.blog.fieldTitle}
          </label>
          <input
            id="title-en"
            className="blog-input"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
        </div>
        <div className="blog-field">
          <label className="blog-label" htmlFor="summary-en">
            {t.blog.fieldSummary}
          </label>
          <textarea
            id="summary-en"
            className="blog-textarea"
            rows={2}
            value={summaryEn}
            onChange={(e) => setSummaryEn(e.target.value)}
          />
        </div>
        <div className="blog-field">
          <label className="blog-label" htmlFor="body-en">
            {t.blog.fieldBody} (Markdown)
          </label>
          <textarea
            id="body-en"
            className="blog-textarea blog-textarea-lg"
            rows={16}
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
          />
        </div>
      </fieldset>

      {error ? (
        <p className="cp-prose text-[color:var(--section-tastes)]">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="blog-admin-btn"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? t.blog.saving : t.blog.save}
        </button>
        <button
          type="button"
          className="blog-admin-btn-ghost"
          onClick={() => router.push("/admin/blog")}
        >
          {t.blog.cancel}
        </button>
      </div>

      <p className="cp-prose text-[0.8rem]">{t.blog.editorHint}</p>
    </div>
  );
}
