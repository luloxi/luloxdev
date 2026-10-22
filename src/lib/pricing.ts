/**
 * Lulox's pricing method (public, no client data). Edit the numbers here.
 *  - Per project: (hours × hourly rate by complexity) + extra
 *  - Per hour / on-site: (hours × rate) + on-site surcharge + travel + extra
 */
export type Complexity = "low" | "medium" | "high";
export type Mode = "project" | "hourly";

export const PRICING = {
  currency: "USD",
  rates: { low: 10, medium: 18, high: 25 } as Record<Complexity, number>,
  onSiteSurcharge: 25,
  /** Always added with on-site work; may vary with distance. */
  travel: 25,
  /** Variable-conditions extra (urgency, third-party integrations, tight deadlines...). */
  extra: 100,
  /** Project size presets in hours (research, build, testing, polish, feedback, fixes, delivery). */
  sizes: { s: 10, m: 20, l: 40 },
  maxProjectHours: 40,
  deposit: 0.5,
  validityDays: 15,
};

export type Inputs = {
  mode: Mode;
  hours: number;
  complexity: Complexity;
  extra: boolean;
  onSite?: boolean;
};

export type Line = { id: "work" | "onSite" | "travel" | "extra"; amount: number };

export function estimate(i: Inputs, p = PRICING): { lines: Line[]; total: number; deposit: number } {
  const hours = Math.min(i.mode === "project" ? p.maxProjectHours : Infinity, Math.max(0, Math.round(i.hours * 2) / 2));
  const lines: Line[] = [{ id: "work", amount: hours * p.rates[i.complexity] }];
  if (i.mode === "hourly" && i.onSite) {
    lines.push({ id: "onSite", amount: p.onSiteSurcharge });
    lines.push({ id: "travel", amount: p.travel });
  }
  if (i.extra) lines.push({ id: "extra", amount: p.extra });
  const total = lines.reduce((a, l) => a + l.amount, 0);
  return { lines, total, deposit: Math.round(total * p.deposit) };
}
