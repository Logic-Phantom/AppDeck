import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Screen, TabTitle } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { EmptyState, GlassCard, PillButton, PillTabs } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import type { AppEntry } from '@/domain/apps/app.types';
import { searchApps } from '@/domain/search/search-engine';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { UNUSED_DAYS, useCleanupData } from '@/features/cleanup/useCleanupData';

type VaultTab = 'all' | 'recent' | 'unused';
const COLUMNS = 4;

/** 레퍼런스 v2 "앱 보관함": 검색 + 전체/최근 사용/안 쓰는 앱 + 4열 그리드 + 앱 정리 팁 */
export default function VaultScreen() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps, launches, getApp, launchApp, capabilities, scanning } = useAppDeck();
  const cleanup = useCleanupData();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<VaultTab>('all');

  const recent = useMemo(() => {
    const out: AppEntry[] = [];
    for (const l of launches) {
      if (l.result !== 'opened') continue;
      const app = getApp(l.appId);
      if (app && !app.isHidden && app.installationStatus !== 'removed' && !out.some((r) => r.id === app.id)) out.push(app);
    }
    return out;
  }, [launches, getApp]);

  const base = tab === 'all' ? visibleApps : tab === 'recent' ? recent : cleanup.unusedApps;
  const list = query.trim() ? searchApps(base, query).hits.map((h) => h.app) : base;

  const tip =
    cleanup.unusedByUsage && cleanup.unusedByUsage.length
      ? `최근 ${UNUSED_DAYS}일간 사용하지 않은 앱이\n${cleanup.unusedByUsage.length}개 있어요!`
      : cleanup.candidates.length
        ? `정리 후보로 표시한 앱이\n${cleanup.candidates.length}개 있어요!`
        : '앱 정보에서 정리 후보로 표시하면\n여기서 한 번에 정리할 수 있어요.';

  const emptyText =
    tab === 'recent'
      ? '앱덱에서 실행한 앱이 여기에 보여요. (기기 전체 사용 기록이 아니에요)'
      : tab === 'unused'
        ? cleanup.usageActive
          ? '정리 후보나 최근 30일 실행 기록이 없는 앱이 없어요.'
          : '정리 후보로 표시한 앱이 없어요. 설정 > 앱 사용 기록을 켜면 오래 안 쓴 앱도 찾아 드려요.'
        : capabilities.limitationNote;

  return (
    <Screen>
      <FlatList
        data={list}
        key={COLUMNS}
        numColumns={COLUMNS}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <TabTitle
              title="앱 보관함"
              right={
                !capabilities.canEnumerateInstalledApps || capabilities.platform !== 'android' ? (
                  <Pressable onPress={() => router.push('/add-app')} hitSlop={10} accessibilityRole="button" accessibilityLabel="앱 직접 등록">
                    <Icon name="plus" size={23} color={c.icon} strokeWidth={2.1} />
                  </Pressable>
                ) : undefined
              }
            />
            <View style={styles.pad}>
              <SearchField variant="muted" value={query} onChangeText={setQuery} placeholder="앱 검색하기" />
            </View>
            <View style={styles.tabs}>
              <PillTabs<VaultTab>
                tabs={[
                  { key: 'all', label: '전체' },
                  { key: 'recent', label: '최근 사용' },
                  { key: 'unused', label: '안 쓰는 앱' },
                ]}
                value={tab}
                onChange={setTab}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.cell}
            onPress={() => void launchApp(item)}
            onLongPress={() => router.push({ pathname: '/app/[id]', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${item.displayName} 열기`}
            accessibilityHint="길게 누르면 앱 정보를 볼 수 있어요"
          >
            <AppIcon app={item} size={56} />
            <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
              {item.displayName}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={scanning ? <EmptyState title="앱 목록을 확인하고 있어요" /> : <EmptyState title={query ? '일치하는 앱이 없어요' : '앱이 없어요'} body={query ? undefined : emptyText} />}
        ListFooterComponent={
          <GlassCard style={styles.tip}>
            <View style={styles.tipTexts}>
              <Text style={[styles.tipTitle, { color: c.text }]}>앱 정리 팁</Text>
              <Text style={[styles.tipBody, { color: c.textSecondary }]}>{tip}</Text>
            </View>
            <PillButton label="정리하기" onPress={() => router.push('/cleanup')} />
          </GlassCard>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  pad: { paddingHorizontal: 20 },
  tabs: { marginTop: 16, marginBottom: 18 },
  row: { paddingHorizontal: 12 },
  cell: { width: `${100 / COLUMNS}%`, alignItems: 'center', gap: 8, marginBottom: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 12, maxWidth: 80, letterSpacing: -0.3 },
  tip: { marginHorizontal: 20, marginTop: 8, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipTexts: { flex: 1, gap: 6 },
  tipTitle: { fontFamily: fonts.bold, fontSize: 13.5 },
  tipBody: { fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20 },
});
