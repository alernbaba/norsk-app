// Which files of the static export the service worker caches up front (see scripts/build-sw.ts).

/**
 * Turns the export's file paths (relative to out/, with forward slashes) into the URLs to precache:
 * every page (as its trailing-slash URL), the hashed Next.js assets, the icons and the manifest.
 * React Server Component payloads (*.txt) are left to the runtime cache, since every page also
 * exists as HTML and the client falls back to a full page load when a payload is missing.
 */
export function precacheUrls(files: string[], base: string): string[] {
  const urls: string[] = [];
  for (const file of files) {
    if (file === "sw.js" || file.endsWith(".txt") || file.startsWith(".")) continue;
    if (file.startsWith("_") && !file.startsWith("_next/static/")) continue;
    if (file === "index.html") urls.push(`${base}/`);
    else if (file.endsWith("/index.html")) urls.push(`${base}/${file.slice(0, -"index.html".length)}`);
    else urls.push(`${base}/${file}`);
  }
  return urls.sort();
}
