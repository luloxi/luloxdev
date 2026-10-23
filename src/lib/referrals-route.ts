/** Shared bits of the /api/referrals and /api/admin/referrals route handlers. */
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import type { ApiResult } from "@/lib/referrals-api";

type RL = { limit: (o: { key: string }) => Promise<{ success: boolean }> };
export type RefEnv = { CONTACT_RL?: RL; REF_CHECK_RL?: RL };

export const json = (r: ApiResult) => NextResponse.json(r.body, { status: r.status, headers: { "Cache-Control": "no-store" } });
export const unavailable = () => json({ status: 503, body: { error: "not_configured" } });

export async function refEnv(): Promise<RefEnv> {
  try {
    return (await getCloudflareContext({ async: true })).env as unknown as RefEnv;
  } catch {
    return {};
  }
}

/** Cloudflare rate limit binding; missing binding = allowed (local dev). */
export function limiter(rl: RL | undefined, key: string) {
  return async () => (rl ? (await rl.limit({ key })).success : true);
}

export const ipOf = (request: Request) => request.headers.get("cf-connecting-ip") ?? "unknown";

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export { getDb };
