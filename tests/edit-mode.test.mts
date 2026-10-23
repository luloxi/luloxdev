/** Blog drafts: admin with edit mode OFF sees exactly what a visitor sees. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { canSeeDrafts, editModeCookie, editModeFromCookie } from "../src/lib/edit-mode.ts";

test("edit mode cookie: default ON, only explicit off turns it off", () => {
  assert.equal(editModeFromCookie(null), true);
  assert.equal(editModeFromCookie(""), true);
  assert.equal(editModeFromCookie("lulox-edit-mode=on"), true);
  assert.equal(editModeFromCookie("a=1; lulox-edit-mode=off; b=2"), false);
  assert.equal(editModeFromCookie("x-lulox-edit-mode=off"), true);
});

test("drafts only for admin with edit ON (listing and slug use the same gate)", () => {
  assert.equal(canSeeDrafts(true, "lulox-edit-mode=on"), true);
  assert.equal(canSeeDrafts(true, ""), true);
  assert.equal(canSeeDrafts(true, "lulox-edit-mode=off"), false);
  assert.equal(canSeeDrafts(false, "lulox-edit-mode=on"), false);
  assert.equal(canSeeDrafts(false, "lulox-edit-mode=off"), false);
});

test("cookie written by the toggle round-trips", () => {
  for (const on of [true, false]) {
    const c = editModeCookie(on);
    assert.match(c, /Path=\//);
    assert.equal(editModeFromCookie(c.split(";")[0]), on);
  }
});
