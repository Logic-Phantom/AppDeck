import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useColors } from './theme';

export function ProgressRing({ size = 120, stroke = 9, percent }: { size?: number; stroke?: number; percent: number }) {
  const c = useColors();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.ringEnd} />
          <Stop offset="1" stopColor={c.ringStart} />
        </LinearGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.ringTrack} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#ring)"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - p / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}
