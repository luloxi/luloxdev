import { NextResponse } from "next/server";
import { getMergedPastProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getMergedPastProjects();
    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
    console.error("[api/projects/public]", err);
    return NextResponse.json({ projects: [], error: "failed" }, { status: 500 });
  }
}
