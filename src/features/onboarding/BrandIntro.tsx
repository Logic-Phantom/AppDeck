import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BrandMark, useSvgId } from '@/design-system/brand';
import { SPLASH_CITY } from '@/design-system/purpose-icons';
import { fonts } from '@/design-system/tokens';

/** 레퍼런스 v2 첫 화면: 하늘 그라데이션 + 도시 일러스트 + 로고 (짧게 보여 주고 사라짐) */
export function BrandIntro({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(1));
  const id = useSvgId('sky');
  const artHeight = Math.min(height * 0.5, width * 0.74);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => onDone());
    }, 1100);
    return () => clearTimeout(t);
  }, [ready, opacity, onDone]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]} accessibilityLabel="앱덱 시작 화면">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6E9BF4" />
            <Stop offset="0.35" stopColor="#AFC6F6" />
            <Stop offset="0.6" stopColor="#E3E5F7" />
            <Stop offset="1" stopColor="#D8DDF4" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill={`url(#${id})`} />
      </Svg>
      <Image source={SPLASH_CITY} style={[styles.city, { width, height: artHeight }]} contentFit="cover" />
      {/* 도시 일러스트 윗부분을 하늘색으로 자연스럽게 이어 준다 */}
      <Svg width={width} height={artHeight * 0.45} style={[styles.fade, { bottom: artHeight * 0.55 }]}>
        <Defs>
          <LinearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E3E5F7" stopOpacity={1} />
            <Stop offset="1" stopColor="#E3E5F7" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={artHeight * 0.45} fill={`url(#${id}f)`} />
      </Svg>
      <View style={[styles.center, { paddingBottom: artHeight * 0.55 }]}>
        <BrandMark size={96} />
        <Text style={styles.title}>APPDECK</Text>
        <Text style={styles.sub}>당신의 모든 앱을{'\n'}더 가깝게</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100, backgroundColor: '#D8DDF4' },
  city: { position: 'absolute', left: 0, bottom: 0 },
  fade: { position: 'absolute', left: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 30, letterSpacing: 0.6, marginTop: 10, color: '#141A3A' },
  sub: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, marginTop: 12, color: '#3C4466', textAlign: 'center' },
});
