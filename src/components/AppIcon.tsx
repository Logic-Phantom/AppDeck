import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/design-system/brand';
import type { AppEntry } from '@/domain/apps/app.types';
import { DEMO_ACCENTS } from '@/platform/web/demo-apps';
import { fonts } from '@/design-system/tokens';

const FALLBACK_COLORS = ['#5B72F2', '#22B573', '#F0484E', '#F5A524', '#8B5CF6', '#0EA5E9', '#14161C'];

function hashColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

/**
 * 앱 아이콘. 실기기에서는 OS에서 읽은 원본 아이콘(캐시 PNG)을 쓴다.
 * 아이콘이 없으면(직접 등록·웹 데모·추출 실패) 이름 모노그램을 그린다. 서비스 로고는 복제하지 않는다.
 */
export function AppIcon({ app, size = 44 }: { app: Pick<AppEntry, 'iconUri' | 'displayName' | 'packageName' | 'accentColor'>; size?: number }) {
  const [failed, setFailed] = useState(false);
  const r = size * 0.26;
  if (app.iconUri && !failed) {
    return (
      <Image
        source={{ uri: app.iconUri }}
        style={{ width: size, height: size, borderRadius: r }}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  const demo = app.packageName ? DEMO_ACCENTS[app.packageName] : undefined;
  const bg = demo?.color ?? app.accentColor ?? hashColor(app.displayName);
  const label = demo?.monogram ?? app.displayName.trim().slice(0, 1);
  const light = bg === '#F7D300' || bg === '#FFC800' || bg === '#FEE500';
  if (!label) {
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: r, backgroundColor: '#F1F2F6' }]}>
        <BrandMark size={size * 0.55} color="#111317" />
      </View>
    );
  }
  const fontSize = label.length >= 4 ? size * 0.24 : label.length === 3 ? size * 0.27 : label.length === 2 ? size * 0.32 : size * 0.42;
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: r, backgroundColor: bg }]}>
      <Text style={[styles.mono, { fontSize, color: light ? '#3A2A00' : '#FFFFFF' }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  mono: { fontFamily: fonts.bold, letterSpacing: -0.5 },
});
