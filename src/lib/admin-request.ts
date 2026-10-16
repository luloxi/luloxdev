import { headers } from "next/headers";

/** Cheap: no session cookie means not admin (no D1/auth work for visitors). */
export async function isAdminRequest(): Promise<boolean> {
  try {
    const h = await headers();
    const cookie = h.get("cookie") ?? "";
    if (!/better-auth\.session_token=/.test(cookie)) return false;
    const { requireAdminSession } = await import("@/lib/blog");
    const gate = await requireAdminSession();
    return gate.ok;
  } catch {
    return false;
  }
}
