import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';

import { ConfirmDialog, type DialogAction } from '@/components/ConfirmDialog';
import { Screen, TabTitle } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { Toggle } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { shareBackup } from '@/features/settings/export-data';

const SUPPORT_URL = 'https://github.com/Logic-Phantom/AppDeck/issues';

type DialogKind = 'cache' | 'export' | 'reset' | null;

export default function SettingsTab() {
  const c = useColors();
  const router = useRouter();
  const system = useColorScheme();
  const { settings, updateSettings, capabilities, clearIconCache, clearAllData, exportData, showToast } = useAppDeck();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const version = Constants.expoConfig?.version ?? '0.1.0';
  const followSystem = settings.theme === 'system';

  const openSystemSettings = async () => {
    if (Platform.OS === 'web') {
      showToast('웹 미리보기에서는 시스템 설정을 열 수 없어요.');
      return;
    }
    try {
      await Linking.openSettings();
    } catch {
      showToast('시스템 설정을 열 수 없어요.');
    }
  };

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
      <TabTitle title="설정" icon={<Icon name="gear" size={25} color={c.icon} strokeWidth={2} />} />
      <ScrollView contentContainerStyle={styles.content}>

        <SettingsRow icon="bell" label="알림 설정" onPress={() => void openSystemSettings()} />
        <SettingsRow icon="lock" label="개인정보 보호" onPress={() => router.push('/privacy')} />
        <SettingsRow
          icon="clock"
          label="앱 사용 기록"
          subtitle={!capabilities.canReadUsageStats ? '이 기기에서는 지원하지 않아요' : settings.usageStatsEnabled ? '켜짐' : undefined}
          onPress={capabilities.canReadUsageStats ? () => router.push('/usage-access') : () => showToast('이 기기에서는 앱 사용 기록을 읽을 수 없어요.')}
        />
        <SettingsRow
          icon="theme"
          label="테마 설정"
          subtitle="시스템 설정 따르기"
          right={<Toggle value={followSystem} />}
          onPress={() => void updateSettings({ theme: followSystem ? (system === 'dark' ? 'dark' : 'light') : 'system' })}
        />
        {!followSystem ? (
          <SettingsRow
            icon="theme"
            label="화면 모드"
            value={settings.theme === 'dark' ? '다크' : '라이트'}
            onPress={() => void updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          />
        ) : null}
        <SettingsRow icon="shield" label="앱 버전" value={`v${version}`} />
        <SettingsRow icon="help" label="고객센터" onPress={() => void Linking.openURL(SUPPORT_URL)} />
        <SettingsRow icon="terms" label="이용약관 및 개인정보처리방침" onPress={() => router.push('/privacy')} last />

        <Text style={[styles.group, { color: c.textSecondary }]}>앱 관리</Text>
        <SettingsRow
          icon="apps"
          label="앱 목록 설정"
          subtitle={capabilities.canEnumerateInstalledApps ? '시스템 앱 표시 · 다시 불러오기 · 숨긴 앱' : '직접 등록한 앱 관리'}
          onPress={() => router.push('/settings-apps')}
        />
        <SettingsRow icon="star" label="즐겨찾기 편집" onPress={() => router.push('/favorites')} last />

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
  content: { paddingHorizontal: 22, paddingBottom: 32 },
  group: { fontFamily: fonts.bold, fontSize: 13, marginTop: 28, marginBottom: 2 },
});
