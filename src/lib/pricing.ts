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
  /** Project mode volume discount on hours × rate: [minHoursExclusive, pct], highest tier wins. */
  volumeTiers: [[30, 0.25], [20, 0.2], [10, 0.15]] as [number, number][],
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

export type Line = { id: "work" | "discount" | "onSite" | "travel" | "extra"; amount: number; pct?: number };

export function estimate(i: Inputs, p = PRICING): { lines: Line[]; total: number; deposit: number } {
  const hours = Math.min(i.mode === "project" ? p.maxProjectHours : Infinity, Math.max(0, Math.round(i.hours * 2) / 2));
  const work = hours * p.rates[i.complexity];
  const lines: Line[] = [{ id: "work", amount: work }];
  const tier = i.mode === "project" ? p.volumeTiers.find(([h]) => hours > h) : undefined;
  if (tier) lines.push({ id: "discount", amount: -Math.round(work * tier[1]), pct: Math.round(tier[1] * 100) });
  if (i.mode === "hourly" && i.onSite) {
    lines.push({ id: "onSite", amount: p.onSiteSurcharge });
    lines.push({ id: "travel", amount: p.travel });
  }
  if (i.extra) lines.push({ id: "extra", amount: p.extra });
  const total = lines.reduce((a, l) => a + l.amount, 0);
  return { lines, total, deposit: Math.round(total * p.deposit) };
}
