import type { MetadataRoute } from "next";

// The manifest's URLs are not prefixed with basePath automatically.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${base}/`,
    name: "Norsk – learn Norwegian",
    short_name: "Norsk",
    description: "Learn Norwegian (bokmål) with flashcards, sentence building, writing practice and inflections.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#f4eee2",
    theme_color: "#f4eee2",
    categories: ["education"],
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
