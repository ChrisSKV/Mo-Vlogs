import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old Android WebViews are a real slice of this audience (South Asia, MENA).
  // Next 16's default modern output breaks on them, and the form is the whole
  // page, so the transpile cost is worth it.
  transpilePackages: [],
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
};

export default nextConfig;
