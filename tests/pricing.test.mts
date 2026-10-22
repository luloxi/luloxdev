import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate } from "../src/lib/pricing.ts";

test("project examples from the method doc", () => {
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "low", extra: true }).total, 300);
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "high", extra: true }).total, 600);
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "low", extra: false }).total, 200);
});

test("hourly on-site example", () => {
  const r = estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: true, onSite: true, travel: true });
  assert.equal(r.total, 212);
  assert.equal(r.deposit, 106);
  // on-site extras ignored in project mode
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "medium", extra: false, onSite: true, travel: true }).total, 72);
});
