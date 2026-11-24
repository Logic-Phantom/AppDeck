import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { Toggle } from '@/components/ui';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

function formatScan(iso: string | null) {
  if (!iso) return '아직 불러오지 않았어요';
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function SettingsAppsScreen() {
  const c = useColors();
  const router = useRouter();
  const { settings, updateSettings, capabilities, refreshInventory, scanning, scanError, allApps, updateApp } = useAppDeck();
  const hidden = allApps.filter((a) => a.isHidden);
  const consented = !!settings.inventoryDisclosureAcceptedAt;

  return (
    <Screen>
      <ScreenHeader title="앱 목록 설정" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.note, { color: c.textSecondary }]}>{capabilities.limitationNote}</Text>

        {capabilities.canEnumerateInstalledApps ? (
          consented ? (
            <>
              <SettingsRow
                icon="scan"
                label={scanning ? '앱 목록 확인 중…' : '설치된 앱 다시 불러오기'}
                subtitle={scanError ?? `마지막 확인: ${formatScan(settings.lastInventoryScanAt)}`}
                onPress={scanning ? undefined : () => void refreshInventory()}
              />
              <SettingsRow
                icon="settings"
                label="시스템 앱 포함"
                subtitle="기본 설치된 시스템 앱도 목록에 보여요"
                right={<Toggle value={settings.includeSystemApps} />}
                onPress={() => void updateSettings({ includeSystemApps: !settings.includeSystemApps }).then(() => refreshInventory())}
              />
              <SettingsRow
                icon="lock"
                label="앱 목록 확인 동의 철회"
                subtitle="더 이상 기기 앱 목록을 확인하지 않아요"
                onPress={() => void updateSettings({ inventoryDisclosureAcceptedAt: null })}
              />
            </>
          ) : (
            <SettingsRow icon="scan" label="설치된 앱 불러오기" subtitle="앱 목록 확인 안내를 읽고 동의해요" onPress={() => router.push('/onboarding')} />
          )
        ) : null}

        <SettingsRow icon="plus" label="앱 직접 등록" subtitle="링크로 실행할 앱을 추가해요" onPress={() => router.push('/add-app')} />

        <Text style={[styles.group, { color: c.textSecondary }]}>숨긴 앱 {hidden.length}개</Text>
        {hidden.length === 0 ? <Text style={[styles.note, { color: c.textTertiary }]}>숨긴 앱이 없어요.</Text> : null}
        {hidden.map((a, i) => (
          <SettingsRow
            key={a.id}
            icon="eye-off"
            label={a.displayName}
            subtitle="눌러서 다시 보이기"
            showChevron={false}
            onPress={() => void updateApp(a.id, { isHidden: false })}
            last={i === hidden.length - 1}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  note: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 19, marginBottom: 6 },
  group: { fontFamily: fonts.semibold, fontSize: 12.5, marginTop: 26, marginBottom: 4 },
});
