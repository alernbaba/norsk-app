// Renders scripts/icon.svg into the PNG app icons. Run with `npm run icons` after editing the SVG.
import { readFileSync } from "node:fs";
import path from "node:path";
// sharp is installed as part of Next.js.
import sharp from "sharp";

const root = path.resolve(__dirname, "..");
const svg = readFileSync(path.join(root, "scripts/icon.svg"));

const outputs: [file: string, size: number][] = [
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["app/apple-icon.png", 180],
];

async function main() {
  for (const [file, size] of outputs) {
    await sharp(svg, { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(root, file));
    console.log(`${file} (${size}×${size})`);
  }
}

main();
