import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/design-system/brand';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts, type } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

import { BottomTabBar, type TabKey } from './BottomTabBar';

interface ScreenProps {
  children: ReactNode;
  /** 하단 탭바 표시. 탭 레이아웃이 직접 그리는 탭 화면은 undefined */
  tab?: TabKey | null;
  /** 배경 위에 그릴 장식(물결 등) */
  decoration?: ReactNode;
}

export function Screen({ children, tab, decoration }: ScreenProps) {
  const c = useColors();
  const { toast, capabilities } = useAppDeck();
  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <Backdrop />
      {decoration}
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
        {capabilities.isDemo ? (
          <View style={[styles.demo, { backgroundColor: c.accentSoft }]} accessibilityRole="text">
            <Text style={[styles.demoText, { color: c.accent }]}>웹 미리보기 · 가상 앱 데이터</Text>
          </View>
        ) : null}
        <View style={styles.body}>{children}</View>
        {toast ? (
          <View pointerEvents="none" style={[styles.toast, { backgroundColor: c.primary }]} accessibilityLiveRegion="polite">
            <Text style={[styles.toastText, { color: c.onPrimary }]}>{toast}</Text>
          </View>
        ) : null}
        {tab !== undefined ? <BottomTabBar active={tab} /> : null}
      </SafeAreaView>
    </View>
  );
}

interface HeaderProps {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
  /** 레퍼런스 "카테고리"처럼 제목 가운데 정렬 */
  centered?: boolean;
}

export function ScreenHeader({ title, right, onBack, centered }: HeaderProps) {
  const c = useColors();
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        style={styles.back}
      >
        <Icon name="chevron-left" color={c.text} size={24} strokeWidth={2.1} />
      </Pressable>
      <Text
        style={[styles.headerTitle, { color: c.text, textAlign: centered ? 'center' : 'left' }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

/** 탭 화면 상단의 큰 제목 (레퍼런스 "앱 보관함", "설정") */
export function TabTitle({ title, icon, right }: { title: string; icon?: ReactNode; right?: ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.tabTitle}>
      {icon}
      <Text style={[type.title, styles.tabTitleText, { color: c.text }]} accessibilityRole="header">
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  demo: { alignSelf: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  demoText: { fontFamily: fonts.semibold, fontSize: 10.5 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 54, gap: 8 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...type.title, fontSize: 17.5, flex: 1 },
  headerRight: { minWidth: 32, alignItems: 'flex-end' },
  tabTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 14 },
  tabTitleText: { flex: 1, fontSize: 21 },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 100,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: { fontFamily: fonts.medium, fontSize: 13.5, textAlign: 'center' },
});
