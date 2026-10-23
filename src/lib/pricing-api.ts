/**
 * Save API for the editable pricing (PUT /api/pricing), as a pure handler so
 * permissions and validation are tested without a Worker.
 * 401: no session. 403: signed in but not on ADMIN_EMAILS, or edit mode off.
 */
import { validatePricingPayload, valuesFrom, type PricingValues } from "@/lib/pricing-settings";
import { PRICING } from "@/lib/pricing";

export type PricingCaller = { signedIn: boolean; isAdmin: boolean; editOn: boolean };
export type PricingResult = { status: number; body: Record<string, unknown> };

export function pricingGate(c: PricingCaller): PricingResult | null {
  if (!c.signedIn) return { status: 401, body: { error: "unauthorized" } };
  if (!c.isAdmin) return { status: 403, body: { error: "forbidden" } };
  if (!c.editOn) return { status: 403, body: { error: "edit_mode_off" } };
  return null;
}

export async function handlePricingSave(
  caller: PricingCaller,
  body: unknown,
  save: (v: PricingValues) => Promise<void>,
): Promise<PricingResult> {
  const denied = pricingGate(caller);
  if (denied) return denied;
  const v = validatePricingPayload(body);
  if (!v.ok) return { status: 400, body: { error: v.error, ...(v.field ? { field: v.field } : {}) } };
  try {
    await save(v.values);
  } catch {
    console.error("[api/pricing] save failed");
    return { status: 500, body: { error: "save_failed" } };
  }
  return { status: 200, body: { ok: true, values: v.values, defaults: valuesFrom(PRICING) } };
}
