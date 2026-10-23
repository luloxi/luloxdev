/**
 * Lulox's pricing method (public, no client data). Edit the numbers here.
 *  - Per project: (hours × hourly complexity) + on-site/day + travel/day + urgency/day
 *  - Per hour: (hours × rate) + on-site + travel + urgency/day
 */
export type Complexity = "low" | "medium" | "high";
export type Mode = "project" | "hourly";

export const PRICING = {
  currency: "USD",
  rates: { low: 10, medium: 18, high: 25 } as Record<Complexity, number>,
  onSiteSurcharge: 25,
  /** Always added with on-site work; may vary with distance. */
  travel: 25,
  /** Urgency surcharge, charged per required day (both modes). */
  extra: 100,
  maxUrgencyDays: 10,
  /** Project size presets in hours (research, build, testing, polish, feedback, fixes, delivery). */
  sizes: { s: 10, m: 20, l: 40 },
  /** Calculator starting values: a low, friendly first price. No on-site, no extras. */
  defaults: {
    /** Mode the calculator opens in (shown first, on the left). */
    mode: "hourly" as Mode,
    project: { hours: 4, complexity: "low" as Complexity },
    hourly: { hours: 2 },
  },
  maxProjectHours: 40,
  maxHourlyHours: 6,
  maxOnSiteDays: 10,
  /** Project mode volume discount on hours × rate: [minHoursExclusive, pct], highest tier wins. */
  volumeTiers: [[30, 0.25], [20, 0.2], [10, 0.15]] as [number, number][],
  deposit: 0.5,
  validityDays: 15,
};

export const maxHoursFor = (mode: Mode) => (mode === "project" ? PRICING.maxProjectHours : PRICING.maxHourlyHours);

/** Hours are whole numbers 1..max for the mode (client input and server use the same rule). */
export function clampHours(mode: Mode, n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(maxHoursFor(mode), Math.floor(n));
}

/** Typed/pasted text -> digits only (no decimals, e, signs, spaces). "" when nothing usable. */
export const hoursDigits = (raw: string) => raw.replace(/\D+/g, "").replace(/^0+(?=\d)/, "").slice(0, 3);

export type Inputs = {
  mode: Mode;
  hours: number;
  complexity: Complexity;
  /** Urgency toggle (field kept as `extra`). */
  extra: boolean;
  /** Urgency days (each adds PRICING.extra). Defaults to 1. */
  extraDays?: number;
  onSite?: boolean;
  /** Project mode: on-site days (each adds surcharge + travel). */
  onSiteDays?: number;
};

export type Line = { id: "work" | "discount" | "onSite" | "travel" | "extra"; amount: number; pct?: number; days?: number };

export function estimate(i: Inputs, p = PRICING): { lines: Line[]; total: number; deposit: number } {
  const hours = Math.min(i.mode === "project" ? p.maxProjectHours : p.maxHourlyHours, Math.max(0, Math.round(i.hours * 2) / 2));
  const work = hours * p.rates[i.complexity];
  const lines: Line[] = [{ id: "work", amount: work }];
  const tier = i.mode === "project" ? p.volumeTiers.find(([h]) => hours > h) : undefined;
  if (tier) lines.push({ id: "discount", amount: -Math.round(work * tier[1]), pct: Math.round(tier[1] * 100) });
  if (i.onSite) {
    const days = i.mode === "project" ? Math.max(1, Math.min(p.maxOnSiteDays, Math.round(i.onSiteDays ?? 1))) : 1;
    lines.push({ id: "onSite", amount: p.onSiteSurcharge * days, days });
    lines.push({ id: "travel", amount: p.travel * days, days });
  }
  if (i.extra) {
    const days = Math.max(1, Math.min(p.maxUrgencyDays, Math.round(i.extraDays ?? 1) || 1));
    lines.push({ id: "extra", amount: p.extra * days, days });
  }
  const total = lines.reduce((a, l) => a + l.amount, 0);
  return { lines, total, deposit: Math.round(total * p.deposit) };
}
