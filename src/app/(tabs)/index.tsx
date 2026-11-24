import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { EmptyState, PrimaryButton, SectionHeader } from '@/components/ui';
import { PURPOSE_ICONS } from '@/design-system/purpose-icons';
import { useColors } from '@/design-system/theme';
import { fonts, type } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const PURPOSE_ROWS: { key: string; label: string; href: string }[] = [
  { key: 'delivery', label: '배달 주문', href: '/results?intent=delivery' },
  { key: 'directions', label: '길 찾기', href: '/results?intent=directions' },
  { key: 'ott', label: 'OTT 보기', href: '/results?intent=ott' },
  { key: 'shopping', label: '쇼핑하기', href: '/results?intent=shopping' },
  { key: 'movie', label: '영화 예매', href: '/results?intent=movie' },
  { key: 'cleanup', label: '앱 정리하기', href: '/cleanup' },
];

export default function HomeScreen() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps, launchApp, refreshInventory, scanning, capabilities, settings } = useAppDeck();
  const [query, setQuery] = useState('');
  const favorites = visibleApps.filter((a) => a.isFavorite).sort((a, b) => a.favoriteOrder - b.favoriteOrder);
  const canScan = capabilities.canEnumerateInstalledApps && !!settings.inventoryDisclosureAcceptedAt;

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    router.push({ pathname: '/results', params: { q } });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={canScan ? <RefreshControl refreshing={scanning} onRefresh={refreshInventory} /> : undefined}
      >
        <Text style={[type.greeting, styles.greeting, { color: c.text }]} accessibilityRole="header">
          안녕하세요!{'\n'}오늘도 스마트한 하루 되세요 👋
        </Text>

        <SearchField
          value={query}
          onChangeText={setQuery}
          onSubmit={submit}
          placeholder="무엇을 하시나요?"
          trailing={
            canScan
              ? { icon: 'scan', label: '설치된 앱 다시 확인', onPress: () => void refreshInventory() }
              : { icon: 'scan', label: '검색', onPress: submit }
          }
        />

        <View style={styles.rows}>
          {PURPOSE_ROWS.map((row) => (
            <Pressable
              key={row.key}
              onPress={() => router.push(row.href as never)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted }]}
            >
              <Image source={PURPOSE_ICONS[row.key]} style={styles.rowIcon} contentFit="contain" />
              <Text style={[type.body, { color: c.text }]}>{row.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.shortcuts}>
          <SectionHeader title="바로가기" actionLabel="편집" onAction={() => router.navigate('/favorites')} />
          {favorites.length ? (
            <View style={styles.shortcutRow}>
              {favorites.slice(0, 4).map((app) => (
                <Pressable
                  key={app.id}
                  style={styles.shortcut}
                  onPress={() => void launchApp(app)}
                  onLongPress={() => router.push({ pathname: '/app/[id]', params: { id: app.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${app.displayName} 열기`}
                  accessibilityHint="길게 누르면 앱 정보를 볼 수 있어요"
                >
                  <AppIcon app={app} size={40} />
                  <Text style={[styles.shortcutLabel, { color: c.textSecondary }]} numberOfLines={1}>
                    {app.displayName}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : visibleApps.length ? (
            <Text style={[styles.hint, { color: c.textTertiary }]}>자주 쓰는 앱을 즐겨찾기에 추가하면 여기에 보여요.</Text>
          ) : (
            <EmptyState
              title={capabilities.canEnumerateInstalledApps ? '아직 불러온 앱이 없어요' : '등록된 앱이 없어요'}
              body={capabilities.limitationNote}
              action={
                <View style={styles.emptyAction}>
                  <PrimaryButton
                    label={capabilities.canEnumerateInstalledApps ? '내 앱 불러오기' : '앱 직접 등록하기'}
                    onPress={() => router.push(capabilities.canEnumerateInstalledApps ? '/onboarding' : '/add-app')}
                  />
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  greeting: { marginBottom: 20 },
  rows: { gap: 9, marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 50, borderRadius: 14, paddingHorizontal: 16 },
  rowIcon: { width: 28, height: 28 },
  shortcuts: { marginTop: 28 },
  shortcutRow: { flexDirection: 'row' },
  shortcut: { width: '25%', alignItems: 'center', gap: 6 },
  shortcutLabel: { fontFamily: fonts.medium, fontSize: 11, maxWidth: 72 },
  hint: { fontFamily: fonts.regular, fontSize: 13 },
  emptyAction: { alignSelf: 'stretch', marginTop: 12 },
});
