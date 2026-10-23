import { getViewer } from "@/lib/viewer";
import { adminSetActive } from "@/lib/referrals-api";
import { getDb, json, readJson, unavailable } from "@/lib/referrals-route";

export const dynamic = "force-dynamic";

/** Admin only: { active: boolean }. Pauses or reactivates a referrer; nothing is deleted. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  if (!db) return unavailable();
  const [{ id }, viewer, body] = await Promise.all([params, getViewer(), readJson(request)]);
  return json(await adminSetActive(viewer, id, body, db));
}
