import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { CATEGORY_CATALOG } from '@/domain/categories/category.catalog';
import type { AppCategoryId } from '@/domain/categories/category.types';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

function normalizeUrl(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
}

/** 수동 앱 등록 (iOS 기본 경로 / Android 동의 거부 시 / 웹). 설치 여부는 "확인 불가"로 저장된다. */
export default function AddAppScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addManualApp, getApp, updateApp, capabilities } = useAppDeck();
  const editing = id ? getApp(id) : undefined;
  const [name, setName] = useState(editing?.displayName ?? '');
  const [url, setUrl] = useState(editing?.launchUrl ?? '');
  const [aliases, setAliases] = useState(editing?.aliases.join(', ') ?? '');
  const [category, setCategory] = useState<AppCategoryId>(editing?.userCategoryId ?? 'other');

  const save = async () => {
    const aliasList = aliases.split(',').map((a) => a.trim()).filter(Boolean);
    if (editing) {
      await updateApp(editing.id, { displayName: name.trim(), launchUrl: normalizeUrl(url), aliases: aliasList, userCategoryId: category });
    } else {
      await addManualApp({ displayName: name, categoryId: category, launchUrl: normalizeUrl(url), aliases: aliasList });
    }
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <ScreenHeader title={editing ? '등록 정보 수정' : '앱 직접 등록'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {capabilities.platform === 'ios' ? (
            <Text style={[styles.notice, { color: c.textSecondary, backgroundColor: c.surfaceMuted }]}>
              iPhone은 다른 앱이 설치 앱 목록을 읽을 수 없어요. 등록한 앱은 ‘설치 여부 확인 불가’로 표시되고, 등록한 링크로 실행해요.
            </Text>
          ) : null}
          <FormField label="앱 이름" value={name} onChangeText={setName} placeholder="예: 배달의민족" />
          <FormField
            label="실행 링크 (선택)"
            value={url}
            onChangeText={setUrl}
            placeholder="예: https://… 또는 서비스가 공개한 앱 링크"
            hint="서비스가 공식으로 제공하는 Universal Link나 URL을 입력해요. 링크가 열리지 않으면 안내해 드려요."
            autoCapitalize="none"
            keyboardType="url"
          />
          <FormField label="별칭 (선택, 쉼표로 구분)" value={aliases} onChangeText={setAliases} placeholder="예: 배민, 배달" />

          <View style={styles.catWrap}>
            <Text style={[styles.label, { color: c.textSecondary }]}>카테고리</Text>
            <View style={styles.chips}>
              {CATEGORY_CATALOG.map((cat) => {
                const active = cat.id === category;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.chip, { backgroundColor: active ? c.primary : c.surfaceMuted }]}
                  >
                    <Text style={[styles.chipText, { color: active ? c.onPrimary : c.text }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <PrimaryButton label={editing ? '저장하기' : '등록하기'} disabled={!name.trim()} onPress={() => void save()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 18, paddingBottom: 40 },
  notice: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 19, padding: 14, borderRadius: 12, overflow: 'hidden' },
  label: { fontFamily: fonts.semibold, fontSize: 12.5 },
  catWrap: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 },
  chipText: { fontFamily: fonts.semibold, fontSize: 12.5 },
});
