"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { MdWysiwyg, ToolbarButton } from "@/components/md-wysiwyg";
import type { BlogPost } from "@/content/blog/types";
import { focusTopics } from "@/content/projects";
import { useLocale } from "@/i18n/locale-provider";

export async function putPost(post: BlogPost): Promise<{ slug?: string; error?: string }> {
  const res = await fetch("/api/blog", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  if (res.ok) return (await res.json()) as { slug: string };
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return { error: res.status === 401 ? "session" : (data.error ?? String(res.status)) };
}

type Meta = { slug: string; publishedAt: string; coverImage: string; tags: string; topics: string[] };
const metaOf = (p: BlogPost): Meta => ({
  slug: p.slug,
  publishedAt: p.publishedAt.slice(0, 10),
  coverImage: p.coverImage ?? "",
  tags: (p.tags ?? []).join(", "),
  topics: p.topics ?? [],
});
const sameMeta = (a: Meta, b: Meta) =>
  a.slug === b.slug && a.publishedAt === b.publishedAt && a.coverImage === b.coverImage && a.tags === b.tags && a.topics.join() === b.topics.join();

/** Plain-text field edited in place (title, summary): looks like the rendered text. */
function InlineText({ as: Tag, className, value, label, onChange, onFocus, onBlur, resetKey }: {
  as: "h1" | "p"; className: string; value: string; label: string; resetKey: number;
  onChange: (v: string) => void; onFocus: () => void; onBlur: () => void;
}) {
  return (
    <Tag
      key={resetKey}
      className={`${className} ie-inline-text`}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      spellCheck
      onFocus={onFocus}
      onBlur={(e) => {
        if ((e.relatedTarget as HTMLElement | null)?.closest?.("[data-ie-toolbar]")) return;
        onBlur();
      }}
      onInput={(e) => onChange((e.currentTarget.textContent ?? "").replace(/\s+/g, " ").trim())}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}

/**
 * Admin edit mode for one post at /blog/<slug>: title, summary and body edited
 * in place for the current locale; publish/unpublish, details and delete in
 * the toolbar. The article renders like the published one.
 */
export function useBlogPostEditor(post: BlogPost) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const L = (locale === "en" ? "en" : "es") as "es" | "en";
  const [title, setTitle] = useState(post.title[L]);
  const [summary, setSummary] = useState(post.summary[L]);
  const [meta, setMeta] = useState<Meta>(metaOf(post));
  const [textFocus, setTextFocus] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const bodyRef = useRef(post.body[L]);
  const extraDirty = title !== post.title[L] || summary !== post.summary[L] || !sameMeta(meta, metaOf(post));

  const build = (bodyMd: string, published = post.published): BlogPost => ({
    ...post,
    slug: meta.slug.trim() || post.slug,
    publishedAt: meta.publishedAt,
    coverImage: meta.coverImage.trim(),
    tags: meta.tags.split(",").map((x) => x.trim()).filter(Boolean),
    topics: meta.topics,
    published,
    title: { ...post.title, [L]: title || post.title[L] },
    summary: { ...post.summary, [L]: summary },
    body: { ...post.body, [L]: bodyMd },
  });

  const commit = async (next: BlogPost): Promise<string | null> => {
    const r = await putPost(next);
    if (r.error) return r.error;
    if (r.slug && r.slug !== post.slug) {
      // Renamed: the new row exists, now drop the old one.
      await fetch(`/api/blog?slug=${encodeURIComponent(post.slug)}`, { method: "DELETE" });
      router.replace(`/blog/${r.slug}`);
    }
    router.refresh();
    return null;
  };

  const togglePublish = async () => {
    const err = await commit(build(bodyRef.current, !post.published));
    if (err) window.alert(es ? `No se pudo guardar (${err})` : `Couldn't save (${err})`);
  };
  const del = async () => {
    if (!window.confirm(es ? `¿Borrar "${post.title[L]}"? No se puede deshacer.` : `Delete "${post.title[L]}"? This can't be undone.`)) return;
    const res = await fetch(`/api/blog?slug=${encodeURIComponent(post.slug)}`, { method: "DELETE" });
    if (!res.ok) window.alert(es ? `No se pudo borrar (${res.status})` : `Couldn't delete (${res.status})`);
    else {
      router.push("/blog");
      router.refresh();
    }
  };
  const cancelExtra = () => {
    setTitle(post.title[L]);
    setSummary(post.summary[L]);
    setMeta(metaOf(post));
    setShowMeta(false);
    setResetKey((k) => k + 1);
  };

  const titleNode = (
    <InlineText as="h1" className="blog-post-title" value={post.title[L]} label={t.blog.fieldTitle} resetKey={resetKey}
      onChange={setTitle} onFocus={() => setTextFocus(true)} onBlur={() => setTextFocus(false)} />
  );
  const summaryNode = (
    <InlineText as="p" className="cp-prose" value={post.summary[L]} label={t.blog.fieldSummary} resetKey={resetKey}
      onChange={setSummary} onFocus={() => setTextFocus(true)} onBlur={() => setTextFocus(false)} />
  );

  const metaPanel: ReactNode = showMeta ? (
    <div className="ie-meta" data-ie-toolbar="1">
      <label>Slug<input value={meta.slug} onChange={(e) => setMeta({ ...meta, slug: e.target.value })} /></label>
      <label>{t.blog.fieldDate}<input type="date" value={meta.publishedAt} onChange={(e) => setMeta({ ...meta, publishedAt: e.target.value })} /></label>
      <label>{t.blog.fieldCover}<input value={meta.coverImage} onChange={(e) => setMeta({ ...meta, coverImage: e.target.value })} placeholder="/projects/focus/lcp.svg" /></label>
      <label>{t.blog.fieldTags}<input value={meta.tags} onChange={(e) => setMeta({ ...meta, tags: e.target.value })} /></label>
      <fieldset>
        <legend>{t.blog.fieldTopics}</legend>
        {focusTopics.map((ft) => (
          <label key={ft.id} className="ie-meta-chip">
            <input
              type="checkbox"
              checked={meta.topics.includes(ft.id)}
              onChange={() => setMeta({ ...meta, topics: meta.topics.includes(ft.id) ? meta.topics.filter((x) => x !== ft.id) : [...meta.topics, ft.id] })}
            />
            {ft.id}
          </label>
        ))}
      </fieldset>
    </div>
  ) : null;

  const bodyNode = (
    <MdWysiwyg
      markdown={post.body[L]}
      blog
      className="blog-md"
      forceActive
      extraDirty={extraDirty}
      onCancelExtra={cancelExtra}
      onChange={(md) => {
        bodyRef.current = md;
      }}
      onSave={(md, bodyDirty) => commit(build(bodyDirty ? md : post.body[L]))}
      extraTools={
        <>
          <ToolbarButton
            label={post.published ? (es ? "Despublicar" : "Unpublish") : es ? "Publicar" : "Publish"}
            className="ie-tb-wide"
            title={post.published ? (es ? "Pasar a borrador" : "Back to draft") : es ? "Publicar el artículo" : "Publish the article"}
            onClick={() => void togglePublish()}
          />
          <ToolbarButton label="⚙" title={es ? "Detalles: slug, fecha, imagen, tags, temas" : "Details: slug, date, image, tags, topics"} active={showMeta} onClick={() => setShowMeta((v) => !v)} />
          <ToolbarButton label="🗑" title={es ? "Borrar artículo" : "Delete article"} onClick={() => void del()} />
        </>
      }
    />
  );

  return { titleNode, summaryNode, bodyNode, metaPanel, textFocus };
}
