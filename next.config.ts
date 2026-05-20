import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disable runtime server-side resizing to serve original 4K files instantly
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  typescript: {
    // Bypasses Next.js typechecking step during build to prevent WASM SWC worker crash on Windows
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
