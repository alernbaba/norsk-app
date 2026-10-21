import { describe, expect, it } from "vitest";
import { precacheUrls } from "@/lib/precache";

describe("precacheUrls", () => {
  it("maps pages to their trailing-slash URLs under the base path", () => {
    expect(precacheUrls(["index.html", "topics/greetings/index.html", "404.html"], "/norsk-app")).toEqual([
      "/norsk-app/",
      "/norsk-app/404.html",
      "/norsk-app/topics/greetings/",
    ]);
  });

  it("keeps static assets, icons and the manifest", () => {
    const files = ["_next/static/chunks/a.js", "_next/static/media/font.woff2", "icons/icon-192.png", "manifest.webmanifest"];
    expect(precacheUrls(files, "/norsk-app")).toEqual(files.map((file) => `/norsk-app/${file}`).sort());
  });

  it("skips RSC payloads, the worker itself, dotfiles and internal routes", () => {
    const files = ["index.txt", "topics/greetings/__next._tree.txt", "sw.js", ".nojekyll", "_not-found/index.html"];
    expect(precacheUrls(files, "/norsk-app")).toEqual([]);
  });

  it("works without a base path", () => {
    expect(precacheUrls(["index.html", "about/index.html"], "")).toEqual(["/", "/about/"]);
  });
});
