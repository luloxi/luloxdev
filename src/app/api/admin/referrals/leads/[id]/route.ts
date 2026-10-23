import { getViewer } from "@/lib/viewer";
import { adminUpdatePayout } from "@/lib/referrals-api";
import { getDb, json, readJson, unavailable } from "@/lib/referrals-route";

export const dynamic = "force-dynamic";

/** Admin only: { currency: "ARS" | "USD", amount, status: "pending" | "paid" }. The 15% is computed server-side. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  if (!db) return unavailable();
  const [{ id }, viewer, body] = await Promise.all([params, getViewer(), readJson(request)]);
  return json(await adminUpdatePayout(viewer, id, body, db));
}
