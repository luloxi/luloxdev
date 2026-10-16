import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/blog";
import { COPY_MAX_LENGTH, normalizeCopyValue } from "@/lib/copy-value";
import { isKnownCopyKey, setCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

/** Admin only: save one text (Markdown for body fields, rendered without raw HTML). */
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
  const norm = normalizeCopyValue(raw);
  if (!norm.ok) {
    return NextResponse.json({ error: norm.error, max: COPY_MAX_LENGTH }, { status: 400 });
  }
  const value = norm.value;
  await setCopy(key, locale, value);
  return NextResponse.json({ ok: true, key, locale, value });
}
