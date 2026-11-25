import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { GlassCard, PillTabs } from '@/components/ui';
import { CategoryIcon } from '@/design-system/CategoryIcon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { effectiveCategory } from '@/domain/apps/app.types';
import { CATEGORY_CATALOG, CATEGORY_GROUPS } from '@/domain/categories/category.catalog';
import type { CategoryGroupId } from '@/domain/categories/category.types';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

type GroupTab = CategoryGroupId | 'all';

export default function CategoriesScreen() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps } = useAppDeck();
  const [group, setGroup] = useState<GroupTab>('all');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of visibleApps) m.set(effectiveCategory(a), (m.get(effectiveCategory(a)) ?? 0) + 1);
    return m;
  }, [visibleApps]);

  // 'other'(기타)는 앱이 있을 때만 보여 준다
  const list = CATEGORY_CATALOG.filter((cat) => (group === 'all' || cat.group === group) && (cat.id !== 'other' || counts.has('other')));

  return (
    <Screen>
      <ScreenHeader title="카테고리" centered />
      <View style={styles.tabs}>
        <PillTabs<GroupTab> tabs={[{ key: 'all', label: '전체' }, ...CATEGORY_GROUPS.map((g) => ({ key: g.id, label: g.name }))]} value={group} onChange={setGroup} />
      </View>
      <Text style={[styles.hint, { color: c.textTertiary }]}>카테고리를 열고 ‘편집’을 누르면 앱을 넣거나 뺄 수 있어요.</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {list.map((cat) => {
          const count = counts.get(cat.id) ?? 0;
          return (
            <GlassCard
              key={cat.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/results', params: { category: cat.id } })}
              accessibilityLabel={`${cat.name}, 앱 ${count}개`}
            >
              <View style={styles.iconWrap}>
                <CategoryIcon id={cat.id} size={74} />
              </View>
              <Text style={[styles.name, { color: c.text }]}>{cat.name}</Text>
              <Text style={[styles.tagline, { color: c.textSecondary }]} numberOfLines={1}>
                {cat.tagline}
              </Text>
              {count > 0 ? (
                <View style={[styles.count, { backgroundColor: c.accentSoft }]}>
                  <Text style={[styles.countText, { color: c.icon }]}>{count}</Text>
                </View>
              ) : null}
            </GlassCard>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: 10 },
  hint: { fontFamily: fonts.medium, fontSize: 12, paddingHorizontal: 22, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14, paddingHorizontal: 18, paddingBottom: 32 },
  card: { width: '48%', alignItems: 'center', paddingTop: 18, paddingBottom: 18, paddingHorizontal: 10, borderRadius: 22 },
  iconWrap: { height: 80, justifyContent: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 15.5, marginTop: 8, letterSpacing: -0.4 },
  tagline: { fontFamily: fonts.medium, fontSize: 12, marginTop: 5 },
  count: { position: 'absolute', top: 12, right: 12, minWidth: 24, height: 22, borderRadius: 11, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.bold, fontSize: 11.5 },
});
