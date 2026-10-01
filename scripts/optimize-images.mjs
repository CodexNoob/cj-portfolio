// Converts large PNG/JPG project images to WebP (max 1400px wide).
// Usage: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const dir = 'assets/images';
const MAX_WIDTH = 1400;
const MIN_BYTES = 60 * 1024; // only touch images over 60 KB
const skip = new Set(['profile.jpg']); // hero avatar stays as-is

for (const file of await readdir(dir)) {
  const ext = extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext) || skip.has(file)) continue;
  const src = join(dir, file);
  const { size } = await stat(src);
  if (size < MIN_BYTES) continue;
  const out = join(dir, `${basename(file, ext)}.webp`);
  const info = await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${file} ${(size / 1024).toFixed(0)} KB -> ${basename(out)} ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`);
}
