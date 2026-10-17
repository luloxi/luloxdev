/** Proposed call time: year-month-day + 12-hour am/pm, in the form and the email. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { daysInMonth, formatWhen, partsToWhen } from "../src/lib/when-format.ts";

test("formatWhen: YYYY-MM-DD and 12-hour am/pm", () => {
  assert.equal(formatWhen("2026-10-20T15:30"), "2026-10-20 3:30 pm");
  assert.equal(formatWhen("2026-01-05T00:00"), "2026-01-05 12:00 am");
  assert.equal(formatWhen("2026-01-05T12:15"), "2026-01-05 12:15 pm");
  assert.equal(formatWhen("2026-01-05T09:45"), "2026-01-05 9:45 am");
  assert.equal(formatWhen("garbage"), null);
  assert.equal(formatWhen("2026-13-01T10:00"), null);
});

test("partsToWhen: 12-hour picker to 24-hour value", () => {
  assert.equal(partsToWhen({ y: "2026", mo: "10", d: "20", h: "3", mi: "30", ap: "pm" }), "2026-10-20T15:30");
  assert.equal(partsToWhen({ y: "2026", mo: "10", d: "20", h: "12", mi: "00", ap: "am" }), "2026-10-20T00:00");
  assert.equal(partsToWhen({ y: "2026", mo: "10", d: "20", h: "12", mi: "00", ap: "pm" }), "2026-10-20T12:00");
  assert.equal(partsToWhen({ y: "2026", mo: "10", d: "", h: "12", mi: "00", ap: "pm" }), "");
});

test("daysInMonth", () => {
  assert.equal(daysInMonth("2028", "02"), 29);
  assert.equal(daysInMonth("2026", "02"), 28);
  assert.equal(daysInMonth("2026", "04"), 30);
});
