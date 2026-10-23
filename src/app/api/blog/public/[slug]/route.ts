import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog";
import { getSiteOrder } from "@/lib/site-order";
import { hiddenSet } from "@/lib/site-sections";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const hidden = hiddenSet((await getSiteOrder()).sections).has("blog");
    const post = hidden ? null : await getPostBySlug(slug, { includeDrafts: false });
    if (!post) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error("[api/blog/public/slug]", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
