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
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "medium", extra: false, onSite: true }).total, 72 + 50); // 1 day default
});

test("hourly capped at 6h", () => {
  assert.equal(estimate({ mode: "hourly", hours: 12, complexity: "low", extra: false }).total, 60);
});

test("project on-site: days × (25 + 25), not discounted", () => {
  const r = estimate({ mode: "project", hours: 20, complexity: "low", extra: false, onSite: true, onSiteDays: 3 });
  assert.equal(r.total, 170 + 75 + 75);
  assert.equal(r.lines.find((l) => l.id === "travel")?.days, 3);
  assert.equal(estimate({ mode: "project", hours: 10, complexity: "low", extra: false, onSite: true, onSiteDays: 99 }).total, 100 + 500);
});

test("calculator defaults: low, friendly first price, nothing extra selected", () => {
  const { mode, project, hourly } = PRICING.defaults;
  assert.equal(mode, "hourly");
  assert.deepEqual(project, { hours: 4, complexity: "low" });
  assert.equal(hourly.hours, 2);
  const p = estimate({ mode: "project", hours: project.hours, complexity: project.complexity, extra: false, onSite: false });
  assert.equal(p.total, 40); // 4h × US$10, no discount, no on-site, no extras
  assert.deepEqual(p.lines.map((l) => l.id), ["work"]);
  assert.equal(estimate({ mode: "hourly", hours: hourly.hours, complexity: project.complexity, extra: false, onSite: false }).total, 20);
});

test("urgency is US$100 per day in both modes, capped, off by default", () => {
  assert.equal(estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true, extraDays: 3 }).total, 20 + 300);
  assert.equal(estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true }).total, 20 + 100);
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "low", extra: true, extraDays: 2, onSite: true, onSiteDays: 2 }).total, 40 + 100 + 200);
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "low", extra: true, extraDays: 99 }).total, 40 + 1000);
  assert.equal(estimate({ mode: "project", hours: 4, complexity: "low", extra: false, extraDays: 5 }).total, 40);
  const l = estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true, extraDays: 2 }).lines.find((x) => x.id === "extra");
  assert.deepEqual(l, { id: "extra", amount: 200, days: 2 });
});
