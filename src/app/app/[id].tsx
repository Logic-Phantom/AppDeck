import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen, ScreenHeader } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { EmptyState, PrimaryButton, Toggle } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { effectiveCategory, needsCategoryReview } from '@/domain/apps/app.types';
import { CATEGORY_CATALOG, getCategory } from '@/domain/categories/category.catalog';
import { CLEANUP_REASON_LABEL } from '@/domain/cleanup/cleanup-rules';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const SOURCE_LABEL = { device_scan: '기기에서 확인됨', manual: '사용자가 직접 등록', demo: '웹 미리보기 가상 데이터' } as const;
const INSTALL_LABEL = {
  device_confirmed: '설치됨 (기기 확인)',
  removed: '기기에서 찾을 수 없음',
  unknown: '설치 여부 확인 불가',
  user_marked_installed: '설치됨 (직접 표시)',
  open_confirmed: '최근 실행 요청 성공',
} as const;

function formatDate(ms: number | null) {
  if (!ms) return '정보 없음';
  const d = new Date(ms);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export default function AppDetailScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getApp, launchApp, toggleFavorite, setCategory, updateApp, setCleanupCandidate, openAppSettings, deleteApp, capabilities } = useAppDeck();
  const app = getApp(id);
  const [pickCategory, setPickCategory] = useState(false);
  const [aliasInput, setAliasInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!app) {
    return (
      <Screen>
        <ScreenHeader title="앱 정보" />
        <EmptyState title="앱을 찾을 수 없어요" body="목록이 새로고침되면서 사라졌을 수 있어요." />
      </Screen>
    );
  }
  const category = getCategory(effectiveCategory(app));
  const review = needsCategoryReview(app);

  const addAlias = () => {
    const v = aliasInput.trim();
    if (!v || app.aliases.includes(v)) return;
    void updateApp(app.id, { aliases: [...app.aliases, v] });
    setAliasInput('');
  };

  return (
    <Screen>
      <ScreenHeader
        title="앱 정보"
        right={
          <Pressable onPress={() => void toggleFavorite(app.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={app.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}>
            <Icon name={app.isFavorite ? 'star-filled' : 'star'} size={23} color={app.isFavorite ? '#F5B400' : c.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <AppIcon app={app} size={72} />
          <Text style={[styles.name, { color: c.text }]}>{app.displayName}</Text>
          <Text style={[styles.meta, { color: c.textTertiary }]}>
            {SOURCE_LABEL[app.source]} · {INSTALL_LABEL[app.installationStatus]}
          </Text>
        </View>

        <PrimaryButton label="앱 열기" onPress={() => void launchApp(app)} disabled={app.installationStatus === 'removed'} />
        {app.appDeckLaunchCount > 0 ? (
          <Text style={[styles.count, { color: c.textTertiary }]}>앱덱에서 실행한 횟수 {app.appDeckLaunchCount}회</Text>
        ) : null}

        <View style={styles.group}>
          <SettingsRow
            icon="grid"
            label="카테고리"
            subtitle={review ? `${category.name} · 분류 확인 필요` : `${category.name}${app.userCategoryId ? ' · 직접 지정' : ' · 자동 분류'}`}
            onPress={() => setPickCategory((v) => !v)}
          />
          {pickCategory ? (
            <View style={styles.chips}>
              {CATEGORY_CATALOG.map((cat) => {
                const active = cat.id === effectiveCategory(app);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      void setCategory(app.id, cat.id);
                      setPickCategory(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.chip, { backgroundColor: active ? c.primary : c.surfaceMuted }]}
                  >
                    <Text style={[styles.chipText, { color: active ? c.onPrimary : c.text }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
              {app.userCategoryId ? (
                <Pressable onPress={() => void setCategory(app.id, null)} style={[styles.chip, { backgroundColor: c.accentSoft }]} accessibilityRole="button">
                  <Text style={[styles.chipText, { color: c.accent }]}>자동 분류로 되돌리기</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.aliasBox, { borderBottomColor: c.hairline }]}>
            <Text style={[styles.aliasTitle, { color: c.text }]}>별칭</Text>
            <Text style={[styles.aliasHint, { color: c.textTertiary }]}>검색할 때 쓰는 다른 이름이에요. 예: 배민, 지도</Text>
            <View style={styles.aliasList}>
              {app.aliases.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => void updateApp(app.id, { aliases: app.aliases.filter((x) => x !== a) })}
                  style={[styles.chip, { backgroundColor: c.surfaceMuted }]}
                  accessibilityRole="button"
                  accessibilityLabel={`별칭 ${a} 삭제`}
                >
                  <Text style={[styles.chipText, { color: c.text }]}>{a} ✕</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.aliasInputRow, { backgroundColor: c.surfaceMuted }]}>
              <TextInput
                value={aliasInput}
                onChangeText={setAliasInput}
                onSubmitEditing={addAlias}
                placeholder="별칭 추가"
                placeholderTextColor={c.textTertiary}
                style={[styles.aliasInput, { color: c.text }]}
                accessibilityLabel="별칭 입력"
              />
              <Pressable onPress={addAlias} hitSlop={8} accessibilityRole="button" accessibilityLabel="별칭 추가">
                <Icon name="plus" size={18} color={c.text} />
              </Pressable>
            </View>
          </View>

          <SettingsRow
            icon="broom"
            label="정리 후보로 표시"
            subtitle={app.isCleanupCandidate ? CLEANUP_REASON_LABEL[app.cleanupReason ?? 'manual'] : '정리 화면에서 한 번에 검토해요'}
            right={<Toggle value={app.isCleanupCandidate} />}
            onPress={() => void setCleanupCandidate([app.id], !app.isCleanupCandidate)}
          />
          <SettingsRow
            icon="eye-off"
            label="앱덱에서 숨기기"
            subtitle="휴대폰에서 앱이 삭제되지는 않아요"
            right={<Toggle value={app.isHidden} />}
            onPress={() => void updateApp(app.id, { isHidden: !app.isHidden })}
          />
          {capabilities.canOpenAppSettings && app.packageName ? (
            <SettingsRow icon="settings" label="시스템 앱 정보 열기" subtitle="저장공간·권한·삭제는 시스템 화면에서" onPress={() => void openAppSettings(app)} />
          ) : null}
          {app.source === 'manual' ? (
            <SettingsRow icon="link" label="실행 링크" subtitle={app.launchUrl ?? '등록된 링크 없음'} onPress={() => router.push({ pathname: '/add-app', params: { id: app.id } })} />
          ) : null}
          {app.source === 'manual' ? (
            <SettingsRow icon="cache" label="등록 삭제" tone="danger" showChevron={false} onPress={() => setConfirmDelete(true)} last />
          ) : null}
        </View>

        {app.packageName ? (
          <View style={styles.tech}>
            <Text style={[styles.techText, { color: c.textTertiary }]}>패키지명 {app.packageName}</Text>
            {app.versionName ? <Text style={[styles.techText, { color: c.textTertiary }]}>버전 {app.versionName}</Text> : null}
            {app.source === 'device_scan' ? (
              <Text style={[styles.techText, { color: c.textTertiary }]}>
                설치 {formatDate(app.firstInstallTime)} · 업데이트 {formatDate(app.lastUpdateTime)} (사용 날짜 아님)
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        title="이 앱 등록을 삭제할까요?"
        message="앱덱에 등록한 정보만 삭제돼요."
        onClose={() => setConfirmDelete(false)}
        actions={[
          { label: '삭제', tone: 'danger', onPress: () => { setConfirmDelete(false); void deleteApp(app.id).then(() => router.back()); } },
          { label: '취소', onPress: () => setConfirmDelete(false) },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  hero: { alignItems: 'center', paddingVertical: 18, gap: 8 },
  name: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.4, marginTop: 6 },
  meta: { fontFamily: fonts.medium, fontSize: 12 },
  count: { fontFamily: fonts.medium, fontSize: 11.5, textAlign: 'center', marginTop: 8 },
  group: { marginTop: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingVertical: 10 },
  chip: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { fontFamily: fonts.semibold, fontSize: 12.5 },
  aliasBox: { paddingVertical: 14, borderBottomWidth: 1, gap: 6 },
  aliasTitle: { fontFamily: fonts.semibold, fontSize: 14.5 },
  aliasHint: { fontFamily: fonts.regular, fontSize: 12 },
  aliasList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  aliasInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 42, marginTop: 4 },
  aliasInput: { flex: 1, fontFamily: fonts.medium, fontSize: 14 },
  tech: { marginTop: 20, gap: 4 },
  techText: { fontFamily: fonts.regular, fontSize: 11.5 },
});
