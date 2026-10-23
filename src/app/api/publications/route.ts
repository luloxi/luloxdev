import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isAdminUser } from "@/lib/auth/admin";
import { editModeFromCookie } from "@/lib/edit-mode";
import { requireDb } from "@/lib/db";
import { handlePublicationsSave, type PubCaller } from "@/lib/publications-api";
import { savePublications } from "@/lib/publications-db";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

async function caller(): Promise<PubCaller> {
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

/** Admin + edit mode only: save the ordered list of Sobre mí publications (see src/lib/publications.ts). */
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
  const r = await handlePublicationsSave(who, body, async (items) => savePublications(await requireDb(), items));
  return NextResponse.json(r.body, { status: r.status, headers: NO_STORE });
}
