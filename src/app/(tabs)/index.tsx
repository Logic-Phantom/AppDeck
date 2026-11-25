import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { EmptyState, GlassCard, PrimaryButton, SectionHeader } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { QUICK_ICONS, SUN_ICON } from '@/design-system/purpose-icons';
import { useColors } from '@/design-system/theme';
import { fonts, type } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const QUICK: { key: keyof typeof QUICK_ICONS; label: string; intent: string }[] = [
  { key: 'delivery', label: '배달·주문', intent: 'delivery' },
  { key: 'directions', label: '길찾기', intent: 'directions' },
  { key: 'ott', label: 'OTT', intent: 'ott' },
  { key: 'shopping', label: '쇼핑', intent: 'shopping' },
  { key: 'transport', label: '교통·이동', intent: 'transport' },
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
    if (q) router.push({ pathname: '/results', params: { q } });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={canScan ? <RefreshControl refreshing={scanning} onRefresh={refreshInventory} /> : undefined}
      >
        <View style={styles.hello}>
          <Image source={SUN_ICON} style={styles.sun} contentFit="contain" />
          <Text style={[styles.helloText, { color: c.text }]}>오늘도 좋은 하루에요!</Text>
        </View>
        <Text style={[type.headline, styles.headline, { color: c.text }]} accessibilityRole="header">
          필요한 앱을{'\n'}한 번에 찾아보세요
        </Text>

        <SearchField value={query} onChangeText={setQuery} onSubmit={submit} placeholder="어떤 앱을 찾고 계세요?" />

        <View style={styles.grid}>
          {QUICK.map((q) => (
            <GlassCard
              key={q.key}
              style={styles.quick}
              onPress={() => router.push({ pathname: '/results', params: { intent: q.intent } })}
              accessibilityLabel={q.label}
            >
              <Image source={QUICK_ICONS[q.key]} style={styles.quickIcon} contentFit="contain" />
              <Text style={[styles.quickText, { color: c.text }]}>{q.label}</Text>
            </GlassCard>
          ))}
          <GlassCard style={[styles.quick, styles.quickMore]} onPress={() => router.push('/categories')} accessibilityLabel="카테고리 더보기">
            <Text style={[styles.moreText, { color: c.text }]}>더보기</Text>
            <Icon name="chevron-right" size={18} color={c.text} strokeWidth={2.2} />
          </GlassCard>
        </View>

        <View style={styles.favorites}>
          <SectionHeader title="즐겨찾기" actionLabel="편집" onAction={() => router.push('/favorites')} />
          {favorites.length ? (
            <View style={styles.favRow}>
              {favorites.slice(0, 4).map((app) => (
                <Pressable
                  key={app.id}
                  style={styles.fav}
                  onPress={() => void launchApp(app)}
                  onLongPress={() => router.push({ pathname: '/app/[id]', params: { id: app.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${app.displayName} 열기`}
                  accessibilityHint="길게 누르면 앱 정보를 볼 수 있어요"
                >
                  <AppIcon app={app} size={56} />
                  <Text style={[styles.favLabel, { color: c.textSecondary }]} numberOfLines={1}>
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
  content: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 28 },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sun: { width: 22, height: 22 },
  helloText: { fontFamily: fonts.semibold, fontSize: 14.5, letterSpacing: -0.3 },
  headline: { marginTop: 18, marginBottom: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 22 },
  quick: { width: '48%', height: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  quickIcon: { width: 36, height: 36 },
  quickText: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: -0.4 },
  quickMore: { justifyContent: 'center', gap: 4 },
  moreText: { fontFamily: fonts.semibold, fontSize: 15 },
  favorites: { marginTop: 30 },
  favRow: { flexDirection: 'row' },
  fav: { width: '25%', alignItems: 'center', gap: 8 },
  favLabel: { fontFamily: fonts.medium, fontSize: 12, maxWidth: 76 },
  hint: { fontFamily: fonts.regular, fontSize: 13 },
  emptyAction: { alignSelf: 'stretch', marginTop: 12 },
});
