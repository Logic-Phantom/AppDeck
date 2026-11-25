import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useColors } from './theme';
import { cardShadow } from './tokens';

/** SVG id는 웹 DOM에서 전역이라 인스턴스마다 고유해야 한다 */
export function useSvgId(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** 앱덱 심볼 v2: 두 개의 둥근 획으로 만든 Λ (블루 → 바이올렛 그라데이션) */
export function BrandMark({ size = 48 }: { size?: number }) {
  const id = useSvgId('bm');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${id}r`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#3A74F2" />
          <Stop offset="0.7" stopColor="#3F50E6" />
          <Stop offset="1" stopColor="#8A5CF6" />
        </LinearGradient>
        <LinearGradient id={`${id}l`} x1="0.6" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor="#7CC0FF" />
          <Stop offset="0.45" stopColor="#3D86F7" />
          <Stop offset="1" stopColor="#2457E8" />
        </LinearGradient>
      </Defs>
      {/* 오른쪽 획 */}
      <Path d="M50 22 L78 76" stroke={`url(#${id}r)`} strokeWidth={21} strokeLinecap="round" />
      {/* 왼쪽 획 */}
      <Path d="M50 22 L22 76" stroke={`url(#${id}l)`} strokeWidth={21} strokeLinecap="round" />
    </Svg>
  );
}

export function BrandTile({ size = 80 }: { size?: number }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.tile,
        cardShadow(c, 2),
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: c.brandTile, borderColor: c.glassBorder },
      ]}
    >
      <BrandMark size={size * 0.72} />
    </View>
  );
}

/** 화면 전체 배경: 라벤더 화이트 세로 그라데이션 */
export function Backdrop({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const id = useSvgId('bd');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.bgTop} />
            <Stop offset="1" stopColor={c.bgBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** 하단 블루 물결 (검색 결과·브랜드 카드) */
export function BottomWave({ width, height, intensity = 1 }: { width: number; height: number; intensity?: number }) {
  const c = useColors();
  const id = useSvgId('wv');
  return (
    <Svg width={width} height={height} viewBox="0 0 400 200" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.waveA} stopOpacity={0.15 * intensity} />
          <Stop offset="1" stopColor={c.waveB} stopOpacity={0.75 * intensity} />
        </LinearGradient>
        <LinearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.7} />
        </LinearGradient>
      </Defs>
      <Path d="M0 150C100 120 190 60 290 70 340 75 375 60 400 40V200H0z" fill={`url(#${id}a)`} />
      <Path d="M40 200C130 150 230 110 400 120" stroke={`url(#${id}b)`} strokeWidth={2} fill="none" />
      <Path d="M0 180C120 150 250 130 400 150" stroke={`url(#${id}b)`} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

/** 브랜드 카드 배경: 대각선 글래스 리본 */
export function RibbonBackdrop({ width, height }: { width: number; height: number }) {
  const c = useColors();
  const id = useSvgId('rb');
  return (
    <Svg width={width} height={height} viewBox="0 0 300 600" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.bgTop} />
          <Stop offset="1" stopColor={c.scheme === 'dark' ? '#151A3A' : '#E3E8FF'} />
        </LinearGradient>
        <LinearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={c.scheme === 'dark' ? 0.05 : 0.9} />
          <Stop offset="1" stopColor={c.waveA} stopOpacity={0.5} />
        </LinearGradient>
        <RadialGradient id={`${id}g`} cx="0.85" cy="0.95" r="0.6">
          <Stop offset="0" stopColor={c.waveB} stopOpacity={0.85} />
          <Stop offset="1" stopColor={c.waveB} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="300" height="600" fill={`url(#${id}bg)`} />
      <Path d="M-20 120C80 60 180 40 320 0V180C200 200 90 240-20 330z" fill={`url(#${id}r)`} />
      <Path d="M-20 420C100 380 200 330 320 260V600H-20z" fill={`url(#${id}g)`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

