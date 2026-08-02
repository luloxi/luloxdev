import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const posts = await getAllPosts({ includeDrafts: false });
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
