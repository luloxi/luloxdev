/** Pure textarea edits for the Markdown copy editor (testable without a DOM). */
export type Edit = { text: string; selStart: number; selEnd: number };

export function wrapSelection(value: string, s: number, e: number, mark: string, placeholder: string): Edit {
  const sel = value.slice(s, e);
  // Toggle off if already wrapped.
  if (sel && value.slice(s - mark.length, s) === mark && value.slice(e, e + mark.length) === mark) {
    const text = value.slice(0, s - mark.length) + sel + value.slice(e + mark.length);
    return { text, selStart: s - mark.length, selEnd: e - mark.length };
  }
  const inner = sel || placeholder;
  const text = value.slice(0, s) + mark + inner + mark + value.slice(e);
  const start = s + mark.length;
  return { text, selStart: start, selEnd: start + inner.length };
}

const PREFIX_RE = /^(#{1,6}\s+|>\s+|[-*]\s+|\d+\.\s+)/;

export function prefixLines(value: string, s: number, e: number, make: (i: number) => string): Edit {
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const nl = value.indexOf("\n", e);
  const lineEnd = nl === -1 ? value.length : nl;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  // Same prefix already on every line -> remove it (toggle).
  const toggleOff = lines.every((l, i) => l.startsWith(make(i)));
  const out = lines.map((l, i) => (toggleOff ? l.slice(make(i).length) : make(i) + l.replace(PREFIX_RE, ""))).join("\n");
  const text = value.slice(0, lineStart) + out + value.slice(lineEnd);
  if (lines.length === 1 && s === e) {
    const pos = Math.max(lineStart, s + (out.length - block.length));
    return { text, selStart: pos, selEnd: pos };
  }
  return { text, selStart: lineStart, selEnd: lineStart + out.length };
}

export function insertLink(value: string, s: number, e: number, url: string, fallback: string): Edit {
  const label = value.slice(s, e) || fallback;
  const md = `[${label}](${url.trim()})`;
  return { text: value.slice(0, s) + md + value.slice(e), selStart: s + 1, selEnd: s + 1 + label.length };
}

export function insertHr(value: string, s: number): Edit {
  const before = value.slice(0, s);
  const after = value.slice(s).replace(/^\n+/, "");
  const pre = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const ins = `${pre}---\n\n`;
  const pos = before.length + ins.length;
  return { text: before + ins + after, selStart: pos, selEnd: pos };
}

/** Enter inside a list item: continue the list, or end it on an empty item. Null = default Enter. */
export function continueList(value: string, s: number, e: number): Edit | null {
  if (s !== e) return null;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const line = value.slice(lineStart, s);
  const m = /^(\s*)(?:(-)|(\d+)\.)\s(.*)$/.exec(line);
  if (!m) return null;
  const [, indent, dash, num, rest] = m;
  if (!rest.trim() && value.slice(s).split("\n")[0].trim() === "") {
    // Empty item: drop the marker and end the list.
    const text = value.slice(0, lineStart) + value.slice(s);
    return { text, selStart: lineStart, selEnd: lineStart };
  }
  const marker = dash ? `${indent}- ` : `${indent}${Number(num) + 1}. `;
  const ins = `\n${marker}`;
  return { text: value.slice(0, s) + ins + value.slice(s), selStart: s + ins.length, selEnd: s + ins.length };
}
