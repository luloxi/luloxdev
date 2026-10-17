import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/blog";
import { getMedia, MEDIA_EXT, MEDIA_MAX, sniffImage } from "@/lib/media";

export const dynamic = "force-dynamic";

/** Admin only: upload one raster image to R2; returns its public /media URL. */
export async function POST(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 401 });
  const bucket = await getMedia();
  if (!bucket) return NextResponse.json({ error: "storage_not_configured" }, { status: 503 });

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MEDIA_MAX) return NextResponse.json({ error: "too_large", max: MEDIA_MAX }, { status: 413 });

  const buf = await file.arrayBuffer();
  const type = sniffImage(new Uint8Array(buf.slice(0, 16)));
  if (!type || !MEDIA_EXT[type]) return NextResponse.json({ error: "unsupported_type" }, { status: 415 });

  const key = `blog/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${MEDIA_EXT[type]}`;
  await bucket.put(key, buf, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
  return NextResponse.json({ ok: true, url: `/media/${key}` });
}
