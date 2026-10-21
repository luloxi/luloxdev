"use client";

import { useRef, useState } from "react";
import { moveItem, type MdSection } from "@/lib/article-sections";

type Props = {
  sections: MdSection[];
  onMove: (from: number, to: number) => void;
  es: boolean;
  /** Shown when the other language could not follow the reorder. */
  note?: string;
};

/**
 * Admin list of article sections with a drag handle. Pointer events cover
 * mouse, pen and touch; the handle also moves with ArrowUp/ArrowDown.
 */
export function SectionReorder({ sections, onMove, es, note }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null);
  const [live, setLive] = useState("");

  const indexAt = (y: number) => {
    const items = Array.from(listRef.current?.children ?? []) as HTMLElement[];
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) return i;
    }
    return items.length;
  };

  const finish = (from: number, slot: number) => {
    const to = slot > from ? slot - 1 : slot;
    if (to !== from) {
      onMove(from, to);
      setLive(es ? `Sección movida a la posición ${to + 1}` : `Section moved to position ${to + 1}`);
    }
  };

  if (sections.length < 2) return null;
  const preview = drag ? moveItem(sections.map((_, i) => i), drag.from, drag.over > drag.from ? drag.over - 1 : drag.over) : null;

  return (
    <div className="sec-reorder" data-inline-editor="skip">
      <p className="sec-reorder-h">{es ? "Orden de secciones" : "Section order"}</p>
      <ol ref={listRef} className="sec-reorder-list" aria-label={es ? "Secciones del artículo" : "Article sections"}>
        {sections.map((s, i) => (
          <li
            key={i}
            className={`sec-reorder-item${drag?.from === i ? " is-dragging" : ""}${drag && drag.over === i && drag.over !== drag.from && drag.over !== drag.from + 1 ? " drop-before" : ""}${drag && i === sections.length - 1 && drag.over === sections.length && drag.from !== i ? " drop-after" : ""}`}
          >
            <button
              type="button"
              className="sec-reorder-handle"
              aria-label={`${es ? "Mover sección" : "Move section"} ${i + 1}: ${s.title}. ${es ? "Flechas arriba/abajo para mover" : "Arrow up/down to move"}`}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                setDrag({ from: i, over: i });
              }}
              onPointerMove={(e) => {
                if (!drag) return;
                const over = indexAt(e.clientY);
                if (over !== drag.over) setDrag({ ...drag, over });
              }}
              onPointerUp={() => {
                if (drag) finish(drag.from, drag.over);
                setDrag(null);
              }}
              onPointerCancel={() => setDrag(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); finish(i, i - 1); }
                if (e.key === "ArrowDown" && i < sections.length - 1) { e.preventDefault(); finish(i, i + 2); }
              }}
            >
              ⋮⋮
            </button>
            <span className="sec-reorder-n">{(preview ? preview.indexOf(i) : i) + 1}</span>
            <span className="sec-reorder-title">{s.title || (es ? "(sin título)" : "(untitled)")}</span>
          </li>
        ))}
      </ol>
      {note ? <p className="sec-reorder-note">{note}</p> : null}
      <span className="sr-only" aria-live="polite">{live}</span>
    </div>
  );
}
