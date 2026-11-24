import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useColors } from './theme';
import { radius } from './tokens';

/** 앱덱 심볼: 두꺼운 Λ 형태의 "A" */
export function BrandMark({ size = 40, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M20.6 7.6a3.9 3.9 0 0 1 6.8 0l15.3 27.6a2.6 2.6 0 0 1-2.3 3.9h-6.2a2.6 2.6 0 0 1-2.3-1.4L24 21.4l-7.9 16.3a2.6 2.6 0 0 1-2.3 1.4H7.6a2.6 2.6 0 0 1-2.3-3.9z"
        fill={color}
      />
    </Svg>
  );
}

export function BrandTile({ size = 80 }: { size?: number }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: c.brandTile,
          shadowColor: c.scheme === 'dark' ? '#000' : '#2A3A8A',
        },
      ]}
    >
      <BrandMark size={size * 0.58} color={c.brandMark} />
    </View>
  );
}

/** 스플래시 하단의 블루 그라데이션 물결 */
export function SplashWave({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 260" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="wave1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#C9D3FF" stopOpacity="0.2" />
          <Stop offset="1" stopColor="#6D7BFF" stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="wave2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8FA2FF" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#3D4FE8" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Path d="M0 210C90 200 170 150 250 95 310 55 360 40 400 40V260H0z" fill="url(#wave1)" />
      <Path d="M90 260C170 230 240 180 300 130 340 100 370 90 400 88V260z" fill="url(#wave2)" />
    </Svg>
  );
}

/** 정리 완료 일러스트: 연보라 폴더 + 체크 배지 */
export function CleanupDoneIllustration({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DCE2FF" />
          <Stop offset="1" stopColor="#C5CEFA" />
        </LinearGradient>
        <LinearGradient id="folderFront" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#EEF1FF" />
          <Stop offset="1" stopColor="#C9D1FB" />
        </LinearGradient>
      </Defs>
      <G>
        <Path d="M18 30a6 6 0 0 1 6-6h22l8 8h40a6 6 0 0 1 6 6v8H18z" fill="url(#folderBack)" />
        <Rect x={14} y={40} width={92} height={58} rx={9} fill="url(#folderFront)" />
        <Rect x={44} y={60} width={14} height={4} rx={2} fill="#B5BEF0" />
        <Path d="M84 22l4 4 8-9" stroke="#5B72F2" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Circle cx={86} cy={88} r={17} fill="#1A1D29" />
        <Path d="M78.5 88l5 5 10-10.5" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderRadius: radius.xl,
  },
});
