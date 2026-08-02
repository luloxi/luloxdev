import { NextResponse } from "next/server";
import type { BlogPost } from "@/content/blog/types";
import {
  deletePost,
  getAllPosts,
  requireAdminSession,
  upsertPost,
} from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 401 });
  }
  const posts = await getAllPosts({ includeDrafts: true });
  return NextResponse.json({ posts });
}

export async function PUT(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const post = body as BlogPost;
  if (!post?.slug || !post.title?.es || !post.title?.en) {
    return NextResponse.json({ error: "invalid_post" }, { status: 400 });
  }

  const slug = post.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  await upsertPost({
    ...post,
    slug,
    published: Boolean(post.published),
    tags: Array.isArray(post.tags) ? post.tags : [],
    coverImage: post.coverImage || "",
    publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
    summary: {
      es: post.summary?.es ?? "",
      en: post.summary?.en ?? "",
    },
    body: {
      es: post.body?.es ?? "",
      en: post.body?.en ?? "",
    },
    title: {
      es: post.title.es,
      en: post.title.en,
    },
  });

  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  await deletePost(slug);
  return NextResponse.json({ ok: true });
}
