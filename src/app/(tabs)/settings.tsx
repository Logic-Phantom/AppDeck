import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog, type DialogAction } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts, type } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { shareBackup } from '@/features/settings/export-data';
import type { ThemePreference } from '@/infrastructure/storage/repository';

const THEME_LABEL: Record<ThemePreference, string> = { system: '시스템 설정 따르기', light: '라이트', dark: '다크' };
const NEXT_THEME: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' };

type DialogKind = 'cache' | 'export' | 'reset' | null;

export default function SettingsTab() {
  const c = useColors();
  const router = useRouter();
  const { settings, updateSettings, capabilities, clearIconCache, clearAllData, exportData, showToast } = useAppDeck();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const version = Constants.expoConfig?.version ?? '0.1.0';

  const usageLabel = !capabilities.canReadUsageStats ? '이 기기에서는 지원하지 않아요' : settings.usageStatsEnabled ? '켜짐' : '꺼짐 (선택 기능)';

  const dialogs: Record<Exclude<DialogKind, null>, { title: string; message: string; actions: DialogAction[] }> = {
    cache: {
      title: '캐시를 삭제할까요?',
      message: '저장된 앱 아이콘 이미지만 지워요. 즐겨찾기·분류 등 내 설정은 그대로 남아요.',
      actions: [
        { label: '캐시 삭제', tone: 'primary', onPress: () => void clearIconCache().finally(() => setDialog(null)) },
        { label: '취소', onPress: () => setDialog(null) },
      ],
    },
    export: {
      title: '데이터를 내보낼까요?',
      message: '내보내는 파일에는 설치된 앱 목록과 즐겨찾기·분류·실행 기록이 들어 있어요. 민감한 정보이니 공유할 곳을 꼭 확인해 주세요.',
      actions: [
        {
          label: '파일로 내보내기',
          tone: 'primary',
          onPress: () => {
            setDialog(null);
            shareBackup(exportData())
              .then((r) => r === 'unavailable' && showToast('이 기기에서는 공유 기능을 쓸 수 없어요.'))
              .catch(() => showToast('내보내기에 실패했어요.'));
          },
        },
        { label: '취소', onPress: () => setDialog(null) },
      ],
    },
    reset: {
      title: '앱 데이터를 초기화할까요?',
      message: '앱덱에 저장된 앱 목록, 즐겨찾기, 분류, 별칭, 실행 기록, 주차 메모, 아이콘 캐시가 모두 삭제돼요. 휴대폰에 설치된 앱은 삭제되지 않아요.',
      actions: [
        {
          label: '모두 삭제',
          tone: 'danger',
          onPress: () => {
            setDialog(null);
            void clearAllData().then(() => router.replace('/onboarding'));
          },
        },
        { label: '취소', onPress: () => setDialog(null) },
      ],
    },
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Icon name="settings" size={24} color={c.text} strokeWidth={2} />
          <Text style={[type.title, { color: c.text }]} accessibilityRole="header">
            설정
          </Text>
        </View>

        <SettingsRow
          icon="apps"
          label="앱 목록 설정"
          subtitle={capabilities.canEnumerateInstalledApps ? '시스템 앱 표시 · 다시 불러오기' : '직접 등록한 앱 관리'}
          onPress={() => router.push('/settings-apps')}
        />
        <SettingsRow icon="lock" label="개인정보 보호" onPress={() => router.push('/privacy')} />
        <SettingsRow
          icon="theme"
          label="테마 설정"
          subtitle={THEME_LABEL[settings.theme]}
          onPress={() => void updateSettings({ theme: NEXT_THEME[settings.theme] })}
        />
        <SettingsRow
          icon="chart"
          label="사용 기록 (선택)"
          subtitle={usageLabel}
          onPress={capabilities.canReadUsageStats ? () => router.push('/usage-access') : undefined}
        />
        <SettingsRow icon="package" label="앱 버전" value={`v${version}`} last />

        <Text style={[styles.group, { color: c.textSecondary }]}>데이터 관리</Text>
        {capabilities.nativeModuleAvailable ? <SettingsRow icon="cache" label="캐시 삭제" onPress={() => setDialog('cache')} /> : null}
        <SettingsRow icon="export" label="데이터 내보내기" onPress={() => setDialog('export')} />
        <SettingsRow icon="reset" label="앱 데이터 초기화" onPress={() => setDialog('reset')} last />
      </ScrollView>

      {dialog ? (
        <ConfirmDialog
          visible
          title={dialogs[dialog].title}
          message={dialogs[dialog].message}
          actions={dialogs[dialog].actions}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 18, paddingBottom: 14 },
  group: { fontFamily: fonts.semibold, fontSize: 12.5, marginTop: 26, marginBottom: 2 },
});
