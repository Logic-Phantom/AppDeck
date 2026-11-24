import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppListRow } from '@/components/AppListRow';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { EmptyState } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts, type } from '@/design-system/tokens';
import { effectiveCategory, type AppEntry } from '@/domain/apps/app.types';
import { CATEGORY_CATALOG } from '@/domain/categories/category.catalog';
import { matchIntent } from '@/domain/search/intent-matcher';
import { searchApps } from '@/domain/search/search-engine';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

type Sort = 'name' | 'recent';

/** 검색 탭 = 앱 보관함: 실시간 검색 + 카테고리 + 내 앱 전체 목록 */
export default function SearchTab() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps, capabilities, scanning } = useAppDeck();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('name');

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of visibleApps) counts.set(effectiveCategory(a), (counts.get(effectiveCategory(a)) ?? 0) + 1);
    return CATEGORY_CATALOG.filter((cat) => counts.has(cat.id)).map((cat) => ({ ...cat, count: counts.get(cat.id) ?? 0 }));
  }, [visibleApps]);

  const list: AppEntry[] = useMemo(() => {
    if (query.trim()) return searchApps(visibleApps, query).hits.map((h) => h.app);
    if (sort === 'recent') {
      return [...visibleApps].sort((a, b) => (b.lastOpenedFromAppDeckAt ?? '').localeCompare(a.lastOpenedFromAppDeckAt ?? ''));
    }
    return visibleApps;
  }, [visibleApps, query, sort]);

  const intent = query.trim() ? matchIntent(query) : null;

  const header = (
    <View>
      <View style={styles.titleRow}>
        <Text style={[type.title, { color: c.text }]} accessibilityRole="header">
          검색
        </Text>
        {capabilities.platform !== 'android' || !capabilities.canEnumerateInstalledApps ? (
          <Pressable onPress={() => router.push('/add-app')} hitSlop={10} accessibilityRole="button" accessibilityLabel="앱 직접 등록">
            <Icon name="plus" size={22} color={c.text} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.pad}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onSubmit={() => query.trim() && router.push({ pathname: '/results', params: { q: query.trim() } })}
          placeholder="앱 이름이나 할 일을 검색하세요"
          trailing={query ? { icon: 'close', label: '검색어 지우기', onPress: () => setQuery('') } : null}
        />
      </View>

      {intent ? (
        <Pressable
          onPress={() => router.push({ pathname: '/results', params: { intent: intent.id } })}
          style={[styles.intent, { backgroundColor: c.accentSoft }]}
          accessibilityRole="button"
        >
          <Text style={[styles.intentText, { color: c.accent }]}>‘{intent.label}’ 목적 검색 결과 보기</Text>
          <Icon name="chevron-right" size={14} color={c.accent} strokeWidth={2} />
        </Pressable>
      ) : null}

      {!query.trim() && categories.length ? (
        <View style={styles.section}>
          <Text style={[type.section, styles.sectionTitle, { color: c.text }]}>카테고리</Text>
          <View style={styles.chips}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => router.push({ pathname: '/results', params: { category: cat.id } })}
                style={({ pressed }) => [styles.chip, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted }]}
                accessibilityRole="button"
                accessibilityLabel={`${cat.name} ${cat.count}개`}
              >
                <Text style={[styles.chipText, { color: c.text }]}>{cat.name}</Text>
                <Text style={[styles.chipCount, { color: c.textTertiary }]}>{cat.count}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.listHead, styles.pad]}>
        <Text style={[type.section, { color: c.text }]}>{query.trim() ? `검색 결과 ${list.length}개` : `내 앱 ${list.length}개`}</Text>
        {!query.trim() ? (
          <View style={styles.sorts}>
            {(['name', 'recent'] as Sort[]).map((s) => (
              <Pressable key={s} onPress={() => setSort(s)} hitSlop={6} accessibilityRole="button" accessibilityState={{ selected: sort === s }}>
                <Text style={[styles.sort, { color: sort === s ? c.text : c.textTertiary, fontFamily: sort === s ? fonts.bold : fonts.medium }]}>
                  {s === 'name' ? '이름순' : '최근 실행순'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <AppListRow app={item} />}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={14}
        windowSize={9}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          scanning ? (
            <EmptyState title="앱 목록을 확인하고 있어요" />
          ) : (
            <EmptyState
              title={query ? '일치하는 앱이 없어요' : '아직 앱이 없어요'}
              body={query ? '다른 이름이나 할 일로 검색해 보세요.' : capabilities.limitationNote}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  pad: { paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  intent: { marginHorizontal: 20, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intentText: { fontFamily: fonts.semibold, fontSize: 13.5 },
  section: { marginTop: 22, paddingHorizontal: 20 },
  sectionTitle: { marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 12, height: 36 },
  chipText: { fontFamily: fonts.semibold, fontSize: 13 },
  chipCount: { fontFamily: fonts.medium, fontSize: 12 },
  listHead: { marginTop: 24, marginBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sorts: { flexDirection: 'row', gap: 12 },
  sort: { fontSize: 12.5 },
});
