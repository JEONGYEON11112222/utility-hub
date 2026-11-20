import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Retired near-duplicate timer pages. The hash opens /timer at the same length.
  async redirects() {
    return [1, 15, 20, 30, 60].map((minutes) => ({
      source: `/${minutes}-minute-timer`,
      destination: `/timer#minutes=${minutes}`,
      permanent: true,
    }));
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
