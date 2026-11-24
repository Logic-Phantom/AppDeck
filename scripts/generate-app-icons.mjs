// 앱 아이콘/스플래시/파비콘을 SVG 브랜드 마크로부터 생성한다. 사용: npm run assets:build
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets/brand');
mkdirSync(out, { recursive: true });

const MARK =
  'M20.6 7.6a3.9 3.9 0 0 1 6.8 0l15.3 27.6a2.6 2.6 0 0 1-2.3 3.9h-6.2a2.6 2.6 0 0 1-2.3-1.4L24 21.4l-7.9 16.3a2.6 2.6 0 0 1-2.3 1.4H7.6a2.6 2.6 0 0 1-2.3-3.9z';

/** 브랜드 마크를 size 캔버스 중앙에 scale 비율로 그린 SVG */
function markSvg({ size, scale, fg, bg, radius = 0 }) {
  const markSize = size * scale;
  const offset = (size - markSize) / 2;
  const bgRect = bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : '';
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bgRect}` +
      `<g transform="translate(${offset} ${offset + markSize * 0.03}) scale(${markSize / 48})"><path d="${MARK}" fill="${fg}"/></g></svg>`,
  );
}

const jobs = [
  ['icon.png', markSvg({ size: 1024, scale: 0.58, fg: '#111317', bg: '#FFFFFF' })],
  ['android-icon-foreground.png', markSvg({ size: 1024, scale: 0.4, fg: '#111317' })],
  ['android-icon-monochrome.png', markSvg({ size: 1024, scale: 0.4, fg: '#000000' })],
  ['splash-icon.png', markSvg({ size: 512, scale: 0.6, fg: '#111317', bg: '#FFFFFF', radius: 140 })],
  ['favicon.png', markSvg({ size: 64, scale: 0.7, fg: '#111317', bg: '#FFFFFF', radius: 16 })],
];

for (const [name, svg] of jobs) {
  await sharp(svg).png().toFile(path.join(out, name));
  console.log('saved assets/brand/' + name);
}
