"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/locale-provider";
import { useEditMode } from "@/components/admin-context";
import { CopyText } from "@/components/copy-text";
import {
  citationParts,
  movePublication,
  newPublicationId,
  publicationNote,
  publicationTitle,
  PUB_LIMITS,
  PUB_MAX_ITEMS,
  validatePublicationsPayload,
  type Publication,
} from "@/lib/publications";

const copy = {
  es: {
    open: "abre en otra pestaña",
    hidden: "oculta",
    edit: "Editar",
    done: "Listo",
    up: "Subir",
    down: "Bajar",
    hide: "Quitar",
    restore: "Restaurar",
    add: "Agregar publicación",
    save: "Guardar",
    saving: "Guardando…",
    discard: "Descartar",
    dirty: "Cambios sin guardar.",
    saved: "Guardado.",
    hint: "Solo vos ves esto. Quitar oculta la publicación (no se borra) y la podés restaurar.",
    empty: "Sin publicaciones visibles.",
    newTitle: "Título de la publicación",
    fields: {
      title: "Título (original)",
      title_en: "Título en inglés (solo si existe)",
      note_es: "Bajada (ES)",
      note_en: "Bajada (EN)",
      authors: "Autores",
      year: "Año",
      venue: "Medio",
      url: "Link (https)",
    },
    err: {
      required: "Falta el título.",
      invalid_url: "El link tiene que empezar con https://.",
      invalid_value: "Revisá este campo.",
      too_many: `Máximo ${PUB_MAX_ITEMS} publicaciones.`,
      session: "Tu sesión venció. Volvé a ingresar.",
      forbidden: "Solo el admin puede editar esto.",
      edit_mode_off: "Prendé el modo edición para guardar.",
      default: "No se pudo guardar. Probá de nuevo.",
    } as Record<string, string>,
  },
  en: {
    open: "opens in a new tab",
    hidden: "hidden",
    edit: "Edit",
    done: "Done",
    up: "Move up",
    down: "Move down",
    hide: "Remove",
    restore: "Restore",
    add: "Add publication",
    save: "Save",
    saving: "Saving…",
    discard: "Discard",
    dirty: "Unsaved changes.",
    saved: "Saved.",
    hint: "Only you see this. Remove hides the publication (nothing is deleted) and you can restore it.",
    empty: "No visible publications.",
    newTitle: "Publication title",
    fields: {
      title: "Title (original)",
      title_en: "English title (only if one exists)",
      note_es: "Note (ES)",
      note_en: "Note (EN)",
      authors: "Authors",
      year: "Year",
      venue: "Venue",
      url: "Link (https)",
    },
    err: {
      required: "The title is missing.",
      invalid_url: "The link must start with https://.",
      invalid_value: "Check this field.",
      too_many: `${PUB_MAX_ITEMS} publications at most.`,
      session: "Your session expired. Sign in again.",
      forbidden: "Only the admin can edit this.",
      edit_mode_off: "Turn edit mode on to save.",
      default: "Couldn't save. Try again.",
    } as Record<string, string>,
  },
};

type TextField = "title" | "title_en" | "note_es" | "note_en" | "authors" | "venue" | "url";
type Draft = Omit<Publication, "year"> & { year: string };
const toDraft = (p: Publication): Draft => ({ ...p, year: p.year === null ? "" : String(p.year) });
const fromDraft = (d: Draft): Publication => ({ ...d, year: d.year.trim() === "" ? null : Number(d.year) });
const same = (a: Draft[], b: Draft[]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * "Publicaciones" / "Publications" block on Sobre mí: citation style list
 * (title, note, authors · year · venue). Admin with edit mode on gets an
 * in-place editor: add, edit, reorder (↑ ↓), remove (hide) and restore.
 */
export function Publications({ items }: { items: readonly Publication[] }) {
  const edit = useEditMode();
  const { locale, t } = useLocale();
  const visible = items.filter((p) => !p.hidden);
  if (!edit && visible.length === 0) return null;
  return (
    <section className="pubs" aria-label={t.ui.publications} data-testid="publications">
      <div className="pubs-head">
        <CopyText as="span" className="pubs-tag" copyKey="ui.publications" value={t.ui.publications} />
      </div>
      {edit ? <PublicationsEditor items={items} /> : <PubList items={visible} locale={locale} />}
    </section>
  );
}

function PubList({ items, locale, actions, below }: { items: readonly Publication[]; locale: "es" | "en"; actions?: (p: Publication, i: number) => ReactNode; below?: (p: Publication, i: number) => ReactNode }) {
  const c = copy[locale];
  return (
    <ol className="pubs-list">
      {items.map((p, i) => {
        const title = publicationTitle(p, locale);
        const note = publicationNote(p, locale);
        const cite = citationParts(p);
        return (
          <li key={p.id} className={`pub${p.hidden ? " is-hidden" : ""}`} data-pub-id={p.id}>
            <span className="pub-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <div className="pub-body">
              <a className="pub-title" href={p.url} target="_blank" rel="noopener noreferrer">
                <cite>{title}</cite>
                <span className="pub-arrow" aria-hidden>↗</span>
                <span className="sr-only"> ({c.open})</span>
              </a>
              {note ? <p className="pub-note">{note}</p> : null}
              {cite.length ? (
                <p className="pub-cite">
                  {cite.map((part, k) => (
                    <span key={k} className={k === cite.length - 1 && p.venue ? "pub-venue" : undefined}>{part}</span>
                  ))}
                </p>
              ) : null}
              {p.hidden ? <span className="pub-hidden-tag">{c.hidden}</span> : null}
            </div>
            {actions ? <div className="pub-actions">{actions(p, i)}</div> : null}
            {below?.(p, i)}
          </li>
        );
      })}
    </ol>
  );
}

function PublicationsEditor({ items }: { items: readonly Publication[] }) {
  const { locale } = useLocale();
  const c = copy[locale];
  const router = useRouter();
  const saved = useMemo(() => items.map(toDraft), [items]);
  const [draft, setDraft] = useState<Draft[]>(saved);
  const [open, setOpen] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState<{ id: string; field?: string } | null>(null);
  const status = useRef<HTMLParagraphElement>(null);
  // New server data (after a save + refresh): start from it again.
  useEffect(() => setDraft(saved), [saved]); // eslint-disable-line react-hooks/set-state-in-effect -- reset to fresh server data
  const dirty = !same(draft, saved);
  const update = (id: string, patch: Partial<Draft>) => {
    setDraft((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (bad?.id === id && bad.field && bad.field in patch) setBad(null);
    if (state !== "saving") setState("idle");
  };
  const showStatus = () => requestAnimationFrame(() => status.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));

  const fail = (error: string, id?: string, field?: string) => {
    setState("error");
    setMsg(c.err[error] ?? c.err.default);
    setBad(id ? { id, field } : null);
    if (id) setOpen(id);
    showStatus();
  };

  const save = async () => {
    const list = draft.map(fromDraft);
    if (draft.some((d) => d.year.trim() !== "" && !/^\d{4}$/.test(d.year.trim()))) {
      const d = draft.find((x) => x.year.trim() !== "" && !/^\d{4}$/.test(x.year.trim()))!;
      return fail("invalid_value", d.id, "year");
    }
    const v = validatePublicationsPayload({ items: list });
    if (!v.ok) return fail(v.error, v.index === undefined ? undefined : draft[v.index]?.id, v.field);
    setState("saving");
    setMsg("");
    setBad(null);
    try {
      const res = await fetch("/api/publications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: v.items }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; index?: number; field?: string };
      if (!res.ok || !j.ok) return fail(res.status === 401 ? "session" : (j.error ?? "default"), j.index === undefined ? undefined : draft[j.index]?.id, j.field);
      setState("ok");
      setMsg(c.saved);
      setOpen(null);
      showStatus();
      router.refresh();
    } catch {
      fail("default");
    }
  };

  const add = () => {
    if (draft.length >= PUB_MAX_ITEMS) return fail("too_many");
    const id = newPublicationId(draft.map((d) => d.id));
    setDraft((d) => [...d, { id, title: c.newTitle, title_en: "", note_es: "", note_en: "", authors: "", year: "", venue: "", url: "https://", hidden: false }]);
    setOpen(id);
    setState("idle");
  };

  const shown = draft.map(fromDraft);
  return (
    <div className="pubs-editor" data-testid="publications-editor">
      <p className="pubs-hint">{c.hint}</p>
      {draft.length === 0 ? <p className="pubs-hint">{c.empty}</p> : null}
      <PubList
        items={shown}
        locale={locale}
        actions={(p, i) => (
          <>
            <button type="button" className="pub-btn" aria-label={`${c.up}: ${p.title}`} title={c.up} disabled={i === 0} onClick={() => setDraft((d) => movePublication(d, i, -1))} data-testid="pub-up">↑</button>
            <button type="button" className="pub-btn" aria-label={`${c.down}: ${p.title}`} title={c.down} disabled={i === draft.length - 1} onClick={() => setDraft((d) => movePublication(d, i, 1))} data-testid="pub-down">↓</button>
            <button type="button" className="pub-btn" aria-expanded={open === p.id} aria-controls={`pub-form-${p.id}`} onClick={() => setOpen(open === p.id ? null : p.id)} data-testid="pub-edit">
              {open === p.id ? c.done : c.edit}
            </button>
            <button type="button" className="pub-btn" onClick={() => update(p.id, { hidden: !p.hidden })} data-testid={p.hidden ? "pub-restore" : "pub-hide"}>
              {p.hidden ? c.restore : c.hide}
            </button>
          </>
        )}
        below={(p, i) => (open === p.id ? <PubForm d={draft[i]} bad={bad?.id === p.id ? bad.field : undefined} labels={c.fields} onChange={(patch) => update(p.id, patch)} /> : null)}
      />
      <div className="pubs-actions">
        <button type="button" className="pub-btn pub-add" onClick={add} data-testid="pub-add">+ {c.add}</button>
        <p ref={status} className="pubs-status" role="status" data-state={state}>{state === "ok" || state === "error" ? msg : dirty ? c.dirty : ""}</p>
        <button type="button" className="pub-btn" disabled={!dirty || state === "saving"} onClick={() => { setDraft(saved); setOpen(null); setState("idle"); setBad(null); }} data-testid="pub-discard">{c.discard}</button>
        <button type="button" className="pub-btn is-primary" disabled={!dirty || state === "saving"} onClick={() => void save()} data-testid="pub-save">
          {state === "saving" ? c.saving : c.save}
        </button>
      </div>
    </div>
  );
}

const FORM_FIELDS: { k: TextField | "year"; max: number; wide?: boolean; mode?: "numeric" | "url" }[] = [
  { k: "title", max: PUB_LIMITS.title, wide: true },
  { k: "title_en", max: PUB_LIMITS.title_en, wide: true },
  { k: "note_es", max: PUB_LIMITS.note_es },
  { k: "note_en", max: PUB_LIMITS.note_en },
  { k: "authors", max: PUB_LIMITS.authors, wide: true },
  { k: "year", max: 4, mode: "numeric" },
  { k: "venue", max: PUB_LIMITS.venue },
  { k: "url", max: PUB_LIMITS.url, wide: true, mode: "url" },
];

function PubForm({ d, bad, labels, onChange }: { d: Draft; bad?: string; labels: Record<string, string>; onChange: (patch: Partial<Draft>) => void }) {
  return (
    <div className="pub-form" id={`pub-form-${d.id}`} data-testid="pub-form">
      {FORM_FIELDS.map(({ k, max, wide, mode }) => (
        <label key={k} className={`pub-field${wide ? " is-wide" : ""}`} data-bad={bad === k || undefined}>
          <span>{labels[k]}</span>
          <input
            type={mode === "url" ? "url" : "text"}
            inputMode={mode === "numeric" ? "numeric" : mode === "url" ? "url" : undefined}
            autoComplete="off"
            maxLength={max}
            data-field={k}
            value={d[k]}
            onChange={(e) => onChange({ [k]: k === "year" ? e.target.value.replace(/\D+/g, "").slice(0, 4) : e.target.value } as Partial<Draft>)}
          />
        </label>
      ))}
    </div>
  );
}
