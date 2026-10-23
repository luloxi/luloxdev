import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, PRICING } from "../src/lib/pricing.ts";

test("project examples from the method doc", () => {
  // 20h (Chico) → 15% off the hours cost only (not the extra)
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "low", extra: true }).total, 170 + 100);
  assert.equal(estimate({ mode: "project", hours: 20, complexity: "high", extra: true }).total, 425 + 100);
  assert.equal(estimate({ mode: "project", hours: 10, complexity: "low", extra: false }).total, 100);
  assert.equal(estimate({ mode: "project", hours: 30, complexity: "low", extra: false }).total, 240); // Mediano 20%
});

test("project hours 8..40, presets Chico 20 / Mediano 30 / Grande 40", () => {
  assert.deepEqual(PRICING.sizes, { s: 20, m: 30, l: 40 });
  assert.equal(estimate({ mode: "project", hours: 2, complexity: "low", extra: false }).total, 80); // min 8h
  assert.equal(estimate({ mode: "project", hours: 80, complexity: "low", extra: false }).total, 300); // 40h, 25% off
});

test("volume discount tiers (project only, highest tier)", () => {
  const pct = (h: number) => estimate({ mode: "project", hours: h, complexity: "low", extra: false }).lines.find((l) => l.id === "discount")?.pct ?? 0;
  assert.deepEqual([8, 19, 20, 29, 30, 39, 40].map(pct), [0, 0, 15, 15, 20, 20, 25]);
  assert.ok(!estimate({ mode: "hourly", hours: 12, complexity: "low", extra: false }).lines.some((l) => l.id === "discount"));
});

test("on-site always adds travel (US$25)", () => {
  const r = estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: true, onSite: true });
  assert.equal(r.total, 72 + 25 + 25 + 100);
  assert.equal(r.deposit, 111);
  assert.equal(estimate({ mode: "hourly", hours: 4, complexity: "medium", extra: false, onSite: false }).total, 72);
  assert.equal(estimate({ mode: "project", hours: 8, complexity: "medium", extra: false, onSite: true }).total, 144 + 50); // 1 day default
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
  assert.deepEqual(project, { hours: 8, complexity: "low" });
  assert.equal(hourly.hours, 2);
  const p = estimate({ mode: "project", hours: project.hours, complexity: project.complexity, extra: false, onSite: false });
  assert.equal(p.total, 80); // 8h × US$10, no discount, no on-site, no extras
  assert.deepEqual(p.lines.map((l) => l.id), ["work"]);
  assert.equal(estimate({ mode: "hourly", hours: hourly.hours, complexity: project.complexity, extra: false, onSite: false }).total, 20);
});

test("urgency: flat US$100 (one day) in hourly mode, per day in project mode, capped, off by default", () => {
  assert.equal(estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true, extraDays: 3 }).total, 20 + 100);
  assert.equal(estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true }).total, 20 + 100);
  assert.equal(estimate({ mode: "project", hours: 8, complexity: "low", extra: true, extraDays: 2, onSite: true, onSiteDays: 2 }).total, 80 + 100 + 200);
  assert.equal(estimate({ mode: "project", hours: 8, complexity: "low", extra: true, extraDays: 99 }).total, 80 + 1000);
  assert.equal(estimate({ mode: "project", hours: 8, complexity: "low", extra: false, extraDays: 5 }).total, 80);
  const l = estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true, extraDays: 2 }).lines.find((x) => x.id === "extra");
  assert.deepEqual(l, { id: "extra", amount: 100, days: 1 });
});

test("hours input: digits only, clamped 1..6 per hour, 8..40 per project", async () => {
  const { clampHours, hoursDigits, maxHoursFor } = await import("../src/lib/pricing.ts");
  assert.equal(hoursDigits("2.5"), "2");
  assert.equal(hoursDigits("1e3"), "13");
  assert.equal(hoursDigits("3,9"), "3");
  assert.equal(hoursDigits("-4"), "4");
  assert.equal(hoursDigits("+ 7 h"), "7");
  assert.equal(hoursDigits("abc"), "");
  assert.equal(hoursDigits("007"), "7");
  assert.equal(clampHours("hourly", 9), 6);
  assert.equal(clampHours("hourly", 0), 1);
  assert.equal(clampHours("hourly", Number("")), 1);
  assert.equal(clampHours("hourly", 3.7), 3);
  assert.equal(clampHours("project", 999), maxHoursFor("project"));
  assert.equal(clampHours("project", 1), 8);
  assert.equal(clampHours("project", 0), 8);
  assert.equal(clampHours("project", Number("")), 8);
  assert.equal(clampHours("project", 12.9), 12);
  assert.equal(maxHoursFor("hourly"), 6);
});

test("private use: flat +US$ 500 in both modes, own line, not discounted, counts toward the deposit", () => {
  const off = estimate({ mode: "project", hours: 20, complexity: "low", extra: false });
  const on = estimate({ mode: "project", hours: 20, complexity: "low", extra: false, privateUse: true });
  assert.equal(PRICING.privateUse, 500);
  assert.equal(on.total, off.total + 500); // 170 + 500: the 15% volume discount stays on hours × rate only
  assert.equal(on.deposit, Math.round((off.total + 500) / 2));
  assert.deepEqual(on.lines.at(-1), { id: "private", amount: 500 });
  assert.ok(!off.lines.some((l) => l.id === "private"));
  const h = estimate({ mode: "hourly", hours: 2, complexity: "low", extra: true, onSite: true, privateUse: true });
  assert.equal(h.total, 20 + 25 + 25 + 100 + 500);
  assert.equal(h.deposit, 335);
  // Old callers without the field: no line, same totals as before.
  assert.equal(estimate({ mode: "hourly", hours: 2, complexity: "low", extra: false }).total, 20);
});
