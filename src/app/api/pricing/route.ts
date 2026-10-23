import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isAdminUser } from "@/lib/auth/admin";
import { editModeFromCookie } from "@/lib/edit-mode";
import { requireDb } from "@/lib/db";
import { handlePricingSave, type PricingCaller } from "@/lib/pricing-api";
import { savePricing } from "@/lib/pricing-db";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

async function caller(): Promise<PricingCaller> {
  const h = await headers();
  const editOn = editModeFromCookie(h.get("cookie"));
  try {
    const { getAuth } = await import("@/lib/auth/server");
    const auth = await getAuth();
    if (!auth) return { signedIn: false, isAdmin: false, editOn };
    const session = await auth.api.getSession({ headers: h });
    const user = session?.user;
    return { signedIn: Boolean(user), isAdmin: isAdminUser(user), editOn };
  } catch {
    return { signedIn: false, isAdmin: false, editOn };
  }
}

/** Admin + edit mode only: save every editable amount of /contratar (see src/lib/pricing-settings.ts). */
export async function PUT(request: Request) {
  const who = await caller();
  let body: unknown = null;
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      body = null;
    }
  }
  const r = await handlePricingSave(who, body, async (v) => savePricing(await requireDb(), v));
  return NextResponse.json(r.body, { status: r.status, headers: NO_STORE });
}
