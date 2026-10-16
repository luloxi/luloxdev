import type { NextConfig } from "next";
import path from "path";

// Cloudflare Workers (OpenNext) has no Vercel image optimizer, so images are
// served as is there. `pnpm cf:build` sets NEXT_BUILD_TARGET=cloudflare.
// Vercel builds leave it unset and keep next/image optimization.
const isCloudflare = process.env.NEXT_BUILD_TARGET === "cloudflare";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin root so parent monorepo lockfiles don't confuse the bundler
    root: path.join(__dirname),
  },
  // Spanish URLs are canonical. Old English paths 301 to them (same content,
  // the language comes from the cookie, not the URL).
  async redirects() {
    const r = (source: string, destination: string) => ({
      source,
      destination,
      statusCode: 301 as const,
    });
    return [
      r("/about", "/sobre-mi"),
      r("/tastes", "/sobre-mi"),
      r("/gustos", "/sobre-mi"),
      r("/projects", "/proyectos"),
      r("/projects/:id(mochi|sami|punksociety)", "/proyectos/:id"),
      r("/contact", "/contacto"),
      r("/privacy", "/privacidad"),
      r("/auth/sign-in", "/ingresar"),
      r("/login", "/ingresar"),
    ];
  },
  ...(isCloudflare ? { images: { unoptimized: true } } : {}),
};

export default nextConfig;
