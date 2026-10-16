"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { flattenCopy } from "@/i18n/copy-overrides";
import { useLocale } from "@/i18n/locale-provider";
import { CopyMarkdown } from "@/components/copy-markdown";
import { MdToolbar, mdKeyDown } from "@/components/md-toolbar";

type Target = { key: string; value: string; top: number; left: number; id: number; md?: boolean };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "NOSCRIPT", "SVG"]);

/**
 * Admin-only inline copy editor. Finds elements whose text equals a message
 * string and puts a pencil next to them. Edits go to /api/copy (admin-gated)
 * and then the server re-renders with the new D1 copy for everyone.
 */
const Pencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export function InlineEditor() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [on, setOn] = useState(true);
  const [targets, setTargets] = useState<Target[]>([]);
  const [editing, setEditing] = useState<{ key: string; value: string; md?: boolean } | null>(null);
  const [preview, setPreview] = useState(false);
  const [vh, setVh] = useState<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const byValue = useMemo(() => {
    const flat = flattenCopy(t);
    const m = new Map<string, string>();
    for (const [k, v] of Object.entries(flat)) {
      const n = norm(v);
      if (n.length >= 2 && !m.has(n)) m.set(n, k);
    }
    return m;
  }, [t]);
  const flat = useMemo(() => flattenCopy(t), [t]);

  const scan = useCallback(() => {
    const found: Target[] = [];
    let id = 0;
    const walk = (el: Element) => {
      if (SKIP.has(el.tagName.toUpperCase())) return;
      if (rootRef.current && rootRef.current.contains(el)) return;
      if ((el as HTMLElement).dataset?.inlineEditor) return;
      const explicit = (el as HTMLElement).dataset?.copyKey;
      if (explicit && explicit in flat) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          found.push({
            key: explicit,
            value: flat[explicit],
            md: (el as HTMLElement).dataset?.copyMd === "1",
            top: r.top + window.scrollY,
            left: Math.min(r.right + window.scrollX - 30, document.documentElement.clientWidth - 40),
            id: id++,
          });
        }
        return; // whole block is one editable; skip its children
      }
      const text = norm(el.textContent ?? "");
      const key = text.length <= 5000 ? byValue.get(text) : undefined;
      if (key) {
        // Deepest element with exactly this text.
        const child = [...el.children].find((c) => norm(c.textContent ?? "") === text);
        if (child) return walk(child);
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          found.push({
            key,
            value: flat[key],
            top: r.top + window.scrollY,
            left: Math.min(r.right + window.scrollX, document.documentElement.clientWidth - 40),
            id: id++,
          });
        }
        return;
      }
      for (const c of el.children) walk(c);
    };
    walk(document.body);
    setTargets(found);
  }, [byValue, flat]);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- portal needs the DOM
  }, []);

  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const queue = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    };
    queue();
    const timer = window.setTimeout(queue, 600);
    const mo = new MutationObserver(queue);
    mo.observe(document.body, { subtree: true, childList: true, characterData: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      mo.disconnect();
      window.removeEventListener("resize", queue);
    };
  }, [on, scan]);

  // Keep the sheet above the on-screen keyboard (mobile).
  useEffect(() => {
    if (!editing?.md || typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const upd = () => setVh(window.innerWidth < 700 ? vv.height : null);
    upd();
    vv.addEventListener("resize", upd);
    return () => vv.removeEventListener("resize", upd);
  }, [editing?.md]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editing.key, locale, value: draft }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; max?: number };
        const es = locale === "es";
        const msg =
          data.error === "too_long"
            ? es ? `Muy largo: ${draft.trim().length} de ${data.max} caracteres.` : `Too long: ${draft.trim().length} of ${data.max} characters.`
            : res.status === 401
              ? es ? "Tu sesión expiró. Volvé a ingresar." : "Session expired. Sign in again."
              : es ? `No se pudo guardar (${data.error ?? res.status}).` : `Couldn't save (${data.error ?? res.status}).`;
        setError(msg);
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setError(locale === "es" ? "No se pudo guardar." : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div ref={rootRef} data-inline-editor="1" className="ie-root">
      {on
        ? targets.map((tg) => (
            <button
              key={`${tg.key}-${tg.id}`}
              type="button"
              className="ie-pencil"
              style={{ top: tg.top, left: tg.left }}
              aria-label={`Edit ${tg.key}`}
              title={tg.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing({ key: tg.key, value: tg.value, md: tg.md });
                setPreview(false);
                setDraft(tg.value);
                setError("");
              }}
            >
              <Pencil />
            </button>
          ))
        : null}

      <button
        type="button"
        className="ie-toggle"
        aria-pressed={on}
        aria-label={locale === "es" ? "Mostrar lápices de edición" : "Show edit pencils"}
        title={locale === "es" ? "Modo edición" : "Edit mode"}
        onClick={() => setOn((v) => !v)}
      >
        <Pencil /> <span>{on ? "ON" : "OFF"}</span>
      </button>

      {editing ? (
        <div className="ie-sheet-backdrop" onClick={() => !saving && setEditing(null)}>
          <div
            className={`ie-sheet${editing.md ? " ie-sheet-md" : ""}`}
            role="dialog"
            aria-modal
            style={editing.md && vh ? { height: vh, maxHeight: vh } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="ie-key">
              {editing.key} · {locale.toUpperCase()}
              {editing.md ? " · Markdown" : ""}
            </p>
            {editing.md ? (
              <MdToolbar
                taRef={taRef}
                value={draft}
                onChange={setDraft}
                preview={preview}
                onTogglePreview={() => setPreview((v) => !v)}
                es={locale === "es"}
              />
            ) : null}
            {editing.md && preview ? (
              <div className="ie-preview">
                <CopyMarkdown text={draft} />
              </div>
            ) : (
              <textarea
                ref={taRef}
                className="ie-text"
                value={draft}
                autoFocus
                rows={editing.md ? 10 : Math.min(12, Math.max(3, Math.ceil(draft.length / 40)))}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={editing.md ? (e) => mdKeyDown(e, setDraft, locale === "es") : undefined}
              />
            )}
            {error ? <p className="ie-error">{error}</p> : null}
            <div className="ie-actions">
              <button type="button" className="ie-btn ie-cancel" disabled={saving} onClick={() => setEditing(null)}>
                {locale === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="button"
                className="ie-btn ie-save"
                disabled={saving || !draft.trim()}
                onClick={() => void save()}
              >
                {saving ? "…" : locale === "es" ? "Guardar" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
