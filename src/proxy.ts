import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { pastProjectIds } from "@/content/projects";
import { getPostBySlug, getPostBySlugEn } from "@/lib/blog";
import { EN_PREFIX, LOCALE_HEADER, enToEsPath, localeFromPath } from "@/lib/routes";
import type { Locale } from "@/i18n/types";

/**
 * Every page request passes through here and gets the x-lulox-locale request
 * header from its URL (/en/... = en, everything else = es). The header the
 * client sent, if any, is overwritten. No redirect by cookie or Accept-Language:
 * crawlers and visitors see what the URL says.
 *
 * /en/<segment>/... is rewritten to the Spanish route that renders it
 * (/en/hire -> /contratar), so both URLs share one page.
 */
function withLocale(request: NextRequest, locale: Locale) {
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  return headers;
}

function next(request: NextRequest, locale: Locale) {
  return NextResponse.next({ request: { headers: withLocale(request, locale) } });
}

function rewrite(request: NextRequest, locale: Locale, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url, { request: { headers: withLocale(request, locale) } });
}

function redirect(request: NextRequest, pathname: string, status = 301) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, status);
}

/**
 * Next renders notFound() thrown inside a dynamic page as an empty
 * `__next_error__` shell (vercel/next.js#99793), so missing posts/projects
 * are detected here and rewritten to an unmatched path: that 404 is fully
 * server-rendered by app/not-found.tsx inside the root layout.
 */
function notFoundRewrite(request: NextRequest, locale: Locale) {
  const url = request.nextUrl.clone();
  url.pathname = "/__not-found";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404, request: { headers: withLocale(request, locale) } });
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPath(pathname);

  // The old admin (/rothko) is gone: articles are created and edited on /blog.
  if (pathname === "/rothko" || pathname.startsWith("/rothko/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/blog";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (pathname === "/blog/nuevo") {
    // Cheap cookie check; /api/blog does the real admin check on create.
    if (getSessionCookie(request)) return next(request, "es");
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // ----- English: /en/blog/<slug_en> -----
  const enBlog = pathname.match(/^\/en\/blog\/([^/]+)\/?$/);
  if (enBlog) {
    const slug = decodeURIComponent(enBlog[1]);
    const admin = Boolean(getSessionCookie(request));
    const byEn = await getPostBySlugEn(slug, { includeDrafts: admin });
    if (byEn) return rewrite(request, "en", `/blog/${encodeURIComponent(byEn.slug)}`);
    // Spanish slug under /en: 301 to the English slug (or serve it if the post has none yet).
    const byEs = await getPostBySlug(slug, { includeDrafts: admin });
    if (byEs) {
      return byEs.slugEn && byEs.slugEn !== slug
        ? redirect(request, `${EN_PREFIX}/blog/${encodeURIComponent(byEs.slugEn)}`)
        : rewrite(request, "en", `/blog/${encodeURIComponent(byEs.slug)}`);
    }
    // A signed-in admin may open a draft; the page checks the allowlist.
    return admin ? rewrite(request, "en", `/blog/${encodeURIComponent(slug)}`) : notFoundRewrite(request, "en");
  }

  // ----- English: every other /en route -----
  if (locale === "en") {
    const es = enToEsPath(pathname);
    if (!es) return notFoundRewrite(request, "en");
    const project = es.match(/^\/proyectos\/([^/]+)\/?$/);
    if (project && !(pastProjectIds as string[]).includes(decodeURIComponent(project[1]))) {
      return notFoundRewrite(request, "en");
    }
    return rewrite(request, "en", es);
  }

  // ----- Spanish (root) -----
  const blog = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blog) {
    const slug = decodeURIComponent(blog[1]);
    const post = await getPostBySlug(slug, { includeDrafts: false });
    if (post) return next(request, "es");
    // English slug on the Spanish URL: 301 to the Spanish slug.
    const byEn = await getPostBySlugEn(slug, { includeDrafts: false });
    if (byEn) return redirect(request, `/blog/${encodeURIComponent(byEn.slug)}`);
    // A signed-in admin may open a draft; the page checks the allowlist.
    return getSessionCookie(request) ? next(request, "es") : notFoundRewrite(request, "es");
  }

  const project = pathname.match(/^\/proyectos\/([^/]+)\/?$/);
  if (project) {
    const id = decodeURIComponent(project[1]);
    return (pastProjectIds as string[]).includes(id)
      ? next(request, "es")
      : notFoundRewrite(request, "es");
  }

  return next(request, "es");
}

export const config = {
  // Every page (so the locale header is always set by us), not assets/API/media/_next.
  matcher: ["/((?!api/|_next/|media/|__not-found|.*\\.[a-z0-9]+$).*)"],
};
