import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin root so parent monorepo lockfiles don't confuse the bundler
    root: path.join(__dirname),
  },
};

export default nextConfig;
