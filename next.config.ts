import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Neon serverless driver must run in Node.js runtime, not Edge
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
