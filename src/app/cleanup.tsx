import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen, ScreenHeader } from '@/components/Screen';
import { Checkbox, EmptyState, SectionHeader, SoftButton } from '@/components/ui';
import { ProgressRing } from '@/design-system/ProgressRing';
import { SPARKLE_ICON } from '@/design-system/purpose-icons';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { CLEANUP_REASON_LABEL, cleanupOverview, findUnusedByUsage } from '@/domain/cleanup/cleanup-rules';
import type { AppEntry } from '@/domain/apps/app.types';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { getPlatformServices } from '@/platform';

const DAY = 24 * 60 * 60 * 1000;
const COLLAPSED = 3;

export default function CleanupScreen() {
  const c = useColors();
  const router = useRouter();
  const { visibleApps, settings, capabilities, setCleanupCandidate, updateApp, openAppSettings } = useAppDeck();
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [usageUnused, setUsageUnused] = useState<AppEntry[] | null>(null);

  const overview = cleanupOverview(visibleApps);
  const candidates = useMemo(() => visibleApps.filter((a) => a.isCleanupCandidate), [visibleApps]);

  const usageActive = settings.usageStatsEnabled && capabilities.canReadUsageStats;
  // 사용 기록은 사용자가 켜고 OS 권한이 실제로 허용된 경우에만 조회한다
  useEffect(() => {
    if (!usageActive) return;
    const usage = getPlatformServices().usage;
    let alive = true;
    (async () => {
      if ((await usage.getStatus()) !== 'granted') return;
      const now = Date.now();
      const summary = await usage.getSummary(now - 30 * DAY, now);
      if (alive) setUsageUnused(findUnusedByUsage(visibleApps, summary, now - 30 * DAY).unused);
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [usageActive, visibleApps]);

  const list = candidates;
  const shown = expanded ? list : list.slice(0, COLLAPSED);
  const hint =
    usageActive && usageUnused && usageUnused.length
      ? `최근 30일 동안 실행 기록이 없는 앱이\n${usageUnused.length}개 있어요!`
      : candidates.length
        ? `정리 후보로 표시한 앱이\n${candidates.length}개 있어요!`
        : '앱 정보에서 ‘정리 후보로 표시’하면\n여기에서 한 번에 정리할 수 있어요.';

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const hideSelected = async () => {
    setConfirm(false);
    for (const id of selected) await updateApp(id, { isHidden: true });
    await setCleanupCandidate(selected, false);
    setSelected([]);
    router.replace('/cleanup-done');
  };

  const keepSelected = async () => {
    setConfirm(false);
    await setCleanupCandidate(selected, false);
    setSelected([]);
    router.replace('/cleanup-done');
  };

  const selectedApps = visibleApps.filter((a) => selected.includes(a.id));

  return (
    <Screen tab="home">
      <ScreenHeader title="앱 정리" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ringWrap} accessible accessibilityLabel={`정리된 앱 비율 ${overview.tidyPercent}퍼센트, 관리 중인 앱 ${overview.managedCount}개`}>
          <View>
            <ProgressRing size={124} stroke={10} percent={overview.tidyPercent} />
            <View style={styles.ringCenter}>
              <Text style={[styles.percent, { color: c.text }]}>
                {overview.tidyPercent}
                <Text style={styles.percentSign}>%</Text>
              </Text>
            </View>
          </View>
          <Text style={[styles.ringLabel, { color: c.textSecondary }]}>관리 중인 앱</Text>
          <Text style={[styles.ringCount, { color: c.text }]}>{overview.managedCount}개</Text>
        </View>

        <View style={[styles.hint, { backgroundColor: c.surfaceMuted }]}>
          <Image source={SPARKLE_ICON} style={styles.sparkle} contentFit="contain" />
          <Text style={[styles.hintText, { color: c.textSecondary }]}>{hint}</Text>
        </View>

        {usageActive && usageUnused && usageUnused.length ? (
          <View style={styles.section}>
            <SectionHeader title="최근 30일 실행 기록 없음" />
            {usageUnused.slice(0, 5).map((app) => (
              <Pressable
                key={app.id}
                onPress={() => void setCleanupCandidate([app.id], true, 'usage_stats')}
                style={[styles.item, { borderColor: c.border }]}
                accessibilityRole="button"
                accessibilityLabel={`${app.displayName} 정리 후보로 추가`}
              >
                <AppIcon app={app} size={28} />
                <Text style={[styles.itemName, { color: c.text }]}>{app.displayName}</Text>
                <Text style={[styles.add, { color: c.accent }]}>후보 추가</Text>
              </Pressable>
            ))}
            <Text style={[styles.source, { color: c.textTertiary }]}>출처: Android 사용 기록(최근 30일). 기기 설정에 따라 기록이 불완전할 수 있어요.</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title="정리 추천 앱"
            actionLabel={list.length > COLLAPSED ? (expanded ? '접기' : '더보기') : undefined}
            actionChevron
            onAction={list.length > COLLAPSED ? () => setExpanded((v) => !v) : undefined}
          />
          {shown.length ? (
            <View style={[styles.listBox, { borderColor: c.border }]}>
              {shown.map((app, i) => (
                <Pressable
                  key={app.id}
                  onPress={() => toggle(app.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected.includes(app.id) }}
                  accessibilityLabel={`${app.displayName}, ${CLEANUP_REASON_LABEL[app.cleanupReason ?? 'manual']}`}
                  style={[styles.candidate, i < shown.length - 1 && { borderBottomColor: c.hairline, borderBottomWidth: 1 }]}
                >
                  <AppIcon app={app} size={28} />
                  <View style={styles.candidateText}>
                    <Text style={[styles.itemName, { color: c.text }]} numberOfLines={1}>
                      {app.displayName}
                    </Text>
                  </View>
                  <Checkbox checked={selected.includes(app.id)} />
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState title="정리 후보가 없어요" body="정리 후보는 내가 직접 고른 앱만 보여요. 앱을 자동으로 삭제하지 않아요." />
          )}
        </View>

        <View style={styles.bottom}>
          <SoftButton label="선택 정리" disabled={!selected.length} onPress={() => setConfirm(true)} />
        </View>
      </ScrollView>

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
          { label: '앱덱에서 숨기기', tone: 'primary', onPress: () => void hideSelected() },
          ...(capabilities.canOpenAppSettings && selectedApps.length === 1
            ? [{ label: '앱 정보 열기 (직접 삭제)', onPress: () => { setConfirm(false); void openAppSettings(selectedApps[0]); } }]
            : []),
          { label: '정리 후보에서 빼기', onPress: () => void keepSelected() },
          { label: '취소', onPress: () => setConfirm(false) },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  ringWrap: { alignItems: 'center', marginTop: 4 },
  ringCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  percent: { fontFamily: fonts.bold, fontSize: 32, letterSpacing: -0.5 },
  percentSign: { fontSize: 22 },
  ringLabel: { fontFamily: fonts.medium, fontSize: 12, marginTop: 12 },
  ringCount: { fontFamily: fonts.bold, fontSize: 16, marginTop: 3 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, marginTop: 20 },
  sparkle: { width: 24, height: 24 },
  hintText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  section: { marginTop: 26 },
  listBox: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14 },
  candidate: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 52 },
  candidateText: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 6 },
  itemName: { fontFamily: fonts.semibold, fontSize: 14, flex: 1 },
  add: { fontFamily: fonts.semibold, fontSize: 12.5 },
  source: { fontFamily: fonts.regular, fontSize: 11, marginTop: 6, lineHeight: 16 },
  bottom: { marginTop: 18 },
});
