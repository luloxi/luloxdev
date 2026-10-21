/**
 * Split an article body (markdown) into reorderable sections.
 * A new section starts at a level 1-2 heading (`#`, `##`) or at a divider
 * (`---`, `***`, `___`); the divider travels with the section it opens.
 * Text before the first boundary is the intro section. Code fences are respected.
 */
export type MdSection = { title: string; md: string };

const isBoundary = (line: string) => /^#{1,2}\s+\S/.test(line) || /^\s*([-*_])(\s*\1){2,}\s*$/.test(line);

export function splitSections(md: string): MdSection[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const chunks: string[][] = [[]];
  let fence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && isBoundary(line) && chunks[chunks.length - 1].some((l) => l.trim())) {
      // A divider right before a heading stays in the same section.
      const cur = chunks[chunks.length - 1];
      const onlyDivider = cur.filter((l) => l.trim()).every((l) => !/^#/.test(l) && isBoundary(l));
      if (!(onlyDivider && /^#/.test(line))) chunks.push([]);
    }
    chunks[chunks.length - 1].push(line);
  }
  return chunks
    .map((c) => c.join("\n").trim())
    .filter(Boolean)
    .map((s) => {
      const h = s.split("\n").find((l) => /^#{1,2}\s/.test(l));
      const first = s.split("\n").find((l) => l.trim() && !isBoundary(l)) ?? "";
      return { md: s, title: (h ? h.replace(/^#+\s*/, "") : first).replace(/[*_`[\]]/g, "").slice(0, 80) };
    });
}

/** Re-join; a section moved off the top that has no heading/divider gets a `---` so it stays separate. */
export const joinSections = (s: MdSection[]) =>
  s.map((x, i) => (i > 0 && !isBoundary(x.md.split("\n")[0]) ? `---\n\n${x.md}` : x.md)).join("\n\n") + "\n";

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const a = arr.slice();
  const [x] = a.splice(from, 1);
  a.splice(Math.max(0, Math.min(a.length, to)), 0, x);
  return a;
}
