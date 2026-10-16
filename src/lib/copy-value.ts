/** Max stored length of one site_copy value (long Markdown bodies like Sobre mí). */
export const COPY_MAX_LENGTH = 20000;

export type CopyValueResult = { ok: true; value: string } | { ok: false; error: "empty" | "too_long" };

/**
 * Normalize an edited copy value. Markdown characters (* # _ [ ] > -) are kept
 * as is: rendering is what makes it safe (no raw HTML), not this step.
 */
export function normalizeCopyValue(raw: string): CopyValueResult {
  const value = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .trim();
  if (!value) return { ok: false, error: "empty" };
  if (value.length > COPY_MAX_LENGTH) return { ok: false, error: "too_long" };
  return { ok: true, value };
}
