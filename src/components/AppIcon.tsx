import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/design-system/brand';
import { useColors } from '@/design-system/theme';
import { cardShadow, fonts } from '@/design-system/tokens';
import type { AppEntry } from '@/domain/apps/app.types';
import { DEMO_ACCENTS } from '@/platform/web/demo-apps';

const FALLBACK_COLORS = ['#4561F5', '#22B573', '#F0485A', '#F5A524', '#8B5CF6', '#0EA5E9', '#1F2758'];

function hashColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

const LIGHT_BG = new Set(['#F7D300', '#FFC800', '#FEE500', '#FFD400', '#FFFFFF']);

/**
 * 앱 아이콘. 실기기에서는 OS에서 읽은 원본 아이콘(캐시 PNG)을 쓴다.
 * 아이콘이 없으면(직접 등록·웹 데모·추출 실패) 이름 모노그램을 그린다. 서비스 로고는 복제하지 않는다.
 */
export function AppIcon({ app, size = 48 }: { app: Pick<AppEntry, 'iconUri' | 'displayName' | 'packageName' | 'accentColor'>; size?: number }) {
  const c = useColors();
  const [failed, setFailed] = useState(false);
  const r = size * 0.27;
  const shadow = cardShadow(c);
  if (app.iconUri && !failed) {
    return (
      <View style={[{ width: size, height: size, borderRadius: r }, shadow]}>
        <Image
          source={{ uri: app.iconUri }}
          style={{ width: size, height: size, borderRadius: r }}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }
  const demo = app.packageName ? DEMO_ACCENTS[app.packageName] : undefined;
  const bg = demo?.color ?? app.accentColor ?? hashColor(app.displayName);
  const label = demo?.monogram ?? app.displayName.trim().slice(0, 1);
  if (!label) {
    return (
      <View style={[styles.box, shadow, { width: size, height: size, borderRadius: r, backgroundColor: '#FFFFFF' }]}>
        <BrandMark size={size * 0.7} />
      </View>
    );
  }
  const fontSize = label.length >= 4 ? size * 0.24 : label.length === 3 ? size * 0.27 : label.length === 2 ? size * 0.32 : size * 0.42;
  return (
    <View style={[styles.box, shadow, { width: size, height: size, borderRadius: r, backgroundColor: bg }]}>
      <Text style={[styles.mono, { fontSize, color: LIGHT_BG.has(bg) ? '#3A2A00' : '#FFFFFF' }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  mono: { fontFamily: fonts.bold, letterSpacing: -0.5 },
});
