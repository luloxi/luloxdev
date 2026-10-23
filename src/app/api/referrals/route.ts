import { getViewer } from "@/lib/viewer";
import { myReferral, signup } from "@/lib/referrals-api";
import { getDb, ipOf, json, limiter, readJson, refEnv, unavailable } from "@/lib/referrals-route";
import { loadSiteOrder } from "@/lib/site-order";
import { isPathHidden } from "@/lib/site-sections";

export const dynamic = "force-dynamic";

/** The signed-in user's own code, link and totals (401 when anonymous). */
export async function GET() {
  const db = await getDb();
  if (!db) return unavailable();
  return json(await myReferral(await getViewer(), db));
}

/**
 * Create the signed-in user's code: { name, whatsapp?, code }. The email is
 * the Google account's. Rate limited (CONTACT_RL) per IP.
 */
export async function POST(request: Request) {
  const db = await getDb();
  if (!db) return unavailable();
  const [viewer, env, order, body] = await Promise.all([getViewer(), refEnv(), loadSiteOrder(), readJson(request)]);
  return json(
    await signup(viewer, body, {
      db,
      limit: limiter(env.CONTACT_RL, `referral:${ipOf(request)}`),
      sectionHidden: isPathHidden("/referidos", order.sections),
    }),
  );
}
