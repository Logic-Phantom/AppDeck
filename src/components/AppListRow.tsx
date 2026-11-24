import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { effectiveCategory, needsCategoryReview, type AppEntry } from '@/domain/apps/app.types';
import { getCategory } from '@/domain/categories/category.catalog';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

import { AppIcon } from './AppIcon';
import { PillButton } from './ui';

/** 검색 결과 행: 아이콘 · 이름 · 카테고리 · "열기" */
export function AppListRow({ app }: { app: AppEntry }) {
  const c = useColors();
  const router = useRouter();
  const { launchApp } = useAppDeck();
  const review = needsCategoryReview(app);
  const subtitle = review ? '분류 확인 필요' : getCategory(effectiveCategory(app)).name;
  const badge = app.source === 'manual' ? '직접 등록' : app.isSystemApp ? '시스템' : null;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push({ pathname: '/app/[id]', params: { id: app.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${app.displayName}, ${subtitle}. 앱 정보 보기`}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.6 }]}
      >
      <AppIcon app={app} size={46} />
      <View style={styles.texts}>
        <View style={styles.nameLine}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {app.displayName}
          </Text>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: c.surfaceMuted }]}>
              <Text style={[styles.badgeText, { color: c.textSecondary }]}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.sub, { color: review ? c.accent : c.textTertiary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      </Pressable>
      <PillButton label="열기" accessibilityLabel={`${app.displayName} 열기`} onPress={() => void launchApp(app)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 11 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  texts: { flex: 1, gap: 3 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: -0.3, flexShrink: 1 },
  sub: { fontFamily: fonts.medium, fontSize: 12.5 },
  badge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { fontFamily: fonts.semibold, fontSize: 10 },
});
