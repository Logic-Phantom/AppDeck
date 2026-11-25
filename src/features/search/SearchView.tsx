import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { AppListRow } from '@/components/AppListRow';
import { AppPickerSheet, CategoryPickerSheet } from '@/components/CategorySheets';
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
  const { visibleApps, capabilities, setCategoryMany, showToast } = useAppDeck();
  const presetIntent = intentId ? findPurposeIntent(intentId) : undefined;
  const presetLabel = categoryId ? getCategory(categoryId).name : (presetIntent?.label ?? '');
  const [query, setQuery] = useState(initialQuery ?? presetLabel);
  const [tab, setTab] = useState<AppCategoryId | 'all'>('all');
  const [expanded, setExpanded] = useState(false);
  // 카테고리 편집 모드 (카테고리 화면에서 들어온 경우만)
  const categoryMode = !!categoryId && query === presetLabel;
  const [editing, setEditing] = useState(false);
  const [moving, setMoving] = useState<AppEntry | null>(null);
  const [adding, setAdding] = useState(false);

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
  const isEditing = categoryMode && editing;
  const shown = expanded || isEditing ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const addCandidates = useMemo(
    () => (categoryId ? visibleApps.filter((a) => effectiveCategory(a) !== categoryId) : []),
    [visibleApps, categoryId],
  );

  const moveApp = async (app: AppEntry, target: AppCategoryId | null) => {
    setMoving(null);
    await setCategoryMany([app.id], target);
    showToast(target ? `${app.displayName} → ${getCategory(target).name}(으)로 옮겼어요.` : `${app.displayName}을(를) 자동 분류로 되돌렸어요.`);
  };

  const addApps = async (ids: string[]) => {
    if (!categoryId) return;
    setAdding(false);
    await setCategoryMany(ids, categoryId);
    showToast(`${ids.length}개 앱을 ${getCategory(categoryId).name}에 넣었어요.`);
  };

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
        {categoryMode ? (
          <Pressable
            onPress={() => setEditing((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={editing ? '카테고리 편집 완료' : '카테고리 편집'}
            style={[styles.editBtn, { backgroundColor: editing ? c.primary : c.accentSoft }]}
          >
            <Text style={[styles.editText, { color: editing ? c.onPrimary : c.icon }]}>{editing ? '완료' : '편집'}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => (mode === 'results' ? (router.canGoBack() ? router.back() : router.replace('/')) : setQuery(''))}
            hitSlop={10}
            accessibilityRole="button"
          >
            <Text style={[styles.cancel, { color: c.textSecondary }]}>취소</Text>
          </Pressable>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editHead}>
          <GlassCard style={styles.addCard} onPress={() => setAdding(true)} accessibilityLabel="이 카테고리에 앱 넣기">
            <View style={[styles.addIcon, { backgroundColor: c.accentSoft }]}>
              <Icon name="plus" size={20} color={c.accent} strokeWidth={2.4} />
            </View>
            <View style={styles.addTexts}>
              <Text style={[styles.addTitle, { color: c.text }]}>이 카테고리에 앱 넣기</Text>
              <Text style={[styles.addSub, { color: c.textSecondary }]}>다른 카테고리에 있는 앱을 골라 옮겨요</Text>
            </View>
            <Icon name="chevron-right" size={16} color={c.icon} strokeWidth={2.2} />
          </GlassCard>
          <Text style={[styles.editNote, { color: c.textTertiary }]}>
            ‘빼기’를 누르면 옮길 카테고리를 고를 수 있어요. 직접 바꾼 분류는 앱 목록을 새로 불러와도 그대로 유지돼요.
          </Text>
        </View>
      ) : null}

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
          ) : isEditing ? (
            <View style={styles.editRow}>
              <AppIcon app={item.app} size={46} />
              <View style={styles.editTexts}>
                <Text style={[styles.editName, { color: c.text }]} numberOfLines={1}>
                  {item.app.displayName}
                </Text>
                <Text style={[styles.editSub, { color: item.app.userCategoryId ? c.accent : c.textTertiary }]}>
                  {item.app.userCategoryId ? '직접 넣은 앱' : '자동 분류'}
                </Text>
              </View>
              <Pressable
                onPress={() => setMoving(item.app)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${item.app.displayName} 이 카테고리에서 빼기`}
                style={({ pressed }) => [styles.removeBtn, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted, borderColor: c.danger }]}
              >
                <Icon name="close" size={13} color={c.danger} strokeWidth={2.4} />
                <Text style={[styles.removeText, { color: c.danger }]}>빼기</Text>
              </Pressable>
            </View>
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
              {!expanded && !isEditing && filtered.length > COLLAPSED_COUNT ? (
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

      {categoryId ? (
        <>
          <CategoryPickerSheet
            visible={!!moving}
            title={moving ? `${moving.displayName}을(를) 어디로 옮길까요?` : ''}
            subtitle={`${getCategory(categoryId).name}에서 빠지고 고른 카테고리로 옮겨져요.`}
            excludeId={categoryId}
            showAutoReset={!!moving?.userCategoryId && moving.suggestedCategoryId !== categoryId}
            onPick={(target) => moving && void moveApp(moving, target)}
            onClose={() => setMoving(null)}
          />
          <AppPickerSheet
            visible={adding}
            categoryId={categoryId}
            apps={addCandidates}
            onConfirm={(ids) => void addApps(ids)}
            onClose={() => setAdding(false)}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12 },
  field: { flex: 1 },
  cancel: { fontFamily: fonts.semibold, fontSize: 14.5 },
  editBtn: { paddingHorizontal: 14, height: 34, borderRadius: 999, justifyContent: 'center' },
  editText: { fontFamily: fonts.bold, fontSize: 13.5 },
  editHead: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, gap: 10 },
  addCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  addIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addTexts: { flex: 1, gap: 2 },
  addTitle: { fontFamily: fonts.bold, fontSize: 15 },
  addSub: { fontFamily: fonts.medium, fontSize: 12.5 },
  editNote: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingVertical: 9 },
  editTexts: { flex: 1, gap: 3 },
  editName: { fontFamily: fonts.bold, fontSize: 15.5, letterSpacing: -0.3 },
  editSub: { fontFamily: fonts.medium, fontSize: 12.5 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 34, borderRadius: 999, borderWidth: 1 },
  removeText: { fontFamily: fonts.bold, fontSize: 13 },
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
