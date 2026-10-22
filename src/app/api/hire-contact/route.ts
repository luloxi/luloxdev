import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { bodyFromForm, handleHireContact, type HireEnv } from "@/lib/hire-contact";

export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  const isForm = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  let body: unknown;
  try {
    body = isForm ? bodyFromForm((await request.formData()).entries()) : await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { env } = await getCloudflareContext({ async: true });
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const r = await handleHireContact(body, env as unknown as HireEnv, ip);
  if (isForm) {
    // Plain form post: send the browser back to the page with the result in the URL.
    const to = new URL("/contratar", request.url);
    to.searchParams.set("contacto", r.body.ok ? "ok" : String(r.body.error ?? "error"));
    to.hash = "hire-form-panel";
    return NextResponse.redirect(to, 303);
  }
  return NextResponse.json(r.body, { status: r.status, headers: { "Cache-Control": "no-store" } });
}
