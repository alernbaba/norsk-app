import type { NextConfig } from "next";

// GITHUB_PAGES=true builds a static site into out/, served from /<repo-name>.
const pagesBasePath = process.env.GITHUB_PAGES === "true" ? (process.env.PAGES_BASE_PATH ?? "/norsk-app") : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  ...(pagesBasePath !== undefined && {
    output: "export",
    // Static export doesn't support partial prerendering.
    cacheComponents: false,
    partialPrefetching: false,
    basePath: pagesBasePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
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
