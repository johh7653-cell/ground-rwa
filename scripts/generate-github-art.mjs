#!/usr/bin/env node
// Refresh GitHub branding from public/ground-logo.png, keeping its original bytes.
// Run from the project: node scripts/generate-github-art.mjs
// Needs only the existing sharp dependency. Manrope glyph outlines are already
// preserved in ground-cover.svg; no system font, Python or font install is needed.
// Until the public logo exists, ground-mark.png supplies the same original image.
import { readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const assets = new URL("docs/github/assets/", root);
const logoPath = new URL("public/ground-logo.png", root);
let original;
try {
  await access(logoPath);
  original = await readFile(logoPath);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  original = await readFile(new URL("ground-mark.png", assets));
}
const metadata = await sharp(original).metadata();
if (metadata.format !== "png" || !metadata.width || !metadata.height) throw new Error("GROUND requires the owner's original PNG logo.");
const image = `data:image/png;base64,${original.toString("base64")}`;
const logo = `<image id="ground-logo" x="1214" y="128" width="280" height="280" preserveAspectRatio="xMidYMid meet" href="${image}"/>`;

// The checked-in SVG is the portable master for the actual Manrope outlines.
// Replace only its named logo slot; leave the lettering and all other geometry.
let cover = await readFile(new URL("ground-cover.svg", assets), "utf8");
if (/<image\b[^>]*id="ground-logo"[^>]*\/>/.test(cover)) {
  cover = cover.replace(/<image\b[^>]*id="ground-logo"[^>]*\/>/, logo);
} else {
  const previousMark = /<svg x="1194" y="104" width="326" height="326" viewBox="0 0 64 64">[\s\S]*?<\/svg>/;
  if (!previousMark.test(cover)) throw new Error("The cover master has no recognized GROUND logo slot.");
  cover = cover.replace(previousMark, logo);
}
if (/<text\b|font-family|@font-face/.test(cover)) throw new Error("Keep the checked-in Manrope glyph outlines rather than introducing a system font.");
const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}" role="img" aria-labelledby="title desc"><title id="title">GROUND logo</title><desc id="desc">The owner's original GROUND logo, embedded without altering its colors or cropping it.</desc><image width="${metadata.width}" height="${metadata.height}" preserveAspectRatio="xMidYMid meet" href="${image}"/></svg>\n`;

// PNG mark is a byte-for-byte copy; only the surrounding cover is rendered.
await writeFile(new URL("ground-mark.png", assets), original);
await writeFile(new URL("ground-mark.svg", assets), mark);
await writeFile(new URL("ground-cover.svg", assets), cover);
await sharp(Buffer.from(cover)).png().toFile(fileURLToPath(new URL("ground-cover.png", assets)));
console.log(`ground-mark: original ${metadata.width} × ${metadata.height} PNG + embedded SVG`);
console.log("ground-cover: 1600 × 560 · original logo displayed at 280 × 280 · preserved Manrope outlines");
console.log("architecture: unchanged");
