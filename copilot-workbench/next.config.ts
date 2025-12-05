import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Rewrites removed - using middleware.ts instead for runtime env var support
};

export default nextConfig;
