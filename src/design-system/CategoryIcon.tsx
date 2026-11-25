import { Image } from 'expo-image';
import type { ReactElement } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { AppCategoryId } from '@/domain/categories/category.types';

import { useSvgId } from './brand';

/** 레퍼런스 v2에서 추출한 3D 아이콘 (scripts/extract-reference-icons.mjs) */
const EXTRACTED: Partial<Record<AppCategoryId, number>> = {
  food_delivery: require('@/assets/icons/cat-delivery.png'),
  maps_navigation: require('@/assets/icons/cat-maps.png'),
  streaming_video: require('@/assets/icons/cat-video.png'),
  shopping: require('@/assets/icons/cat-shopping.png'),
  transport_mobility: require('@/assets/icons/cat-transport.png'),
  health_lifestyle: require('@/assets/icons/cat-lifestyle.png'),
};

type Tone = 'blue' | 'pink' | 'violet' | 'mint' | 'amber';

const TONES: Record<Tone, [string, string, string]> = {
  // [밝은 위, 중간, 어두운 아래]
  blue: ['#A9C4FF', '#5C86F7', '#3157E0'],
  pink: ['#FFB3C1', '#FF6F8E', '#E8435F'],
  violet: ['#C9B8FF', '#8A72F6', '#5B45DE'],
  mint: ['#A8EED8', '#45C9A2', '#1F9C7B'],
  amber: ['#FFE19A', '#FFB84D', '#F08A1C'],
};

/** 레퍼런스에 없는 카테고리용: 같은 톤의 광택 3D 스타일 SVG */
const SHAPES: Partial<Record<AppCategoryId, { tone: Tone; draw: (fill: string, light: string) => ReactElement }>> = {
  travel_booking: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M30 8c3-1.5 6 .5 6 3.6V24l16 9.5c1.2.7 1.9 2 1.9 3.4v2.1L36 34v10l5.5 4.2v4L32 49.8 22.5 52.2v-4L28 44V34l-17.9 5V36.9c0-1.4.7-2.7 1.9-3.4L28 24V11.6c0-1.6.8-3 2-3.6z" fill={f} />
        <Path d="M30.5 10.5c1.5-.6 3 .5 3 2.2v10.5" stroke={l} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.8} />
      </G>
    ),
  },
  messaging_social: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M32 9c13 0 23 8.4 23 19s-10 19-23 19c-2.6 0-5-.3-7.3-.9L14 51l2.6-9.3C11.9 38.3 9 33.5 9 28 9 17.4 19 9 32 9z" fill={f} />
        <Circle cx={22} cy={28} r={3.2} fill="#FFFFFF" />
        <Circle cx={32} cy={28} r={3.2} fill="#FFFFFF" />
        <Circle cx={42} cy={28} r={3.2} fill="#FFFFFF" />
        <Path d="M17 18c3.5-3.6 8.6-5.6 14-5.8" stroke={l} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.75} />
      </G>
    ),
  },
  games: {
    tone: 'violet',
    draw: (f, l) => (
      <G>
        <Path d="M19 17h26c7 0 11.5 6 12.6 14.5l1.3 9.6c.8 6-5.8 9.5-10 5.3L44 41.5H20l-4.9 4.9c-4.2 4.2-10.8.7-10-5.3l1.3-9.6C7.5 23 12 17 19 17z" fill={f} />
        <Rect x={17} y={26} width={3.6} height={11} rx={1.8} fill="#FFFFFF" />
        <Rect x={13.3} y={29.7} width={11} height={3.6} rx={1.8} fill="#FFFFFF" />
        <Circle cx={43} cy={27.5} r={2.8} fill="#FFFFFF" />
        <Circle cx={49} cy={33.5} r={2.8} fill="#FFFFFF" />
        <Path d="M16 20.5h14" stroke={l} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
      </G>
    ),
  },
  finance_payment: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Rect x={8} y={15} width={48} height={33} rx={7} fill={f} />
        <Rect x={8} y={22} width={48} height={6} fill="#26307A" opacity={0.45} />
        <Rect x={14} y={36} width={14} height={5} rx={2.5} fill="#FFFFFF" opacity={0.9} />
        <Path d="M13 18.5h20" stroke={l} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      </G>
    ),
  },
  bills_tax: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M15 7h34a3 3 0 0 1 3 3v45l-5.5-3.5L41 55l-5.5-3.5L30 55l-5.5-3.5L19 55l-5.5-3.5L12 52.5V10a3 3 0 0 1 3-3z" fill={f} />
        <Rect x={19} y={17} width={26} height={3.6} rx={1.8} fill="#FFFFFF" />
        <Rect x={19} y={25} width={19} height={3.6} rx={1.8} fill="#FFFFFF" opacity={0.85} />
        <Rect x={19} y={33} width={22} height={3.6} rx={1.8} fill="#FFFFFF" opacity={0.85} />
        <Circle cx={42} cy={42} r={5} fill="#FFFFFF" />
        <Path d="M40 42l1.5 1.5 3-3" stroke="#3157E0" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M16 11h10" stroke={l} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      </G>
    ),
  },
  food_dining: {
    tone: 'pink',
    draw: (f, l) => (
      <G>
        <Path d="M12 20h32v17c0 8.3-6.7 15-15 15h-2c-8.3 0-15-6.7-15-15z" fill={f} />
        <Path d="M44 25h3.5a7 7 0 0 1 0 14H43" stroke={f} strokeWidth={5} fill="none" />
        <Path d="M20 8c-2 3 2 4 0 7M28 8c-2 3 2 4 0 7M36 8c-2 3 2 4 0 7" stroke="#C7D2FF" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d="M16 24v10" stroke={l} strokeWidth={2.6} strokeLinecap="round" opacity={0.8} />
      </G>
    ),
  },
  tickets_culture: {
    tone: 'pink',
    draw: (f, l) => (
      <G>
        <Path d="M8 18a4 4 0 0 1 4-4h40a4 4 0 0 1 4 4v6a6 6 0 0 0 0 12v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-6a6 6 0 0 0 0-12z" fill={f} />
        <Path d="M40 17v26" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="3 3" opacity={0.85} />
        <Path d="M21 25l2 4.3 4.6.6-3.4 3.2.9 4.6-4.1-2.3-4.1 2.3.9-4.6-3.4-3.2 4.6-.6z" fill="#FFFFFF" />
        <Path d="M13 18h22" stroke={l} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      </G>
    ),
  },
  music_audio: {
    tone: 'violet',
    draw: (f, l) => (
      <G>
        <Path d="M24 13l26-6v30.5a7.5 7.5 0 1 1-5-7.1V17.4l-16 3.7v22.4a7.5 7.5 0 1 1-5-7.1z" fill={f} />
        <Path d="M27 15.5l19-4.4" stroke={l} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      </G>
    ),
  },
  news_reading: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M32 15c-5-4-13-5.5-22-4.5v36c9-1 17 .5 22 4.5 5-4 13-5.5 22-4.5v-36c-9-1-17 .5-22 4.5z" fill={f} />
        <Path d="M32 15v36" stroke="#26307A" strokeWidth={2} opacity={0.35} />
        <Path d="M15 19c4-.3 8 .3 11.5 2M15 26c4-.3 8 .3 11.5 2M37.5 21c3.5-1.7 7.5-2.3 11.5-2" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.9} />
        <Path d="M12 14c5-.4 10 .4 14 2.2" stroke={l} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.6} />
      </G>
    ),
  },
  health_fitness: {
    tone: 'pink',
    draw: (f, l) => (
      <G>
        <Path d="M32 52S9 39 9 23.5C9 16 14.8 10 22 10c4.4 0 7.8 2.2 10 5.6C34.2 12.2 37.6 10 42 10c7.2 0 13 6 13 13.5C55 39 32 52 32 52z" fill={f} />
        <Path d="M15 28h7l3-6 5 12 3-6h8" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M15 17c1.8-2.5 4.5-3.8 7.5-3.8" stroke={l} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.8} />
      </G>
    ),
  },
  productivity: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M24 16v-3a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v3" stroke={f} strokeWidth={4} fill="none" />
        <Rect x={8} y={16} width={48} height={34} rx={7} fill={f} />
        <Rect x={8} y={29} width={48} height={4} fill="#26307A" opacity={0.3} />
        <Rect x={28} y={27} width={8} height={8} rx={2} fill="#FFFFFF" />
        <Path d="M13 20h22" stroke={l} strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
      </G>
    ),
  },
  education: {
    tone: 'violet',
    draw: (f, l) => (
      <G>
        <Path d="M32 10l26 11-26 11L6 21z" fill={f} />
        <Path d="M16 26v11c0 4 7.2 8 16 8s16-4 16-8V26l-16 7z" fill={f} opacity={0.85} />
        <Path d="M52 23v14" stroke="#FFC94D" strokeWidth={2.6} strokeLinecap="round" />
        <Circle cx={52} cy={39} r={3} fill="#FFC94D" />
        <Path d="M18 19l14-6" stroke={l} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      </G>
    ),
  },
  photo_camera: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M10 22a5 5 0 0 1 5-5h6l3.5-5h15l3.5 5h6a5 5 0 0 1 5 5v21a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5z" fill={f} />
        <Circle cx={32} cy={32} r={10} fill="#FFFFFF" />
        <Circle cx={32} cy={32} r={6} fill="#3157E0" />
        <Circle cx={30} cy={30} r={2} fill="#FFFFFF" opacity={0.8} />
        <Path d="M14 21h6" stroke={l} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      </G>
    ),
  },
  system_tools: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Path d="M46.5 9.5a12 12 0 0 0-14.7 15.3L11 45.6a5.5 5.5 0 0 0 7.8 7.8l20.8-20.8A12 12 0 0 0 54.9 18l-7.2 7.2-6.4-1.7-1.7-6.4z" fill={f} />
        <Circle cx={15} cy={49} r={2.4} fill="#FFFFFF" />
        <Path d="M35 15.5c2-2.3 5-3.5 8-3.4" stroke={l} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.8} />
      </G>
    ),
  },
  other: {
    tone: 'blue',
    draw: (f, l) => (
      <G>
        <Rect x={9} y={9} width={20} height={20} rx={6} fill={f} />
        <Rect x={35} y={9} width={20} height={20} rx={6} fill={f} opacity={0.85} />
        <Rect x={9} y={35} width={20} height={20} rx={6} fill={f} opacity={0.85} />
        <Rect x={35} y={35} width={20} height={20} rx={6} fill={f} />
        <Path d="M13 13h8" stroke={l} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      </G>
    ),
  },
};

export function CategoryIcon({ id, size = 64 }: { id: AppCategoryId; size?: number }) {
  const gid = useSvgId('ci');
  const png = EXTRACTED[id];
  if (png) return <Image source={png} style={{ width: size, height: size }} contentFit="contain" />;
  const shape = SHAPES[id] ?? SHAPES.other!;
  const [top, mid, bottom] = TONES[shape.tone];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id={gid} x1="0.2" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="0.45" stopColor={mid} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={32} cy={58} rx={20} ry={3.2} fill={bottom} opacity={0.18} />
      {shape.draw(`url(#${gid})`, '#FFFFFF')}
    </Svg>
  );
}
