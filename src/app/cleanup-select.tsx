import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen, ScreenHeader } from '@/components/Screen';
import { Checkbox, EmptyState, GlassCard, PrimaryButton } from '@/components/ui';
import { ProgressRing } from '@/design-system/ProgressRing';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { CLEANUP_REASON_LABEL, cleanupOverview } from '@/domain/cleanup/cleanup-rules';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { UNUSED_DAYS, useCleanupData } from '@/features/cleanup/useCleanupData';

/** 정리할 앱 고르기 — 정리 후보 + (허용한 경우) 사용 기록 기반 미사용 앱 */
export default function CleanupSelectScreen() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps, capabilities, setCleanupCandidate, updateApp, openAppSettings } = useAppDeck();
  const data = useCleanupData();
  const [selected, setSelected] = useState<string[]>(() => data.unusedApps.map((a) => a.id));
  const [confirm, setConfirm] = useState(false);
  const overview = cleanupOverview(visibleApps);
  const usageIds = new Set((data.unusedByUsage ?? []).map((a) => a.id));

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectedApps = visibleApps.filter((a) => selected.includes(a.id));

  const finish = async (hide: boolean) => {
    setConfirm(false);
    if (hide) for (const id of selected) await updateApp(id, { isHidden: true });
    await setCleanupCandidate(selected, false);
    setSelected([]);
    router.replace('/cleanup-done');
  };

  return (
    <Screen tab="vault">
      <ScreenHeader title="정리할 앱 고르기" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ringWrap} accessible accessibilityLabel={`정리된 앱 비율 ${overview.tidyPercent}퍼센트, 관리 중인 앱 ${overview.managedCount}개`}>
          <View>
            <ProgressRing size={118} stroke={10} percent={overview.tidyPercent} />
            <View style={styles.ringCenter}>
              <Text style={[styles.percent, { color: c.text }]}>
                {overview.tidyPercent}
                <Text style={styles.percentSign}>%</Text>
              </Text>
            </View>
          </View>
          <Text style={[styles.ringLabel, { color: c.textSecondary }]}>정리된 앱 비율 · 관리 중인 앱 {overview.managedCount}개</Text>
        </View>

        {data.unusedApps.length ? (
          <GlassCard style={styles.listBox}>
            {data.unusedApps.map((app, i) => (
              <Pressable
                key={app.id}
                onPress={() => toggle(app.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected.includes(app.id) }}
                style={[styles.candidate, i < data.unusedApps.length - 1 && { borderBottomColor: c.hairline, borderBottomWidth: 1 }]}
              >
                <AppIcon app={app} size={38} />
                <View style={styles.texts}>
                  <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                    {app.displayName}
                  </Text>
                  <Text style={[styles.reason, { color: c.textTertiary }]} numberOfLines={1}>
                    {app.isCleanupCandidate
                      ? CLEANUP_REASON_LABEL[app.cleanupReason ?? 'manual']
                      : usageIds.has(app.id)
                        ? `최근 ${UNUSED_DAYS}일 실행 기록 없음 (사용 기록)`
                        : ''}
                  </Text>
                </View>
                <Checkbox checked={selected.includes(app.id)} />
              </Pressable>
            ))}
          </GlassCard>
        ) : (
          <EmptyState title="정리할 앱이 없어요" body="앱 정보에서 ‘정리 후보로 표시’한 앱이 여기에 보여요. 앱을 자동으로 삭제하지 않아요." />
        )}
        {data.unusedByUsage ? (
          <Text style={[styles.source, { color: c.textTertiary }]}>
            사용 기록 출처: Android 사용 기록(최근 {UNUSED_DAYS}일). 기기 설정에 따라 기록이 불완전할 수 있어요.
          </Text>
        ) : null}
      </ScrollView>
      <View style={styles.bottom}>
        <PrimaryButton label={`선택한 앱 정리하기 (${selected.length})`} disabled={!selected.length} onPress={() => setConfirm(true)} />
      </View>

      <ConfirmDialog
        visible={confirm}
        title={`${selected.length}개 앱을 어떻게 정리할까요?`}
        message={
          capabilities.canOpenAppSettings
            ? '앱덱은 다른 앱을 직접 삭제하지 않아요. 앱덱 목록에서 숨기거나, 앱 정보 화면에서 직접 삭제할 수 있어요.'
            : '앱덱은 다른 앱을 직접 삭제하지 않아요. 앱덱 목록에서 숨기거나 후보에서 뺄 수 있어요.'
        }
        onClose={() => setConfirm(false)}
        actions={[
          { label: '앱덱에서 숨기기', tone: 'primary', onPress: () => void finish(true) },
          ...(capabilities.canOpenAppSettings && selectedApps.length === 1
            ? [{ label: '앱 정보 열기 (직접 삭제)', onPress: () => { setConfirm(false); void openAppSettings(selectedApps[0]); } }]
            : []),
          { label: '정리 후보에서 빼기', onPress: () => void finish(false) },
          { label: '취소', onPress: () => setConfirm(false) },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  ringWrap: { alignItems: 'center', marginVertical: 8 },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  percent: { fontFamily: fonts.bold, fontSize: 30, letterSpacing: -0.5 },
  percentSign: { fontSize: 20 },
  ringLabel: { fontFamily: fonts.medium, fontSize: 12.5, marginTop: 12, marginBottom: 18 },
  listBox: { paddingHorizontal: 16 },
  candidate: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64 },
  texts: { flex: 1, gap: 3 },
  name: { fontFamily: fonts.bold, fontSize: 15 },
  reason: { fontFamily: fonts.medium, fontSize: 12 },
  source: { fontFamily: fonts.regular, fontSize: 11, marginTop: 10, lineHeight: 16 },
  bottom: { paddingHorizontal: 20, paddingVertical: 12 },
});
