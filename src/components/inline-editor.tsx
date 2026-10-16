"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { flattenCopy } from "@/i18n/copy-overrides";
import { useLocale } from "@/i18n/locale-provider";

type Target = { key: string; value: string; top: number; left: number; id: number };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "NOSCRIPT", "SVG"]);

/**
 * Admin-only inline copy editor. Finds elements whose text equals a message
 * string and puts a pencil next to them. Edits go to /api/copy (admin-gated)
 * and then the server re-renders with the new D1 copy for everyone.
 */
export function InlineEditor() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [on, setOn] = useState(true);
  const [targets, setTargets] = useState<Target[]>([]);
  const [editing, setEditing] = useState<{ key: string; value: string } | null>(null);
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
            left: Math.min(r.right + window.scrollX + 4, document.documentElement.clientWidth - 40),
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
      if (!res.ok) throw new Error(String(res.status));
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
                setEditing({ key: tg.key, value: tg.value });
                setDraft(tg.value);
                setError("");
              }}
            >
              ✎
            </button>
          ))
        : null}

      <button type="button" className="ie-toggle" onClick={() => setOn((v) => !v)}>
        {on ? "✎ ON" : "✎ OFF"}
      </button>

      {editing ? (
        <div className="ie-sheet-backdrop" onClick={() => !saving && setEditing(null)}>
          <div className="ie-sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            <p className="ie-key">
              {editing.key} · {locale.toUpperCase()}
            </p>
            <textarea
              className="ie-text"
              value={draft}
              autoFocus
              rows={Math.min(12, Math.max(3, Math.ceil(draft.length / 40)))}
              onChange={(e) => setDraft(e.target.value)}
            />
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
