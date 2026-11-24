// 디자인 레퍼런스(assets/reference/appdeck-design-reference.webp)에서 컬러 아이콘을 잘라내
// 배경을 투명 처리한 PNG로 저장한다. 사용: node scripts/extract-reference-icons.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'assets/reference/appdeck-design-reference.webp');
const OUT = path.join(root, 'assets/icons');

/** [파일명, 중심 x, 중심 y, 크기(원본 px)] — 1254×1254 레퍼런스 좌표 */
const ICONS = [
  ['purpose-delivery', 124, 405, 34],
  ['purpose-directions', 124, 450, 32],
  ['purpose-ott', 124, 495, 32],
  ['purpose-shopping', 124, 542, 32],
  ['purpose-movie', 124, 586, 32],
  ['purpose-cleanup', 124, 630, 32],
  ['sparkle', 977, 473, 26],
];

const SCALE = 4;

async function extract([name, cx, cy, size, soft = 10, ramp = 34]) {
  const left = Math.round(cx - size / 2);
  const top = Math.round(cy - size / 2);
  const { data, info } = await sharp(SRC)
    .extract({ left, top, width: size, height: size })
    .resize(size * SCALE, size * SCALE, { kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 모서리 4곳의 평균을 배경색으로 보고, 배경과 가까운 픽셀을 투명 처리(부드러운 경계)
  const px = (x, y) => (y * info.width + x) * 4;
  const corners = [px(1, 1), px(info.width - 2, 1), px(1, info.height - 2), px(info.width - 2, info.height - 2)];
  const bg = [0, 1, 2].map((c) => corners.reduce((s, i) => s + data[i + c], 0) / corners.length);
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.sqrt((data[i] - bg[0]) ** 2 + (data[i + 1] - bg[1]) ** 2 + (data[i + 2] - bg[2]) ** 2);
    const alpha = Math.max(0, Math.min(1, (d - soft) / ramp));
    data[i + 3] = Math.round(alpha * 255);
  }
  const file = path.join(OUT, `${name}.png`);
  await sharp(data, { raw: info }).png().toFile(file);
  console.log('saved', path.relative(root, file));
}

await Promise.all(ICONS.map(extract));
