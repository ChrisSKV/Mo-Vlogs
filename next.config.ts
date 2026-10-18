import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old Android WebViews are a real slice of this audience (South Asia, MENA).
  // Next 16's default modern output breaks on them, and the form is the whole
  // page, so the transpile cost is worth it.
  transpilePackages: [],
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,

  // The committed $10,000 offer used to live at /10k and the earlier cuts
  // at /alt-1 and /no-amount. That page is now the site itself and the cuts
  // are deleted, so anything already shared lands on the live page instead of
  // a 404. Permanent: these paths are not coming back.
  async redirects() {
    return [
      { source: "/10k", destination: "/", permanent: true },
      { source: "/alt-1", destination: "/", permanent: true },
      { source: "/no-amount", destination: "/", permanent: true },
      { source: "/no-amount/alt-1", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
