// Derives favicon / app icons / social preview from the untouched master logo.
// The master is only READ; every output is a separate file in public/assets/brand/derived/.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(process.cwd(), "public/assets/brand");
const master = path.join(dir, "ping-vibe-logo.jpg");
if (!fs.existsSync(master)) {
  console.error("Missing master logo: public/assets/brand/ping-vibe-logo.jpg — add the official file first.");
  process.exit(1);
}
const out = path.join(dir, "derived");
fs.mkdirSync(out, { recursive: true });
const meta = await sharp(master).metadata();
console.log(`master: ${meta.width}×${meta.height}`);
const white = { r: 255, g: 255, b: 255, alpha: 1 };
// `contain` keeps the entire artwork (no cropping, no distortion); padding is plain white like the master background.
await sharp(master).resize(1200, 630, { fit: "contain", background: white }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(out, "og-image.jpg"));
for (const [name, size] of [["icon-512.png", 512], ["icon-192.png", 192], ["apple-touch-icon.png", 180], ["favicon-32.png", 32]]) {
  await sharp(master).resize(size, size, { fit: "contain", background: white }).png().toFile(path.join(out, name));
}
console.log("Derived assets written to public/assets/brand/derived/");
