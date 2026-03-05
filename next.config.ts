import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Neon serverless driver must run in Node.js runtime, not Edge
  serverExternalPackages: ["@neondatabase/serverless"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
