import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output as standalone for Docker deployment
  output: "standalone",

  // Enable SWR caching for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
