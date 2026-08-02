import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, isAuthConfigured } from "@/lib/auth/server";

const neonMiddleware =
  isAuthConfigured() && auth
    ? auth.middleware({ loginUrl: "/auth/sign-in" })
    : null;

/**
 * Protect /admin routes. Neon Auth middleware redirects unauthenticated users.
 * Admin email allowlist is enforced in page/API handlers via isAdminUser().
 */
export default function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!neonMiddleware) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("error", "auth_not_configured");
    return NextResponse.redirect(url);
  }

  return neonMiddleware(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
