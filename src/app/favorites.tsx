import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Screen, ScreenHeader } from '@/components/Screen';
import { EmptyState, SectionHeader } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import type { AppEntry } from '@/domain/apps/app.types';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

function GridItem({ app, editing, onPress, onRemove, onMove }: { app: AppEntry; editing: boolean; onPress: () => void; onRemove: () => void; onMove?: (dir: -1 | 1) => void }) {
  const c = useColors();
  return (
    <View style={styles.cell}>
      <Pressable
        onPress={onPress}
        onLongPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={editing ? `${app.displayName} 즐겨찾기 편집` : `${app.displayName} 열기`}
        style={styles.cellInner}
      >
        <AppIcon app={app} size={52} />
        <Text style={[styles.label, { color: c.textSecondary }]} numberOfLines={1}>
          {app.displayName}
        </Text>
      </Pressable>
      {editing ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${app.displayName} 즐겨찾기 해제`}
          style={[styles.remove, { backgroundColor: c.text }]}
        >
          <Icon name="close" size={11} color={c.canvas} strokeWidth={2.6} />
        </Pressable>
      ) : null}
      {editing && onMove ? (
        <View style={styles.moves}>
          <Pressable onPress={() => onMove(-1)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${app.displayName} 앞으로 이동`}>
            <Icon name="chevron-left" size={16} color={c.textSecondary} strokeWidth={2} />
          </Pressable>
          <Pressable onPress={() => onMove(1)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${app.displayName} 뒤로 이동`}>
            <Icon name="chevron-right" size={16} color={c.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function FavoritesTab() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps, launches, getApp, launchApp, toggleFavorite, updateApp } = useAppDeck();
  const [editing, setEditing] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const favorites = visibleApps.filter((a) => a.isFavorite).sort((a, b) => a.favoriteOrder - b.favoriteOrder);

  // 최근 실행: 앱덱에서 실제로 실행에 성공한 기록만, 앱별 1회
  const recent: AppEntry[] = [];
  for (const l of launches) {
    if (l.result !== 'opened') continue;
    const app = getApp(l.appId);
    if (app && !app.isHidden && app.installationStatus !== 'removed' && !recent.some((r) => r.id === app.id)) recent.push(app);
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= favorites.length) return;
    const reordered = [...favorites];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await Promise.all(reordered.map((a, i) => (a.favoriteOrder === i ? null : updateApp(a.id, { favoriteOrder: i }))));
  };

  return (
    <Screen tab="home">
      <ScreenHeader
        title="즐겨찾기"
        right={
          <Pressable
            onPress={() => setEditing((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            style={[styles.tag, { backgroundColor: editing ? c.primary : c.accentSoft }]}
          >
            <Text style={[styles.tagText, { color: editing ? c.onPrimary : c.icon }]}>{editing ? '완료' : '편집'}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.hint, { color: c.textTertiary }]}>
          {editing ? '× 로 즐겨찾기를 해제하고, ‹ › 로 순서를 바꿔요.' : '홈 화면 즐겨찾기에는 앞의 4개가 보여요. 앱 정보 화면의 ☆로 추가할 수 있어요.'}
        </Text>

        {favorites.length ? (
          <View style={styles.grid}>
            {favorites.map((app, i) => (
              <GridItem
                key={app.id}
                app={app}
                editing={editing}
                onPress={() => (editing ? router.push({ pathname: '/app/[id]', params: { id: app.id } }) : void launchApp(app))}
                onRemove={() => void toggleFavorite(app.id)}
                onMove={(dir) => void move(i, dir)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="즐겨찾기한 앱이 없어요" body="검색 결과에서 앱을 눌러 앱 정보에서 즐겨찾기에 추가할 수 있어요." />
        )}

        <View style={styles.recent}>
          <SectionHeader
            title="최근 사용한 앱"
            actionLabel={recent.length > 4 ? (showAllRecent ? '접기' : '더보기') : undefined}
            actionChevron
            onAction={recent.length > 4 ? () => setShowAllRecent((v) => !v) : undefined}
          />
          {recent.length ? (
            <View style={styles.grid}>
              {(showAllRecent ? recent : recent.slice(0, 4)).map((app) => (
                <GridItem key={app.id} app={app} editing={false} onPress={() => void launchApp(app)} onRemove={() => undefined} />
              ))}
            </View>
          ) : (
            <Text style={[styles.note, { color: c.textTertiary }]}>앱덱에서 실행한 앱이 여기에 보여요.</Text>
          )}
          <Text style={[styles.note, { color: c.textTertiary }]}>앱덱에서 실행한 기록만 표시해요. 기기 전체 사용 기록이 아니에요.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  hint: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, paddingHorizontal: 4, marginBottom: 18 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontFamily: fonts.semibold, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
  cell: { width: '25%', alignItems: 'center' },
  cellInner: { alignItems: 'center', gap: 7 },
  label: { fontFamily: fonts.medium, fontSize: 11.5, maxWidth: 76 },
  remove: { position: 'absolute', top: -5, right: 8, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  moves: { flexDirection: 'row', gap: 14, marginTop: 4 },
  recent: { marginTop: 32, paddingHorizontal: 4 },
  note: { fontFamily: fonts.regular, fontSize: 11.5, marginTop: 12 },
});
