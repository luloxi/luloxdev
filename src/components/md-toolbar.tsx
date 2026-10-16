"use client";
import type React from "react";

import type { RefObject } from "react";

type Props = {
  taRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
  preview: boolean;
  onTogglePreview: () => void;
  es: boolean;
};

function B({ label, title, onClick, pressed, disabled }: { label: React.ReactNode; title: string; onClick: () => void; pressed?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="ie-tb"
      title={title}
      aria-label={title}
      aria-pressed={pressed}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** Sticky Markdown toolbar: wraps/prefixes the textarea selection. */
export function MdToolbar({ taRef, value, onChange, preview, onTogglePreview, es }: Props) {
  function apply(fn: (sel: string, before: string, after: string) => { text: string; selStart: number; selEnd: number }) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const r = fn(value.slice(s, e), value.slice(0, s), value.slice(e));
    onChange(r.text);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(r.selStart, r.selEnd);
    });
  }

  const wrap = (mark: string, placeholder: string) =>
    apply((sel, before, after) => {
      const inner = sel || placeholder;
      const text = before + mark + inner + mark + after;
      const start = before.length + mark.length;
      return { text, selStart: start, selEnd: start + inner.length };
    });

  /** Prefix every selected line (or the current line). */
  const linePrefix = (make: (i: number) => string) =>
    apply((sel, before, after) => {
      const lineStart = before.lastIndexOf("\n") + 1;
      const head = before.slice(0, lineStart);
      const nl = after.indexOf("\n");
      const lineEnd = nl === -1 ? after.length : nl;
      const block = before.slice(lineStart) + sel + after.slice(0, lineEnd);
      const out = block
        .split("\n")
        .map((l, i) => make(i) + l.replace(/^(#{1,6}\s+|>\s+|[-*]\s+|\d+\.\s+)/, ""))
        .join("\n");
      const text = head + out + after.slice(lineEnd);
      return { text, selStart: head.length, selEnd: head.length + out.length };
    });

  const link = () => {
    const url = window.prompt(es ? "URL del link" : "Link URL", "https://");
    if (!url || url === "https://") return;
    apply((sel, before, after) => {
      const label = sel || (es ? "texto" : "text");
      const md = `[${label}](${url.trim()})`;
      return { text: before + md + after, selStart: before.length + 1, selEnd: before.length + 1 + label.length };
    });
  };

  const hr = () =>
    apply((_sel, before, after) => {
      const pre = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      const ins = `${pre}---\n\n`;
      const pos = before.length + ins.length;
      return { text: before + ins + after.replace(/^\n+/, ""), selStart: pos, selEnd: pos };
    });

  return (
    <div className="ie-toolbar" role="toolbar" aria-label="Markdown">
      <B label="H2" title={es ? "Título 2" : "Heading 2"} onClick={() => linePrefix(() => "## ")} disabled={preview} />
      <B label="H3" title={es ? "Título 3" : "Heading 3"} onClick={() => linePrefix(() => "### ")} disabled={preview} />
      <B label="H4" title={es ? "Título 4" : "Heading 4"} onClick={() => linePrefix(() => "#### ")} disabled={preview} />
      <span className="ie-tb-sep" />
      <B label={<b>B</b>} title={es ? "Negrita" : "Bold"} onClick={() => wrap("**", es ? "negrita" : "bold")} disabled={preview} />
      <B label={<i>I</i>} title={es ? "Cursiva" : "Italic"} onClick={() => wrap("*", es ? "cursiva" : "italic")} disabled={preview} />
      <B label="🔗" title="Link" onClick={link} disabled={preview} />
      <span className="ie-tb-sep" />
      <B label="HR" title={es ? "Separador" : "Divider"} onClick={hr} disabled={preview} />
      <B label="•" title={es ? "Lista" : "Bulleted list"} onClick={() => linePrefix(() => "- ")} disabled={preview} />
      <B label="1." title={es ? "Lista numerada" : "Numbered list"} onClick={() => linePrefix((i) => `${i + 1}. `)} disabled={preview} />
      <B label="❝" title={es ? "Cita" : "Quote"} onClick={() => linePrefix(() => "> ")} disabled={preview} />
      <span className="ie-tb-sep" />
      <B label={es ? "Vista" : "Preview"} title={es ? "Vista previa" : "Preview"} onClick={onTogglePreview} pressed={preview} />
    </div>
  );
}
