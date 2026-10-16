"use client";
import type React from "react";
import type { RefObject } from "react";
import { continueList, insertHr, insertLink, prefixLines, wrapSelection, type Edit } from "@/lib/md-edit";

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

function commit(ta: HTMLTextAreaElement | null, onChange: (v: string) => void, r: Edit | null) {
  if (!ta || !r) return;
  onChange(r.text);
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(r.selStart, r.selEnd);
  });
}

/** Keyboard shortcuts for the Markdown textarea. */
export function mdKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, onChange: (v: string) => void, es: boolean) {
  const ta = e.currentTarget;
  const { value, selectionStart: s, selectionEnd: en } = ta;
  const mod = e.ctrlKey || e.metaKey;
  let r: Edit | null = null;
  if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "b") r = wrapSelection(value, s, en, "**", es ? "negrita" : "bold");
  else if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "i") r = wrapSelection(value, s, en, "*", es ? "cursiva" : "italic");
  else if (mod && e.altKey && ["2", "3", "4"].includes(e.code.replace("Digit", "").replace("Numpad", ""))) {
    const n = Number(e.code.replace("Digit", "").replace("Numpad", ""));
    r = prefixLines(value, s, en, () => `${"#".repeat(n)} `);
  } else if (e.key === "Enter" && !mod && !e.shiftKey && !e.altKey && !e.nativeEvent.isComposing) r = continueList(value, s, en);
  if (!r) return;
  e.preventDefault();
  commit(ta, onChange, r);
}

/** Sticky Markdown toolbar: wraps/prefixes the textarea selection. */
export function MdToolbar({ taRef, value, onChange, preview, onTogglePreview, es }: Props) {
  const run = (fn: (s: number, e: number) => Edit | null) => {
    const ta = taRef.current;
    if (!ta) return;
    commit(ta, onChange, fn(ta.selectionStart, ta.selectionEnd));
  };
  const link = () => {
    const url = window.prompt(es ? "URL del link" : "Link URL", "https://");
    if (!url || url === "https://") return;
    run((s, e) => insertLink(value, s, e, url, es ? "texto" : "text"));
  };
  const mk = "Ctrl";
  return (
    <div className="ie-toolbar" role="toolbar" aria-label="Markdown">
      <B label="H2" title={`${es ? "Título 2" : "Heading 2"} (${mk}+Alt+2)`} onClick={() => run((s, e) => prefixLines(value, s, e, () => "## "))} disabled={preview} />
      <B label="H3" title={`${es ? "Título 3" : "Heading 3"} (${mk}+Alt+3)`} onClick={() => run((s, e) => prefixLines(value, s, e, () => "### "))} disabled={preview} />
      <B label="H4" title={`${es ? "Título 4" : "Heading 4"} (${mk}+Alt+4)`} onClick={() => run((s, e) => prefixLines(value, s, e, () => "#### "))} disabled={preview} />
      <span className="ie-tb-sep" />
      <B label={<b>B</b>} title={`${es ? "Negrita" : "Bold"} (${mk}+B)`} onClick={() => run((s, e) => wrapSelection(value, s, e, "**", es ? "negrita" : "bold"))} disabled={preview} />
      <B label={<i>I</i>} title={`${es ? "Cursiva" : "Italic"} (${mk}+I)`} onClick={() => run((s, e) => wrapSelection(value, s, e, "*", es ? "cursiva" : "italic"))} disabled={preview} />
      <B label="🔗" title="Link" onClick={link} disabled={preview} />
      <span className="ie-tb-sep" />
      <B label="HR" title={es ? "Separador" : "Divider"} onClick={() => run((s) => insertHr(value, s))} disabled={preview} />
      <B label="•" title={es ? "Lista" : "Bulleted list"} onClick={() => run((s, e) => prefixLines(value, s, e, () => "- "))} disabled={preview} />
      <B label="1." title={es ? "Lista numerada" : "Numbered list"} onClick={() => run((s, e) => prefixLines(value, s, e, (i) => `${i + 1}. `))} disabled={preview} />
      <B label="❝" title={es ? "Cita" : "Quote"} onClick={() => run((s, e) => prefixLines(value, s, e, () => "> "))} disabled={preview} />
      <span className="ie-tb-sep" />
      <B label={es ? "Vista" : "Preview"} title={es ? "Vista previa" : "Preview"} onClick={onTogglePreview} pressed={preview} />
    </div>
  );
}
