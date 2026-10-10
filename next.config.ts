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
  ...(isCloudflare ? { images: { unoptimized: true } } : {}),
};

export default nextConfig;
