import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, PRICING } from "../src/lib/pricing.ts";

test("project examples from the method doc", () => {
  // 20h > 10h → 15% off the hours cost only (not the extra)
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "low", extra: true }).total, 170 + 100);
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "high", extra: true }).total, 425 + 100);
  assert.equal(estimate({ mode: "project", hours: 10, complexity: "low", extra: false }).total, 100);
});

test("project hours capped at 40, three presets", () => {
  assert.deepEqual(Object.values(PRICING.sizes), [10, 20, 40]);
  assert.equal(estimate({ mode: "project", hours: 80, complexity: "low", extra: false }).total, 300); // 40h, 25% off
});

test("volume discount tiers (project only, highest tier)", () => {
  const pct = (h: number) => estimate({ mode: "project", hours: h, complexity: "low", extra: false }).lines.find((l) => l.id === "discount")?.pct ?? 0;
  assert.deepEqual([10, 11, 20, 21, 30, 31, 40].map(pct), [0, 15, 15, 20, 20, 25, 25]);
  assert.ok(!estimate({ mode: "hourly", hours: 12, complexity: "low", extra: false }).lines.some((l) => l.id === "discount"));
});

test("on-site always adds travel (US$25)", () => {
  const r = estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: true, onSite: true });
  assert.equal(r.total, 72 + 25 + 25 + 100);
  assert.equal(r.deposit, 111);
  assert.equal(estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: false, onSite: false }).total, 72);
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "medium", extra: false, onSite: true }).total, 72);
});
