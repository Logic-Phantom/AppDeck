import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/design-system/CategoryIcon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { effectiveCategory, type AppEntry } from '@/domain/apps/app.types';
import { CATEGORY_CATALOG, getCategory } from '@/domain/categories/category.catalog';
import type { AppCategoryId } from '@/domain/categories/category.types';
import { searchApps } from '@/domain/search/search-engine';

import { AppIcon } from './AppIcon';
import { SearchField } from './SearchField';
import { Checkbox, PrimaryButton } from './ui';

function Sheet({ visible, onClose, title, subtitle, children, footer }: { visible: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기" />
      <View style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={[styles.grabber, { backgroundColor: c.border }]} />
        <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
        {footer}
      </View>
    </Modal>
  );
}

/** 앱을 다른 카테고리로 옮길 때 고르는 시트 */
export function CategoryPickerSheet({
  visible,
  title,
  subtitle,
  excludeId,
  showAutoReset,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  excludeId?: AppCategoryId;
  /** 사용자가 직접 지정한 분류가 있을 때 "자동 분류로 되돌리기" 노출 */
  showAutoReset?: boolean;
  onPick: (id: AppCategoryId | null) => void;
  onClose: () => void;
}) {
  const c = useColors();
  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <ScrollView contentContainerStyle={styles.catGrid}>
        {CATEGORY_CATALOG.filter((cat) => cat.id !== excludeId).map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => onPick(cat.id)}
            accessibilityRole="button"
            accessibilityLabel={`${cat.name}로 옮기기`}
            style={({ pressed }) => [styles.catChip, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted }]}
          >
            <CategoryIcon id={cat.id} size={28} />
            <Text style={[styles.catText, { color: c.text }]} numberOfLines={1}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
        {showAutoReset ? (
          <Pressable
            onPress={() => onPick(null)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.catChip, styles.reset, { backgroundColor: pressed ? c.surfacePressed : c.accentSoft }]}
          >
            <Text style={[styles.catText, { color: c.accent }]}>자동 분류로 되돌리기</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

/** 이 카테고리에 넣을 앱을 여러 개 고르는 시트 */
export function AppPickerSheet({
  visible,
  categoryId,
  apps,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  categoryId: AppCategoryId;
  /** 후보 앱 (보통 이 카테고리에 없는 앱 전체) */
  apps: AppEntry[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}) {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const list = useMemo(() => (query.trim() ? searchApps(apps, query).hits.map((h) => h.app) : apps), [apps, query]);
  const name = getCategory(categoryId).name;
  const close = () => {
    setSelected([]);
    setQuery('');
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={`${name}에 앱 넣기`}
      subtitle="고른 앱은 이 카테고리로 옮겨지고, 다음에 앱 목록을 새로 불러와도 유지돼요."
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            label={selected.length ? `${selected.length}개 넣기` : '앱을 골라 주세요'}
            disabled={!selected.length}
            onPress={() => {
              onConfirm(selected);
              setSelected([]);
              setQuery('');
            }}
          />
        </View>
      }
    >
      <View style={styles.search}>
        <SearchField variant="muted" value={query} onChangeText={setQuery} placeholder="앱 이름 검색" />
      </View>
      <FlatList
        data={list}
        keyExtractor={(a) => a.id}
        style={styles.appList}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={[styles.empty, { color: c.textTertiary }]}>넣을 수 있는 앱이 없어요.</Text>}
        renderItem={({ item }) => {
          const checked = selected.includes(item.id);
          return (
            <Pressable
              onPress={() => setSelected((s) => (checked ? s.filter((x) => x !== item.id) : [...s, item.id]))}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={`${item.displayName}, 현재 ${getCategory(effectiveCategory(item)).name}`}
              style={styles.appRow}
            >
              <AppIcon app={item} size={40} />
              <View style={styles.appTexts}>
                <Text style={[styles.appName, { color: c.text }]} numberOfLines={1}>
                  {item.displayName}
                </Text>
                <Text style={[styles.appCat, { color: c.textTertiary }]} numberOfLines={1}>
                  지금: {getCategory(effectiveCategory(item)).name}
                </Text>
              </View>
              <Checkbox checked={checked} />
            </Pressable>
          );
        }}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,12,30,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '86%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 14 },
  title: { fontFamily: fonts.bold, fontSize: 18, paddingHorizontal: 22, letterSpacing: -0.4 },
  subtitle: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 18, paddingHorizontal: 22, marginTop: 6 },
  body: { flexShrink: 1, marginTop: 14 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: 18, paddingBottom: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, borderRadius: 16, paddingHorizontal: 12, width: '48%' },
  reset: { width: '100%', justifyContent: 'center' },
  catText: { fontFamily: fonts.bold, fontSize: 13.5, letterSpacing: -0.3, flexShrink: 1 },
  search: { paddingHorizontal: 18, marginBottom: 6 },
  appList: { flexGrow: 0 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingVertical: 9 },
  appTexts: { flex: 1, gap: 2 },
  appName: { fontFamily: fonts.bold, fontSize: 15 },
  appCat: { fontFamily: fonts.medium, fontSize: 12 },
  empty: { fontFamily: fonts.medium, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  footer: { paddingHorizontal: 18, paddingTop: 12 },
});
