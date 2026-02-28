import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure community preset JSON files are included in server bundle tracing
  // This allows fs.readdir to find them when deployed on Vercel
  outputFileTracingIncludes: {
    "/": ["./src/data/community-presets/*.json"],
  },
};

export default nextConfig;
