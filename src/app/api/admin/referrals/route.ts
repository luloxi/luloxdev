import { getViewer } from "@/lib/viewer";
import { adminList } from "@/lib/referrals-api";
import { getDb, json, unavailable } from "@/lib/referrals-route";

export const dynamic = "force-dynamic";

/** Admin only (401 anonymous, 403 other accounts): every referrer with its leads and totals. */
export async function GET() {
  const db = await getDb();
  if (!db) return unavailable();
  return json(await adminList(await getViewer(), db));
}
