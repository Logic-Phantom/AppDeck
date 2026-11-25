// 디자인 레퍼런스 v2(assets/reference/appdeck-design-reference-v2.webp)에서 아이콘·이미지를 잘라
// 배경을 투명 처리한 PNG로 저장한다. 사용: node scripts/extract-reference-icons.mjs
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'assets/reference/appdeck-design-reference-v2.webp');
const OUT = path.join(root, 'assets/icons');
mkdirSync(OUT, { recursive: true });

/**
 * [파일명, 중심 x, 중심 y, 크기(원본 px), 배경 제거 시작 거리, 경계 폭]
 * 좌표는 1254×1254 레퍼런스 기준.
 */
const ICONS = [
  // 카테고리 화면의 3D 아이콘
  ['cat-delivery', 1000, 346, 70],
  ['cat-maps', 1125, 344, 66],
  ['cat-video', 1000, 485, 66],
  ['cat-shopping', 1126, 484, 66],
  ['cat-transport', 1000, 617, 66],
  ['cat-lifestyle', 1126, 615, 66],
  // 홈 빠른 실행 아이콘
  ['quick-delivery', 411, 426, 34],
  ['quick-maps', 529, 426, 30],
  ['quick-ott', 413, 486, 30],
  ['quick-shopping', 531, 485, 30],
  ['quick-transport', 413, 545, 32],
  // 기타
  ['sun', 389, 241, 20],
  ['illust-cleanup', 498, 878, 128, 4, 14],
];

const SCALE = 4;

async function extract([name, cx, cy, size, soft = 10, ramp = 30]) {
  const left = Math.round(cx - size / 2);
  const top = Math.round(cy - size / 2);
  const { data, info } = await sharp(SRC)
    .extract({ left, top, width: size, height: size })
    .resize(size * SCALE, size * SCALE, { kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 모서리 4곳 평균을 배경색으로 보고, 배경에 가까운 픽셀을 투명 처리(부드러운 경계)
  const px = (x, y) => (y * info.width + x) * 4;
  const corners = [px(2, 2), px(info.width - 3, 2), px(2, info.height - 3), px(info.width - 3, info.height - 3)];
  const bg = [0, 1, 2].map((c) => corners.reduce((s, i) => s + data[i + c], 0) / corners.length);
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.sqrt((data[i] - bg[0]) ** 2 + (data[i + 1] - bg[1]) ** 2 + (data[i + 2] - bg[2]) ** 2);
    data[i + 3] = Math.round(Math.max(0, Math.min(1, (d - soft) / ramp)) * 255);
  }
  await sharp(data, { raw: info }).png().toFile(path.join(OUT, `${name}.png`));
  console.log('saved assets/icons/' + name + '.png');
}

/** 스플래시 하단 도시 일러스트 (배경 그대로, 투명 처리 안 함) */
async function splashArt() {
  const file = path.join(root, 'assets/brand/splash-city.jpg');
  await sharp(SRC)
    .extract({ left: 72, top: 503, width: 256, height: 188 })
    .resize(768, 564, { kernel: 'lanczos3' })
    .jpeg({ quality: 88 })
    .toFile(file);
  console.log('saved assets/brand/splash-city.jpg');
}

await Promise.all([...ICONS.map(extract), splashArt()]);
