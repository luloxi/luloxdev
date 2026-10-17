import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { pastProjectIds } from "@/content/projects";
import { getPostBySlug } from "@/lib/blog";

/**
 * Next renders notFound() thrown inside a dynamic page as an empty
 * `__next_error__` shell (vercel/next.js#99793), so missing posts/projects
 * are detected here and rewritten to an unmatched path: that 404 is fully
 * server-rendered by app/not-found.tsx inside the root layout.
 */
function notFoundRewrite(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/__not-found";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404 });
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The old admin (/rothko) is gone: articles are created and edited on /blog.
  if (pathname === "/rothko" || pathname.startsWith("/rothko/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/blog";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (pathname === "/blog/nuevo") {
    // Cheap cookie check; /api/blog does the real admin check on create.
    if (getSessionCookie(request)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const blog = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blog) {
    const slug = decodeURIComponent(blog[1]);
    const post = await getPostBySlug(slug, { includeDrafts: false });
    if (post) return NextResponse.next();
    // A signed-in admin may open a draft; the page checks the allowlist.
    return getSessionCookie(request) ? NextResponse.next() : notFoundRewrite(request);
  }

  const project = pathname.match(/^\/proyectos\/([^/]+)\/?$/);
  if (project) {
    const id = decodeURIComponent(project[1]);
    return (pastProjectIds as string[]).includes(id)
      ? NextResponse.next()
      : notFoundRewrite(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rothko", "/rothko/:path*", "/blog/:slug", "/proyectos/:id"],
};
