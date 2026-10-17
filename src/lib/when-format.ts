/** Proposed call time, as typed in the form: "YYYY-MM-DDTHH:MM" (24 h, Argentina time). */
export const WHEN_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** "2026-10-20T15:30" -> "2026-10-20 3:30 pm" (year-month-day, 12-hour). */
export function formatWhen(v: string): string | null {
  const m = WHEN_RE.exec(v);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const h = Number(hh);
  if (h > 23 || Number(mm) > 59 || Number(mo) < 1 || Number(mo) > 12 || Number(d) < 1 || Number(d) > 31) return null;
  return `${y}-${mo}-${d} ${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "am" : "pm"}`;
}

export type WhenParts = { y: string; mo: string; d: string; h: string; mi: string; ap: "" | "am" | "pm" };

/** Picker parts (12-hour) -> "YYYY-MM-DDTHH:MM" (24-hour), or "" if incomplete. */
export function partsToWhen(p: WhenParts): string {
  if (!p.y || !p.mo || !p.d || !p.h || !p.mi || !p.ap) return "";
  const h12 = Number(p.h) % 12;
  const h24 = p.ap === "pm" ? h12 + 12 : h12;
  return `${p.y}-${p.mo}-${p.d}T${String(h24).padStart(2, "0")}:${p.mi}`;
}

export function daysInMonth(y: string, mo: string) {
  if (!y || !mo) return 31;
  return new Date(Date.UTC(Number(y), Number(mo), 0)).getUTCDate();
}
