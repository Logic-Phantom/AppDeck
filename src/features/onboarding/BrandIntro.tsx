import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BrandTile, SplashWave } from '@/design-system/brand';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

/** 레퍼런스 8번째 화면: 브랜드 인트로 (짧게 보여 주고 사라짐) */
export function BrandIntro({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const c = useColors();
  const { width, height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => onDone());
    }, 900);
    return () => clearTimeout(t);
  }, [ready, opacity, onDone]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity, backgroundColor: c.splashTop }]} accessibilityLabel="앱덱 시작 화면">
      <View style={styles.center}>
        <BrandTile size={84} />
        <Text style={[styles.title, { color: c.text }]}>APPDECK</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>더 스마트한 앱 생활의 시작</Text>
      </View>
      <View style={styles.wave} pointerEvents="none">
        <SplashWave width={width} height={Math.min(300, height * 0.34)} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  title: { fontFamily: fonts.bold, fontSize: 34, letterSpacing: 0.5, marginTop: 26 },
  sub: { fontFamily: fonts.medium, fontSize: 15.5, marginTop: 10, letterSpacing: -0.2 },
  wave: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
