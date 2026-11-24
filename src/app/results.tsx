import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppListRow } from '@/components/AppListRow';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { EmptyState, SoftButton } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { SPARKLE_ICON } from '@/design-system/purpose-icons';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { effectiveCategory } from '@/domain/apps/app.types';
import { getCategory, isCategoryId } from '@/domain/categories/category.catalog';
import type { AppCategoryId } from '@/domain/categories/category.types';
import { findPurposeIntent } from '@/domain/search/intent-matcher';
import { searchApps } from '@/domain/search/search-engine';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const COLLAPSED_COUNT = 4;

export default function ResultsScreen() {
  const c = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; intent?: string; category?: string }>();
  const { visibleApps, capabilities } = useAppDeck();
  const presetIntent = params.intent ? findPurposeIntent(params.intent) : undefined;
  const presetCategory = isCategoryId(params.category) ? params.category : null;
  const [query, setQuery] = useState(
    params.q ?? presetIntent?.label ?? (presetCategory ? getCategory(presetCategory).name : ''),
  );
  const [tab, setTab] = useState<AppCategoryId | 'all'>('all');
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => {
    if (presetCategory && query === getCategory(presetCategory).name) {
      const hits = visibleApps.filter((a) => effectiveCategory(a) === presetCategory).map((app) => ({ app, kind: 'category' as const, score: 0 }));
      return { hits, matchedCategories: [presetCategory] as AppCategoryId[], intent: null };
    }
    return searchApps(visibleApps, query);
  }, [visibleApps, query, presetCategory]);

  // 탭: 전체 + 목적에 연결된 카테고리(결과가 없어도 보여 주어 "없음"을 명확히 함)
  const tabs: { key: AppCategoryId | 'all'; label: string }[] = [
    { key: 'all', label: '전체' },
    ...(result.matchedCategories.length > 1 ? result.matchedCategories.map((id) => ({ key: id, label: getCategory(id).shortName })) : []),
  ];
  const filtered = tab === 'all' ? result.hits : result.hits.filter((h) => effectiveCategory(h.app) === tab);
  const shown = expanded ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const isDirections = result.intent?.id === 'directions';

  return (
    <Screen tab="search">
      <View style={styles.top}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} accessibilityRole="button" accessibilityLabel="뒤로 가기">
          <Icon name="chevron-left" size={22} color={c.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.field}>
          <SearchField
            compact
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              setTab('all');
              setExpanded(false);
            }}
            placeholder="앱 이름이나 할 일을 검색하세요"
            trailing={query ? { icon: 'close', label: '검색어 지우기', onPress: () => setQuery('') } : null}
          />
        </View>
      </View>

      <View style={[styles.tabs, { borderBottomColor: c.hairline }]}>
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                setTab(t.key);
                setExpanded(false);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && { borderBottomColor: c.text }]}
            >
              <Text style={[styles.tabText, { color: active ? c.text : c.textTertiary, fontFamily: active ? fonts.bold : fonts.medium }]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {shown.map((h) => (
          <AppListRow key={h.app.id} app={h.app} />
        ))}

        {filtered.length === 0 ? (
          <EmptyState
            title={query ? '이 카테고리에 등록된 앱이 없어요' : '검색어를 입력해 주세요'}
            body={
              query
                ? capabilities.canEnumerateInstalledApps
                  ? '기기에서 확인된 앱 중에 일치하는 앱이 없어요. 앱의 분류를 바꾸거나 별칭을 추가해 보세요.'
                  : '직접 등록한 앱 중에 일치하는 앱이 없어요.'
                : undefined
            }
          />
        ) : null}

        {!expanded && filtered.length > COLLAPSED_COUNT ? (
          <Pressable onPress={() => setExpanded(true)} style={styles.more} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.moreText, { color: c.text }]}>더보기</Text>
            <Icon name="chevron-right" size={14} color={c.text} strokeWidth={2} />
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => router.push(isDirections ? '/parking' : '/add-app')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.card, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted }]}
        >
          <Text style={[styles.cardText, { color: c.text }]}>
            {isDirections ? '주차한 위치를\n잊지 않게 기록해 두세요' : '찾는 앱이 없나요?\n직접 등록해 두세요'}
          </Text>
          {isDirections ? (
            <View style={[styles.cardBubble, { backgroundColor: c.surface }]}>
              <Icon name="car" size={30} color={c.accent} />
            </View>
          ) : (
            <Image source={SPARKLE_ICON} style={styles.cardImage} contentFit="contain" />
          )}
        </Pressable>

        {query && filtered.length === 0 && !capabilities.canEnumerateInstalledApps ? (
          <View style={styles.addWrap}>
            <SoftButton label="앱 직접 등록하기" onPress={() => router.push('/add-app')} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  field: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 22, borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14 },
  list: { paddingTop: 8, paddingBottom: 24 },
  more: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 4, paddingVertical: 14 },
  moreText: { fontFamily: fonts.semibold, fontSize: 13.5 },
  card: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardText: { fontFamily: fonts.bold, fontSize: 14.5, lineHeight: 21, letterSpacing: -0.3 },
  cardImage: { width: 54, height: 54 },
  cardBubble: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  addWrap: { paddingHorizontal: 20, marginTop: 12 },
});
