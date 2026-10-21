// Writes out/sw.js for the static GitHub Pages build: scripts/service-worker.js with the list of
// files to precache and a version that changes whenever the build does. Run after `next build`.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { precacheUrls } from "../lib/precache";

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "out");
const base = process.env.PAGES_BASE_PATH ?? "/norsk-app";

const files = readdirSync(outDir, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(outDir, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"))
  .sort();

const precache = precacheUrls(files, base);

const hash = createHash("sha256");
for (const file of files) {
  if (file === "sw.js") continue;
  hash.update(file).update(readFileSync(path.join(outDir, file)));
}
const version = hash.digest("hex").slice(0, 12);

const config = `self.__SW_CONFIG = ${JSON.stringify({ base, version, precache })};\n`;
writeFileSync(path.join(outDir, "sw.js"), config + readFileSync(path.join(root, "scripts/service-worker.js"), "utf8"));
console.log(`out/sw.js: ${precache.length} files precached, version ${version}`);
