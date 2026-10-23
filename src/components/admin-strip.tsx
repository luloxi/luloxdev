"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { useSiteOrder } from "@/components/site-order-context";
import { useLocale } from "@/i18n/locale-provider";
import { matchesQuery, moveItem, type OrderItem, type OrderKind, type SectionKey } from "@/lib/site-sections";

type Labels = Record<string, { es: string; en: string }>;

type Drag = {
  from: number;
  pointerId: number;
  startX: number;
  startY: number;
  touch: boolean;
  active: boolean;
  timer: number;
};

const LONG_PRESS_MS = 280;

/**
 * Admin-only text strip (edit mode ON): one line of titles, Secciones or
 * Proyectos. Tap/click hides or shows; drag (mouse right away, touch after a
 * short press so the strip still scrolls) reorders; arrows on a focused
 * title, or the ← → buttons, move it too. Every change is saved to D1 at once.
 */
export function AdminStrip({ projectLabels }: { projectLabels: Labels }) {
  const { locale, t } = useLocale();
  const es = locale === "es";
  const router = useRouter();
  const { sections, projects, save } = useSiteOrder();
  const [kind, setKind] = useState<OrderKind>("sections");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [over, setOver] = useState<{ from: number; slot: number } | null>(null);
  const [live, setLive] = useState("");
  const [error, setError] = useState("");
  const [fade, setFade] = useState({ l: false, r: false });
  const trackRef = useRef<HTMLOListElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const focusKey = useRef<string | null>(null);

  const items: OrderItem[] = kind === "sections" ? sections : projects;
  const label = useCallback(
    (key: string) =>
      kind === "sections"
        ? t.sections[key as SectionKey] ?? key
        : (projectLabels[key]?.[locale] ?? projectLabels[key]?.es ?? key),
    [kind, t, projectLabels, locale],
  );
  const homeLabel = t.ui.backHome;
  const shown = useMemo(
    () => items.map((it, idx) => ({ ...it, idx })).filter((it) => matchesQuery(label(it.key), query)),
    [items, label, query],
  );
  const homeShown = kind === "sections" && matchesQuery(homeLabel, query);

  // Room at the bottom of the page so the strip never covers content.
  useEffect(() => {
    document.documentElement.classList.add("has-admin-strip");
    return () => document.documentElement.classList.remove("has-admin-strip");
  }, []);

  // Edge fades follow the scroll position; vertical wheel scrolls sideways.
  const updateFade = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setFade({ l: el.scrollLeft > 2, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateFade();
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "smooth" });
    };
    // Touch drag: keep the strip from scrolling while an item is being dragged.
    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current?.active) e.preventDefault();
    };
    const ro = new ResizeObserver(updateFade);
    ro.observe(el);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [updateFade, kind]);
  useEffect(updateFade, [updateFade, shown.length]);

  // Keep focus on a title after the keyboard moved it.
  useEffect(() => {
    if (!focusKey.current) return;
    const el = trackRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(focusKey.current)}"]`);
    focusKey.current = null;
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  });

  const commit = async (next: OrderItem[], message: string) => {
    setError("");
    setLive(message);
    const err = await save(kind, next);
    if (err) {
      const msg = err === "session"
        ? (es ? "Sesión vencida: volvé a ingresar." : "Session expired: sign in again.")
        : (es ? `No se pudo guardar (${err}).` : `Could not save (${err}).`);
      setError(msg);
      setLive(msg);
      return;
    }
    router.refresh();
  };

  const toggle = (idx: number) => {
    const it = items[idx];
    const next = items.map((x, i) => (i === idx ? { ...x, visible: !x.visible } : x));
    setSelected(it.key);
    void commit(next, `${label(it.key)}: ${it.visible ? (es ? "oculto" : "hidden") : (es ? "visible" : "visible")}`);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return;
    const it = items[from];
    focusKey.current = it.key;
    void commit(
      moveItem(items, from, to),
      es ? `${label(it.key)} movido a la posición ${to + 1} de ${items.length}` : `${label(it.key)} moved to position ${to + 1} of ${items.length}`,
    );
  };

  /** Slot (full-list index the item would go before) under a pointer x, among the titles on screen. */
  const slotAt = (x: number) => {
    const els = Array.from(trackRef.current?.querySelectorAll<HTMLElement>("[data-idx]") ?? []);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (x < r.left + r.width / 2) return Number(el.dataset.idx);
    }
    const last = els.at(-1);
    return last ? Number(last.dataset.idx) + 1 : items.length;
  };

  const startDrag = (d: Drag, target: HTMLElement) => {
    d.active = true;
    try {
      target.setPointerCapture(d.pointerId);
    } catch {
      /* pointer already gone */
    }
    setOver({ from: d.from, slot: d.from });
    document.documentElement.classList.add("as-dragging");
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (d) window.clearTimeout(d.timer);
    dragRef.current = null;
    setOver(null);
    document.documentElement.classList.remove("as-dragging");
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, idx: number) => {
    if (e.button !== 0) return;
    const target = e.currentTarget;
    const d: Drag = {
      from: idx,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      touch: e.pointerType === "touch",
      active: false,
      timer: 0,
    };
    if (d.touch) {
      d.timer = window.setTimeout(() => {
        if (dragRef.current === d) {
          startDrag(d, target);
          navigator.vibrate?.(10);
        }
      }, LONG_PRESS_MS);
    }
    dragRef.current = d;
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.active) {
      if (d.touch) {
        if (Math.hypot(dx, dy) > 8) endDrag(); // it's a scroll, not a press
        return;
      }
      if (Math.abs(dx) < 6) return;
      startDrag(d, e.currentTarget);
    }
    e.preventDefault();
    const slot = slotAt(e.clientX);
    setOver((o) => (o && o.slot === slot ? o : { from: d.from, slot }));
    // Auto-scroll near the edges so far slots stay reachable.
    const el = trackRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left + 36) el.scrollBy({ left: -14 });
      else if (e.clientX > r.right - 36) el.scrollBy({ left: 14 });
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (d.active) {
      suppressClick.current = true;
      const slot = slotAt(e.clientX);
      const to = slot > d.from ? slot - 1 : slot;
      endDrag();
      move(d.from, to);
      return;
    }
    endDrag();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(idx, idx - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      move(idx, idx + 1);
    }
  };

  const selIdx = selected ? items.findIndex((x) => x.key === selected) : -1;
  const selLabel = selIdx >= 0 ? label(items[selIdx].key) : "";
  const kinds: [OrderKind, string][] = [
    ["sections", es ? "Secciones" : "Sections"],
    ["projects", es ? "Proyectos" : "Projects"],
  ];

  return (
    <div className="admin-strip" role="region" aria-label={es ? "Secciones y proyectos del sitio" : "Site sections and projects"} data-inline-editor="skip">
      <div className="as-row">
        <div className="as-switch" role="tablist" aria-label={es ? "Qué ordenar" : "What to arrange"}>
          {kinds.map(([k, text]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              className="as-switch-btn"
              onClick={() => {
                setKind(k);
                setSelected(null);
              }}
            >
              {text}
            </button>
          ))}
        </div>
        <label className="as-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={es ? "Buscar" : "Search"}
            aria-label={es ? "Filtrar títulos" : "Filter titles"}
            enterKeyHint="search"
          />
        </label>
        <div className="as-move" role="group" aria-label={es ? "Mover el título elegido" : "Move the selected title"}>
          <button
            type="button"
            className="as-move-btn"
            disabled={selIdx <= 0}
            aria-label={selLabel ? (es ? `Mover ${selLabel} a la izquierda` : `Move ${selLabel} left`) : (es ? "Mover a la izquierda" : "Move left")}
            onClick={() => move(selIdx, selIdx - 1)}
          >
            ←
          </button>
          <button
            type="button"
            className="as-move-btn"
            disabled={selIdx < 0 || selIdx >= items.length - 1}
            aria-label={selLabel ? (es ? `Mover ${selLabel} a la derecha` : `Move ${selLabel} right`) : (es ? "Mover a la derecha" : "Move right")}
            onClick={() => move(selIdx, selIdx + 1)}
          >
            →
          </button>
        </div>
      </div>

      <div className={`as-scroll${fade.l ? " fade-l" : ""}${fade.r ? " fade-r" : ""}`}>
        <ol
          ref={trackRef}
          className="as-track"
          aria-label={kind === "sections" ? (es ? "Secciones" : "Sections") : (es ? "Proyectos" : "Projects")}
          onScroll={updateFade}
        >
          {homeShown ? (
            <li>
              <button
                type="button"
                className="as-item as-home"
                aria-disabled="true"
                title={es ? "La home no se puede ocultar" : "Home can't be hidden"}
                aria-label={es ? `${homeLabel}: siempre visible, no se puede ocultar ni mover` : `${homeLabel}: always visible, can't be hidden or moved`}
              >
                {homeLabel}
              </button>
            </li>
          ) : null}
          {shown.map(({ key, visible, idx }) => {
            const name = label(key);
            const dragging = over?.from === idx;
            const dropBefore = over && over.slot === idx && over.slot !== over.from && over.slot !== over.from + 1;
            const dropAfter = over && over.slot === idx + 1 && over.slot === items.length && over.from !== idx;
            return (
              <li key={key} data-idx={idx}>
                <button
                  type="button"
                  data-key={key}
                  className={`as-item${visible ? "" : " is-hidden"}${dragging ? " is-dragging" : ""}${dropBefore ? " drop-before" : ""}${dropAfter ? " drop-after" : ""}${selected === key ? " is-selected" : ""}`}
                  aria-label={`${name}: ${visible ? (es ? "visible" : "visible") : (es ? "oculto" : "hidden")}. ${visible ? (es ? "Enter para ocultar" : "Enter to hide") : (es ? "Enter para mostrar" : "Enter to show")}, ${es ? "flechas para mover" : "arrows to move"}. ${es ? `Posición ${idx + 1} de ${items.length}` : `Position ${idx + 1} of ${items.length}`}`}
                  onFocus={() => setSelected(key)}
                  onPointerDown={(e) => onPointerDown(e, idx)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={endDrag}
                  onContextMenu={(e) => e.preventDefault()}
                  onKeyDown={(e) => onKeyDown(e, idx)}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    toggle(idx);
                  }}
                >
                  {name}
                </button>
              </li>
            );
          })}
          {!homeShown && shown.length === 0 ? (
            <li className="as-empty">{es ? "Nada coincide" : "No matches"}</li>
          ) : null}
        </ol>
      </div>
      {error ? <p className="as-error" role="alert">{error}</p> : null}
      <span className="sr-only" aria-live="polite">{live}</span>
    </div>
  );
}
