import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, PRICING } from "../src/lib/pricing.ts";

test("project examples from the method doc", () => {
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "low", extra: true }).total, 300);
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "high", extra: true }).total, 600);
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "low", extra: false }).total, 200);
});

test("project hours capped at 40, three presets", () => {
  assert.deepEqual(Object.values(PRICING.sizes), [10, 20, 40]);
  assert.equal(estimate({ mode: "project", hours: 80, complexity: "low", extra: false }).total, 400);
});

test("on-site always adds travel (US$25)", () => {
  const r = estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: true, onSite: true });
  assert.equal(r.total, 72 + 25 + 25 + 100);
  assert.equal(r.deposit, 111);
  assert.equal(estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: false, onSite: false }).total, 72);
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "medium", extra: false, onSite: true }).total, 72);
});
