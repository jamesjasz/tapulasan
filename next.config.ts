import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // emits /en/index.html, /shop/keychain/index.html
  images: { unoptimized: true }, // static export: no image optimizer
  experimental: {
    globalNotFound: true, // two root layouts (id/en) → one global 404
  },
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
