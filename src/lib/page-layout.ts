/**
 * Generic page layout: an ordered list mixing story sections and records
 * (e.g. jobs), stored as one editable string: "story:0,job:2,story:1,...".
 * Story order always follows the Markdown body; the layout places records
 * between stories. Unknown/missing items are tolerated (white-label safe).
 */
export type LayoutItem = { kind: "story" | "job"; index: number };

export function parseLayout(raw: string | undefined, stories: number, jobs: number): LayoutItem[] {
  const seenS = new Set<number>();
  const seenJ = new Set<number>();
  const out: LayoutItem[] = [];
  for (const tok of (raw ?? "").split(",")) {
    const m = /^\s*(story|job):(\d+)\s*$/.exec(tok);
    if (!m) continue;
    const kind = m[1] as LayoutItem["kind"];
    const index = Number(m[2]);
    const max = kind === "story" ? stories : jobs;
    const seen = kind === "story" ? seenS : seenJ;
    if (index >= max || seen.has(index)) continue;
    seen.add(index);
    out.push({ kind, index });
  }
  // Stories missing from the layout keep body order; unplaced jobs go last.
  for (let i = 0; i < stories; i++) if (!seenS.has(i)) out.push({ kind: "story", index: i });
  for (let i = 0; i < jobs; i++) if (!seenJ.has(i)) out.push({ kind: "job", index: i });
  return out;
}

export function serializeLayout(items: LayoutItem[]): string {
  return items.map((x) => `${x.kind}:${x.index}`).join(",");
}

/** Jobs grouped by the story they follow (-1 = before the first story). */
export function jobsAfterStory(items: LayoutItem[]): Map<number, number[]> {
  const map = new Map<number, number[]>();
  let last = -1;
  for (const it of items) {
    if (it.kind === "story") last = it.index;
    else map.set(last, [...(map.get(last) ?? []), it.index]);
  }
  return map;
}

/** Position right after story `after` (-1 = top), past jobs already placed there. */
function slotIndex(items: LayoutItem[], after: number): number {
  let pos = after < 0 ? 0 : items.findIndex((x) => x.kind === "story" && x.index === after) + 1;
  while (pos < items.length && items[pos].kind === "job") pos++;
  return pos;
}

/** New story becomes section after+1: later story indexes shift by one. */
export function insertStory(items: LayoutItem[], after: number): LayoutItem[] {
  const pos = slotIndex(items, after);
  const shifted = items.map((x) => (x.kind === "story" && x.index > after ? { ...x, index: x.index + 1 } : x));
  shifted.splice(pos, 0, { kind: "story", index: after + 1 });
  return shifted;
}

export function insertJob(items: LayoutItem[], after: number, jobIndex: number): LayoutItem[] {
  const pos = slotIndex(items, after);
  const out = [...items];
  out.splice(pos, 0, { kind: "job", index: jobIndex });
  return out;
}
