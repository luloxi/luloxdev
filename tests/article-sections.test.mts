import { test } from "node:test";
import assert from "node:assert/strict";
import { splitSections, joinSections, moveItem } from "../src/lib/article-sections.ts";

const md = "Intro text.\n\n## A\n\nalpha\n\n```\n## not a heading\n```\n\n---\n\n## B\n\nbeta\n\n---\n\nloose part\n";

test("splits by headings and dividers, ignoring fences", () => {
  const s = splitSections(md);
  assert.deepEqual(s.map((x) => x.title), ["Intro text.", "A", "B", "loose part"]);
  assert.match(s[2].md, /^---\n\n## B/);
});

test("reorder round-trips content", () => {
  const s = splitSections(md);
  const r = moveItem(s, 3, 0);
  const again = splitSections(joinSections(r));
  assert.deepEqual(again.map((x) => x.title), ["loose part", "Intro text.", "A", "B"]);
  assert.equal(splitSections(joinSections(s)).length, 4);
});
