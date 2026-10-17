"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { pickImageFile, uploadMedia } from "@/lib/upload-media";
import { parseVideoUrl } from "@/lib/video-embed";

/** Links: web, mail or site-relative only (no javascript:, data:, …). */
function isSafeHref(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return /^(https?:\/\/|mailto:)/i.test(url);
}
import { useLocale } from "@/i18n/locale-provider";
import { mdExtensions, type MdClasses } from "@/lib/md-editor-extensions";

type Props = {
  /** Markdown source (site copy already escaped with prepCopyMarkdown). */
  markdown: string;
  blog?: boolean;
  classes?: MdClasses;
  /** Wrapper classes: same as the published wrapper so it looks identical. */
  className?: string;
  /** "inline": Confirm/Cancel save in place. "field": form field (onChange). */
  mode?: "inline" | "field";
  onSave?: (md: string, bodyDirty: boolean) => Promise<string | null>;
  onChange?: (md: string) => void;
  /** Extra dirty state owned by the caller (e.g. a section title). */
  extraDirty?: boolean;
  forceActive?: boolean;
  onCancelExtra?: () => void;
  extraTools?: ReactNode;
  placeholder?: string;
};

/** Only one editable area owns the floating toolbar at a time. */
let activeId: string | null = null;
const subs = new Set<() => void>();
export function setActiveEditor(id: string | null) {
  activeId = id;
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
export function useActiveEditor() {
  return useSyncExternalStore(subscribe, () => activeId, () => null);
}

const getMd = (e: Editor) => (e.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();

function Btn({ label, title, onClick, active, disabled, className }: { label: ReactNode; title: string; onClick: () => void; active?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      className={`ie-tb${className ? ` ${className}` : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** Floating toolbar shown while an editable area is active. */
function Toolbar({ editor, es, dirty, saving, error, onConfirm, onCancel, extraTools, blog }: {
  editor: Editor; es: boolean; dirty: boolean; saving: boolean; error: string;
  onConfirm?: () => void; onCancel?: () => void; extraTools?: ReactNode; blog?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [, force] = useState(0);
  const [bottom, setBottom] = useState<number | null>(null);
  useEffect(() => {
    const re = () => force((n) => n + 1);
    editor.on("transaction", re);
    return () => {
      editor.off("transaction", re);
    };
  }, [editor]);
  // Mobile: stick to the bottom of the visible viewport (above the keyboard).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const upd = () => setBottom(window.innerWidth < 700 ? Math.max(0, window.innerHeight - (vv.offsetTop + vv.height)) : null);
    upd();
    vv.addEventListener("resize", upd);
    vv.addEventListener("scroll", upd);
    return () => {
      vv.removeEventListener("resize", upd);
      vv.removeEventListener("scroll", upd);
    };
  }, []);
  const c = () => editor.chain().focus();
  const link = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "https://";
    const raw = window.prompt(es ? "URL del link (vacío para quitarlo)" : "Link URL (empty to remove)", prev);
    if (raw === null) return;
    const url = raw.trim();
    if (!url || url === "https://") {
      c().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!isSafeHref(url)) {
      window.alert(es ? "Solo links https://, http://, mailto: o rutas del sitio (/…)" : "Only https://, http://, mailto: links or site paths (/…)");
      return;
    }
    // Nothing selected and not inside a link: insert the URL itself as the link text.
    if (editor.state.selection.empty && !editor.isActive("link")) {
      c().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
      return;
    }
    c().extendMarkRange("link").setLink({ href: url }).run();
  };
  const image = async () => {
    const raw = window.prompt(
      es ? "URL de la imagen (https://…), o dejalo vacío y Aceptar para subir un archivo" : "Image URL (https://…), or leave empty and OK to upload a file",
      "",
    );
    if (raw === null) return;
    let src = raw.trim();
    if (!src) {
      const file = await pickImageFile();
      if (!file) return;
      setUploading(true);
      const r = await uploadMedia(file);
      setUploading(false);
      if (r.error || !r.url) {
        window.alert(es ? `No se pudo subir la imagen (${r.error})` : `Couldn't upload the image (${r.error})`);
        return;
      }
      src = r.url;
    } else if (!/^(https?:\/\/|\/)/i.test(src)) {
      window.alert(es ? "La URL tiene que empezar con https:// o /" : "The URL must start with https:// or /");
      return;
    }
    const alt = window.prompt(es ? "Texto alternativo / epígrafe (opcional)" : "Alt text / caption (optional)", "") ?? "";
    // Block node + an empty paragraph after it, so the cursor lands below (and the
    // next insert does not replace the selected node).
    c().insertContent([{ type: "image", attrs: { src, alt: alt.trim() } }, { type: "paragraph" }]).run();
  };
  const video = () => {
    const raw = window.prompt(es ? "URL de YouTube o Vimeo" : "YouTube or Vimeo URL", "https://");
    if (raw === null || !raw.trim() || raw.trim() === "https://") return;
    const v = parseVideoUrl(raw.trim());
    if (!v) {
      window.alert(es ? "Solo videos de YouTube o Vimeo" : "Only YouTube or Vimeo videos");
      return;
    }
    c().insertContent([{ type: "videoEmbed", attrs: { src: raw.trim(), title: v.provider === "vimeo" ? "Vimeo" : "YouTube" } }, { type: "paragraph" }]).run();
  };
  return createPortal(
    <div className="ie-floatbar" role="toolbar" aria-label={es ? "Edición" : "Editing"} style={bottom !== null ? { bottom } : undefined} data-ie-toolbar="1">
      <Btn label="H2" title={es ? "Título 2 (Ctrl+Alt+2)" : "Heading 2 (Ctrl+Alt+2)"} active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
      <Btn label="H3" title={es ? "Título 3 (Ctrl+Alt+3)" : "Heading 3 (Ctrl+Alt+3)"} active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
      <Btn label="H4" title={es ? "Título 4 (Ctrl+Alt+4)" : "Heading 4 (Ctrl+Alt+4)"} active={editor.isActive("heading", { level: 4 })} onClick={() => c().toggleHeading({ level: 4 }).run()} />
      <span className="ie-tb-sep" />
      <Btn label={<b>B</b>} title={es ? "Negrita (Ctrl+B)" : "Bold (Ctrl+B)"} active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
      <Btn label={<i>I</i>} title={es ? "Cursiva (Ctrl+I)" : "Italic (Ctrl+I)"} active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
      <Btn label="🔗" title={es ? "Link: seleccioná texto y pegá la URL" : "Link: select text and paste the URL"} active={editor.isActive("link")} onClick={link} />
      {blog ? (
        <>
          <Btn label={uploading ? "…" : "🖼"} title={es ? "Imagen: subir archivo o pegar URL" : "Image: upload a file or paste a URL"} disabled={uploading} onClick={() => void image()} />
          <Btn label="▶" title={es ? "Video: pegar URL de YouTube o Vimeo" : "Video: paste a YouTube or Vimeo URL"} onClick={video} />
        </>
      ) : null}
      <span className="ie-tb-sep" />
      <Btn label="―" title={es ? "Separador horizontal" : "Horizontal rule"} onClick={() => c().setHorizontalRule().run()} />
      <Btn label="•" title={es ? "Lista con viñetas ( - )" : "Bulleted list ( - )"} active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
      <Btn label="1." title={es ? "Lista numerada ( 1. )" : "Numbered list ( 1. )"} active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
      <Btn label="❝" title={es ? "Cita" : "Quote"} active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
      <span className="ie-tb-sep" />
      <Btn label="↶" title={es ? "Deshacer (Ctrl+Z)" : "Undo (Ctrl+Z)"} disabled={!editor.can().undo()} onClick={() => c().undo().run()} />
      <Btn label="↷" title={es ? "Rehacer (Ctrl+Shift+Z)" : "Redo (Ctrl+Shift+Z)"} disabled={!editor.can().redo()} onClick={() => c().redo().run()} />
      {extraTools ? (
        <>
          <span className="ie-tb-sep" />
          {extraTools}
        </>
      ) : null}
      {onConfirm ? (
        <>
          <span className="ie-tb-sep" />
          <Btn label="✓" className="ie-tb-ok" title={es ? "Confirmar y guardar" : "Confirm and save"} disabled={!dirty || saving} onClick={onConfirm} />
          <Btn label="✕" className="ie-tb-cancel" title={es ? "Cancelar cambios" : "Cancel changes"} disabled={saving} onClick={() => onCancel?.()} />
        </>
      ) : null}
      {saving ? <span className="ie-tb-status">…</span> : null}
      {error ? <span className="ie-tb-error" role="alert">{error}</span> : null}
    </div>,
    document.body,
  );
}

export function MdWysiwyg({ markdown, blog, classes, className = "", mode = "inline", onSave, onChange, extraDirty = false, forceActive = false, onCancelExtra, extraTools }: Props) {
  const { locale } = useLocale();
  const es = locale === "es";
  const baseline = useRef<string>("");
  const [dirtyBody, setDirtyBody] = useState(false);
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const myId = useId();
  const current = useActiveEditor();
  const extensions = useMemo(() => mdExtensions({ blog, classes }), [blog, classes]);

  const editor = useEditor({
    extensions,
    content: markdown,
    immediatelyRender: false,
    editorProps: { attributes: { class: "md-pm", spellcheck: "true" } },
    onCreate: ({ editor: e }) => {
      baseline.current = getMd(e);
    },
    onUpdate: ({ editor: e }) => {
      const md = getMd(e);
      setDirtyBody(md !== baseline.current);
      onChange?.(md);
    },
    onFocus: () => {
      setFocused(true);
      setActiveEditor(myId);
    },
    onBlur: ({ event }) => {
      const to = (event as FocusEvent | undefined)?.relatedTarget as HTMLElement | null;
      if (to?.closest?.("[data-ie-toolbar]")) return;
      setFocused(false);
    },
  });

  // New source from the server (after a save/refresh): reload if untouched.
  useEffect(() => {
    if (!editor || dirtyBody) return;
    editor.commands.setContent(markdown, false);
    baseline.current = getMd(editor);
  }, [editor, markdown]); // eslint-disable-line react-hooks/exhaustive-deps -- only on new source

  const dirty = dirtyBody || extraDirty;

  const cancel = useCallback(() => {
    if (!editor) return;
    editor.commands.setContent(markdown, false);
    baseline.current = getMd(editor);
    setDirtyBody(false);
    setError("");
    onCancelExtra?.();
    editor.commands.blur();
    setFocused(false);
  }, [editor, markdown, onCancelExtra]);

  const confirm = useCallback(async () => {
    if (!editor || !onSave) return;
    setSaving(true);
    setError("");
    const md = getMd(editor);
    const err = await onSave(md, dirtyBody);
    setSaving(false);
    if (err) {
      setError(err === "session" ? (es ? "Sesión expirada" : "Session expired") : (es ? `No se pudo guardar (${err})` : `Couldn't save (${err})`));
      return;
    }
    baseline.current = md;
    setDirtyBody(false);
    editor.commands.blur();
    setFocused(false);
  }, [editor, onSave, dirtyBody, es]);

  useEffect(() => {
    if (forceActive) setActiveEditor(myId);
  }, [forceActive, myId]);
  const active = Boolean(editor) && current === myId && (focused || forceActive || (mode === "inline" && dirty));

  return (
    <div className={`md-edit ${className}`.trim()}>
      <EditorContent editor={editor} />
      {active && editor ? (
        <Toolbar
          editor={editor}
          es={es}
          dirty={dirty}
          saving={saving}
          error={error}
          onConfirm={mode === "inline" ? () => void confirm() : undefined}
          onCancel={cancel}
          extraTools={extraTools}
          blog={blog}
        />
      ) : null}
    </div>
  );
}

export { Btn as ToolbarButton };
