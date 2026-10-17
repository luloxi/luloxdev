import { getMedia, isMediaKey } from "@/lib/media";

/** Public: streams an uploaded image from R2 (immutable, content-addressed by uuid). */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  if (!isMediaKey(key)) return new Response("Not found", { status: 404 });
  const bucket = await getMedia();
  const obj = bucket ? await bucket.get(key) : null;
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Length": String(obj.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: obj.httpEtag,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
