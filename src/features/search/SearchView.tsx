import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppListRow } from '@/components/AppListRow';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { EmptyState, GlassCard, PillButton, PillTabs, SoftButton } from '@/components/ui';
import { BottomWave } from '@/design-system/brand';
import { CategoryIcon } from '@/design-system/CategoryIcon';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { effectiveCategory, type AppEntry } from '@/domain/apps/app.types';
import { CATEGORY_CATALOG, getCategory } from '@/domain/categories/category.catalog';
import type { AppCategoryId } from '@/domain/categories/category.types';
import { findPurposeIntent } from '@/domain/search/intent-matcher';
import { searchApps } from '@/domain/search/search-engine';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const COLLAPSED_COUNT = 4;

type Row = { kind: 'header'; key: string; title: string } | { kind: 'app'; key: string; app: AppEntry };

interface Props {
  mode: 'tab' | 'results';
  initialQuery?: string;
  intentId?: string;
  categoryId?: AppCategoryId | null;
}

/** 레퍼런스 v2 검색 화면: 검색창 + 취소, 알약 탭(전체/세부 분류), 분류별 섹션, 더보기, 하단 물결 */
export function SearchView({ mode, initialQuery, intentId, categoryId }: Props) {
  const c = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { visibleApps, capabilities } = useAppDeck();
  const presetIntent = intentId ? findPurposeIntent(intentId) : undefined;
  const presetLabel = categoryId ? getCategory(categoryId).name : (presetIntent?.label ?? '');
  const [query, setQuery] = useState(initialQuery ?? presetLabel);
  const [tab, setTab] = useState<AppCategoryId | 'all'>('all');
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => {
    if (categoryId && query === presetLabel) {
      const hits = visibleApps.filter((a) => effectiveCategory(a) === categoryId).map((app) => ({ app }));
      return { hits, categories: [categoryId] as AppCategoryId[], intentId: null as string | null };
    }
    const r = searchApps(visibleApps, query);
    return { hits: r.hits, categories: r.matchedCategories, intentId: r.intent?.id ?? null };
  }, [visibleApps, query, categoryId, presetLabel]);

  const tabs = [
    { key: 'all' as const, label: '전체' },
    ...(result.categories.length > 1 ? result.categories.map((id) => ({ key: id, label: getCategory(id).shortName })) : []),
  ];
  const filtered = tab === 'all' ? result.hits.map((h) => h.app) : result.hits.map((h) => h.app).filter((a) => effectiveCategory(a) === tab);
  const shown = expanded ? filtered : filtered.slice(0, COLLAPSED_COUNT);

  // 분류별 섹션 (목적에 연결된 분류 먼저)
  const rows: Row[] = useMemo(() => {
    const order = [...result.categories, ...CATEGORY_CATALOG.map((x) => x.id).filter((id) => !result.categories.includes(id))];
    const out: Row[] = [];
    for (const id of order) {
      const apps = shown.filter((a) => effectiveCategory(a) === id);
      if (!apps.length) continue;
      out.push({ kind: 'header', key: `h-${id}`, title: getCategory(id).shortName });
      for (const app of apps) out.push({ kind: 'app', key: app.id, app });
    }
    return out;
  }, [shown, result.categories]);

  const isDirections = result.intentId === 'directions' || result.intentId === 'transport';
  const browsing = mode === 'tab' && !query.trim();
  const categoriesWithApps = useMemo(() => {
    const ids = new Set(visibleApps.map(effectiveCategory));
    return CATEGORY_CATALOG.filter((cat) => ids.has(cat.id));
  }, [visibleApps]);

  const header = (
    <View>
      <View style={styles.top}>
        {mode === 'results' ? (
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} accessibilityRole="button" accessibilityLabel="뒤로 가기">
            <Icon name="chevron-left" size={24} color={c.text} strokeWidth={2.1} />
          </Pressable>
        ) : null}
        <View style={styles.field}>
          <SearchField
            variant="compact"
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              setTab('all');
              setExpanded(false);
            }}
            placeholder="앱 이름이나 할 일을 검색하세요"
            autoFocus={mode === 'tab'}
          />
        </View>
        <Pressable
          onPress={() => (mode === 'results' ? (router.canGoBack() ? router.back() : router.replace('/')) : setQuery(''))}
          hitSlop={10}
          accessibilityRole="button"
        >
          <Text style={[styles.cancel, { color: c.textSecondary }]}>취소</Text>
        </Pressable>
      </View>

      {browsing ? (
        <View style={styles.browse}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>카테고리</Text>
          <View style={styles.chips}>
            {categoriesWithApps.map((cat) => (
              <GlassCard
                key={cat.id}
                style={styles.chip}
                onPress={() => router.push({ pathname: '/results', params: { category: cat.id } })}
                accessibilityLabel={cat.name}
              >
                <CategoryIcon id={cat.id} size={26} />
                <Text style={[styles.chipText, { color: c.text }]}>{cat.name}</Text>
              </GlassCard>
            ))}
            <GlassCard style={styles.chip} onPress={() => router.push('/categories')} accessibilityLabel="전체 카테고리">
              <Text style={[styles.chipText, { color: c.icon }]}>전체 카테고리</Text>
              <Icon name="chevron-right" size={14} color={c.icon} strokeWidth={2.2} />
            </GlassCard>
          </View>
        </View>
      ) : (
        <View style={styles.tabsWrap}>
          <PillTabs
            tabs={tabs}
            value={tab}
            onChange={(k) => {
              setTab(k);
              setExpanded(false);
            }}
          />
        </View>
      )}
    </View>
  );

  return (
    <Screen
      tab={mode === 'results' ? 'search' : undefined}
      decoration={
        <View pointerEvents="none" style={styles.wave}>
          <BottomWave width={width} height={180} />
        </View>
      }
    >
      <FlatList
        data={browsing ? [] : rows}
        keyExtractor={(r) => r.key}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          item.kind === 'header' ? (
            <Text style={[styles.groupTitle, { color: c.text }]}>{item.title}</Text>
          ) : (
            <AppListRow app={item.app} />
          )
        }
        ListEmptyComponent={
          browsing ? undefined : (
            <EmptyState
              title={query ? '이 카테고리에 등록된 앱이 없어요' : '검색어를 입력해 주세요'}
              body={
                query
                  ? capabilities.canEnumerateInstalledApps
                    ? '기기에서 확인된 앱 중에 일치하는 앱이 없어요. 앱의 분류를 바꾸거나 별칭을 추가해 보세요.'
                    : '직접 등록한 앱 중에 일치하는 앱이 없어요.'
                  : undefined
              }
              action={
                query ? (
                  <View style={styles.emptyAction}>
                    <SoftButton label="앱 직접 등록하기" onPress={() => router.push('/add-app')} />
                  </View>
                ) : undefined
              }
            />
          )
        }
        ListFooterComponent={
          browsing ? undefined : (
            <View style={styles.footer}>
              {!expanded && filtered.length > COLLAPSED_COUNT ? (
                <PillButton label="더보기" icon="chevron-down" onPress={() => setExpanded(true)} />
              ) : null}
              {isDirections ? (
                <GlassCard style={styles.parking} onPress={() => router.push('/parking')} accessibilityLabel="주차 위치 기록">
                  <Icon name="car" size={24} color={c.icon} />
                  <Text style={[styles.parkingText, { color: c.text }]}>주차 위치 기록하기</Text>
                  <Icon name="chevron-right" size={16} color={c.icon} strokeWidth={2.2} />
                </GlassCard>
              ) : null}
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12 },
  field: { flex: 1 },
  cancel: { fontFamily: fonts.semibold, fontSize: 14.5 },
  tabsWrap: { marginBottom: 14 },
  list: { paddingBottom: 40 },
  groupTitle: { fontFamily: fonts.bold, fontSize: 16, paddingHorizontal: 22, marginTop: 10, marginBottom: 6, letterSpacing: -0.3 },
  footer: { alignItems: 'center', gap: 16, paddingTop: 14 },
  wave: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  browse: { paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, height: 44, borderRadius: 16 },
  chipText: { fontFamily: fonts.bold, fontSize: 13.5, letterSpacing: -0.3 },
  parking: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, height: 60, alignSelf: 'stretch', marginHorizontal: 20 },
  parkingText: { flex: 1, fontFamily: fonts.bold, fontSize: 15 },
  emptyAction: { alignSelf: 'stretch', marginTop: 12 },
});
