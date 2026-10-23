/**
 * Save API for Sobre mí publications (PUT /api/publications), as a pure handler
 * so permissions and validation are tested without a Worker.
 * 401: no session. 403: signed in but not on ADMIN_EMAILS, or edit mode off.
 */
import { validatePublicationsPayload, type Publication } from "@/lib/publications";

export type PubCaller = { signedIn: boolean; isAdmin: boolean; editOn: boolean };
export type PubResult = { status: number; body: Record<string, unknown> };

export function publicationsGate(c: PubCaller): PubResult | null {
  if (!c.signedIn) return { status: 401, body: { error: "unauthorized" } };
  if (!c.isAdmin) return { status: 403, body: { error: "forbidden" } };
  if (!c.editOn) return { status: 403, body: { error: "edit_mode_off" } };
  return null;
}

export async function handlePublicationsSave(
  caller: PubCaller,
  body: unknown,
  save: (items: Publication[]) => Promise<void>,
): Promise<PubResult> {
  const denied = publicationsGate(caller);
  if (denied) return denied;
  const v = validatePublicationsPayload(body);
  if (!v.ok) {
    const { ok: _ok, ...err } = v; // eslint-disable-line @typescript-eslint/no-unused-vars
    return { status: 400, body: err };
  }
  try {
    await save(v.items);
  } catch {
    console.error("[api/publications] save failed");
    return { status: 500, body: { error: "save_failed" } };
  }
  return { status: 200, body: { ok: true, items: v.items } };
}
