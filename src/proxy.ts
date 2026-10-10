import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Protect /rothko (blog CMS). Cheap cookie check only: no session cookie means
 * straight to sign-in. The real check (valid session + admin email allowlist)
 * runs in the /api/blog and /api/projects handlers via requireAdminSession().
 */
export default function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/rothko")) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rothko", "/rothko/:path*"],
};
