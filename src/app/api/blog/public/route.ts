import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { getSiteOrder } from "@/lib/site-order";
import { hiddenSet } from "@/lib/site-sections";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Blog hidden from the admin strip: out of the public site, API included.
    const hidden = hiddenSet((await getSiteOrder()).sections).has("blog");
    const posts = hidden ? [] : await getAllPosts({ includeDrafts: false });
    return NextResponse.json(
      { posts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[api/blog/public]", err);
    return NextResponse.json({ posts: [], error: "failed" }, { status: 500 });
  }
}
