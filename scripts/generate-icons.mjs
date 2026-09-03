import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });
const svg = readFileSync('source-icon.svg');
const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}.png`);
}
console.log('Icons generated.');
