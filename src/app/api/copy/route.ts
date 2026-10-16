import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/blog";
import { isKnownCopyKey, setCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

/** Admin only: save one text (plain text, line breaks allowed). */
export async function PUT(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 401 });
  }
  let body: { key?: unknown; locale?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const key = typeof body.key === "string" ? body.key : "";
  const locale = typeof body.locale === "string" ? body.locale : "";
  const raw = typeof body.value === "string" ? body.value : null;
  if (!isKnownCopyKey(key, locale)) {
    return NextResponse.json({ error: "unknown_key" }, { status: 400 });
  }
  if (raw === null) {
    return NextResponse.json({ error: "invalid_value" }, { status: 400 });
  }
  // Plain text only: normalize line endings, drop control chars except \n and \t.
  const value = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .trim();
  if (!value || value.length > 5000) {
    return NextResponse.json({ error: "invalid_value" }, { status: 400 });
  }
  await setCopy(key, locale, value);
  return NextResponse.json({ ok: true, key, locale, value });
}
