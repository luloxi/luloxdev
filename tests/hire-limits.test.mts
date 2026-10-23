import { test } from "node:test";
import assert from "node:assert/strict";
import { charCount, clampMessage, MAX_MESSAGE } from "../src/lib/hire-limits.ts";

test("counts by code point: an emoji is 1 character", () => {
  assert.equal(charCount("😀"), 1);
  assert.equal("😀".length, 2); // what native maxLength would count
  assert.equal(charCount("a😀b"), 3);
});

test("clampMessage: under the limit passes through", () => {
  assert.deepEqual(clampMessage("", "hola"), { value: "hola", event: null });
});

test("clampMessage: reaching exactly the limit fires 'limit' once", () => {
  const full = "a".repeat(MAX_MESSAGE);
  assert.deepEqual(clampMessage(full.slice(1), full), { value: full, event: "limit" });
  assert.equal(clampMessage(full, full).event, null); // already there: no new event
});

test("clampMessage: pasting over the limit trims by code point and fires 'trimmed'", () => {
  const r = clampMessage("", "😀".repeat(300));
  assert.equal(r.event, "trimmed");
  assert.equal(charCount(r.value), MAX_MESSAGE);
  assert.equal(r.value, "😀".repeat(MAX_MESSAGE)); // never splits a surrogate pair
  // typing one more char at the limit is also "trimmed" and keeps the text unchanged
  const full = "a".repeat(MAX_MESSAGE);
  assert.deepEqual(clampMessage(full, full + "b"), { value: full, event: "trimmed" });
});
