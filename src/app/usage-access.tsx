import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton, SoftButton } from '@/components/ui';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { getPlatformServices } from '@/platform';

/** Android 사용 기록(선택 기능). 기본 OFF, 시스템 설정에서 사용자가 직접 허용. */
export default function UsageAccessScreen() {
  const c = useColors();
  const { settings, updateSettings, capabilities } = useAppDeck();
  const usage = getPlatformServices().usage;
  const [status, setStatus] = useState<'granted' | 'denied' | 'unsupported'>('unsupported');

  // 설정 화면에서 돌아올 때마다 실제 권한 상태를 다시 확인한다
  useFocusEffect(
    useCallback(() => {
      const check = () => void usage.getStatus().then(setStatus);
      check();
      const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
      return () => sub.remove();
    }, [usage]),
  );

  const enabled = settings.usageStatsEnabled;
  const statusText =
    status === 'unsupported' ? '이 기기/빌드에서는 지원하지 않아요' : status === 'granted' ? '시스템 권한: 허용됨' : '시스템 권한: 허용되지 않음';

  return (
    <Screen>
      <ScreenHeader title="사용 기록 (선택)" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.body, { color: c.textSecondary }]}>
          켜면 ‘앱 정리’에서 최근 30일 동안 실행 기록이 없는 앱을 보여 드려요.{'\n\n'}
          • Android ‘사용 기록 접근’ 권한을 시스템 설정에서 직접 허용해야 해요.{'\n'}
          • 정리 화면을 열 때만 기간별 마지막 사용 시각을 조회하고, 백그라운드에서 감시하지 않아요.{'\n'}
          • 조회 결과는 기기 밖으로 보내지 않고 저장하지도 않아요.{'\n'}
          • 기록이 없는 앱은 ‘정보 없음’으로 두고 미사용으로 단정하지 않아요.{'\n'}
          • 기기 설정·재부팅 등으로 기록이 불완전할 수 있어요.
        </Text>

        <View style={[styles.status, { backgroundColor: c.surfaceMuted }]}>
          <Text style={[styles.statusText, { color: c.text }]}>기능: {enabled ? '켜짐' : '꺼짐'}</Text>
          <Text style={[styles.statusSub, { color: c.textSecondary }]}>{statusText}</Text>
        </View>

        {capabilities.canReadUsageStats ? (
          <View style={styles.actions}>
            {!enabled ? (
              <PrimaryButton
                label="동의하고 켜기"
                onPress={() => void updateSettings({ usageStatsEnabled: true, usageStatsDisclosureAcceptedAt: new Date().toISOString() })}
              />
            ) : null}
            {enabled && status !== 'granted' ? <PrimaryButton label="시스템 설정에서 허용하기" onPress={() => void usage.openSettings()} /> : null}
            {enabled ? <SoftButton label="기능 끄기" onPress={() => void updateSettings({ usageStatsEnabled: false, usageStatsDisclosureAcceptedAt: null })} /> : null}
            {enabled && status === 'granted' ? (
              <Text style={[styles.hint, { color: c.textTertiary }]}>시스템 권한까지 해제하려면 ‘시스템 설정에서 허용하기’ 화면에서 앱덱을 꺼 주세요.</Text>
            ) : null}
            {enabled && status === 'granted' ? <SoftButton label="시스템 설정 열기" onPress={() => void usage.openSettings()} /> : null}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 36, gap: 18 },
  body: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 21 },
  status: { borderRadius: 14, padding: 16, gap: 4 },
  statusText: { fontFamily: fonts.bold, fontSize: 14.5 },
  statusSub: { fontFamily: fonts.medium, fontSize: 12.5 },
  actions: { gap: 8 },
  hint: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 17 },
});
