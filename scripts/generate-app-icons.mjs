// 앱 아이콘/스플래시/파비콘을 v2 브랜드 마크(블루→바이올렛 Λ)로 생성한다. 사용: npm run assets:build
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets/brand');
mkdirSync(out, { recursive: true });

/** src/design-system/brand.tsx BrandMark와 같은 도형 (viewBox 0 0 100 100) */
function markGroup(mono) {
  if (mono) {
    return (
      '<path d="M50 22 L78 76" stroke="#000" stroke-width="21" stroke-linecap="round"/>' +
      '<path d="M50 22 L22 76" stroke="#000" stroke-width="21" stroke-linecap="round"/>'
    );
  }
  return (
    '<defs>' +
    '<linearGradient id="r" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#3A74F2"/><stop offset="0.7" stop-color="#3F50E6"/><stop offset="1" stop-color="#8A5CF6"/></linearGradient>' +
    '<linearGradient id="l" x1="0.6" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#7CC0FF"/><stop offset="0.45" stop-color="#3D86F7"/><stop offset="1" stop-color="#2457E8"/></linearGradient>' +
    '</defs>' +
    '<path d="M50 22 L78 76" stroke="url(#r)" stroke-width="21" stroke-linecap="round"/>' +
    '<path d="M50 22 L22 76" stroke="url(#l)" stroke-width="21" stroke-linecap="round"/>'
  );
}

/** 마크를 size 캔버스 중앙에 scale 비율로 배치 */
function svg({ size, scale, bg, radius = 0, mono = false }) {
  const mark = size * scale;
  const off = (size - mark) / 2;
  const bgRect = bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : '';
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bgRect}` +
      `<g transform="translate(${off} ${off}) scale(${mark / 100})">${markGroup(mono)}</g></svg>`,
  );
}

const jobs = [
  ['icon.png', svg({ size: 1024, scale: 0.74, bg: '#FFFFFF' })],
  ['android-icon-foreground.png', svg({ size: 1024, scale: 0.52 })],
  ['android-icon-monochrome.png', svg({ size: 1024, scale: 0.52, mono: true })],
  ['splash-icon.png', svg({ size: 512, scale: 0.78 })],
  ['favicon.png', svg({ size: 64, scale: 0.86, bg: '#FFFFFF', radius: 16 })],
];

for (const [name, data] of jobs) {
  await sharp(data).png().toFile(path.join(out, name));
  console.log('saved assets/brand/' + name);
}
