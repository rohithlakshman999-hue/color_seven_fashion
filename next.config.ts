import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xruuhhtxnhtaqzdyzimf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  typescript: {
    // Bypasses Next.js typechecking step during build to prevent WASM SWC worker crash on Windows
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
