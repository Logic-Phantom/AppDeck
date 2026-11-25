import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

export type TabKey = 'home' | 'search' | 'vault' | 'settings';

const TABS: { key: TabKey; label: string; icon: IconName; activeIcon: IconName; href: string }[] = [
  { key: 'home', label: '홈', icon: 'home', activeIcon: 'home-filled', href: '/' },
  { key: 'search', label: '검색', icon: 'search', activeIcon: 'search', href: '/search' },
  { key: 'vault', label: '보관함', icon: 'vault', activeIcon: 'vault-filled', href: '/vault' },
  { key: 'settings', label: '설정', icon: 'gear', activeIcon: 'gear-filled', href: '/settings' },
];

/** 레퍼런스 v2 하단 4탭 (홈·검색·보관함·설정). 탭 화면과 하위 스택 화면 모두에서 같은 모양으로 쓴다. */
export function BottomTabBar({ active, onSelect }: { active: TabKey | null; onSelect?: (key: TabKey) => void }) {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.bar, { backgroundColor: c.surface, borderTopColor: c.hairline, paddingBottom: Math.max(insets.bottom, 10) }]}
      accessibilityRole="tablist"
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        const color = isActive ? c.icon : c.textTertiary;
        return (
          <Pressable
            key={t.key}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t.label}
            hitSlop={6}
            onPress={() => {
              if (onSelect) onSelect(t.key);
              else router.dismissTo(t.href as never);
            }}
          >
            <Icon
              name={isActive ? t.activeIcon : t.icon}
              color={color}
              size={22}
              strokeWidth={isActive ? 2.3 : 1.7}
              holeColor={c.surface}
            />
            <Text style={[styles.label, { color, fontFamily: isActive ? fonts.bold : fonts.medium }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 9, paddingHorizontal: 8 },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  label: { fontSize: 11, letterSpacing: -0.2 },
});
