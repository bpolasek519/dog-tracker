// Usage: node scripts/generate-icons.js
// Generates PWA icons from public/paw.svg using sharp (bundled with Next.js).

const sharp = require("../node_modules/sharp");
const fs = require("fs");
const path = require("path");

const SVG_PATH = path.join(__dirname, "../public/paw.svg");
const OUT_DIR = path.join(__dirname, "../public/icons");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const svgBuffer = fs.readFileSync(SVG_PATH);

async function main() {
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(OUT_DIR, "paw-192.png"));
  console.log("Generated paw-192.png");

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT_DIR, "paw-512.png"));
  console.log("Generated paw-512.png");

  // Maskable: paw at 72% centered on blue-100 background.
  // Safe zone for maskable icons is inner 80% circle — 72% keeps paw inside any crop shape.
  const CANVAS = 512;
  const ICON_SIZE = Math.round(CANVAS * 0.72);
  const OFFSET = Math.round((CANVAS - ICON_SIZE) / 2);

  const pawResized = await sharp(svgBuffer)
    .resize(ICON_SIZE, ICON_SIZE)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 219, g: 234, b: 254, alpha: 1 }, // blue-100
    },
  })
    .composite([{ input: pawResized, left: OFFSET, top: OFFSET }])
    .png()
    .toFile(path.join(OUT_DIR, "paw-512-maskable.png"));
  console.log("Generated paw-512-maskable.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
