import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { cardShadow, fonts, radius, type } from '@/design-system/tokens';

/** 반투명 흰 글래스 카드 */
export function GlassCard({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const c = useColors();
  const base = [styles.glass, cardShadow(c), { backgroundColor: c.glass, borderColor: c.glassBorder }];
  if (!onPress) return <View style={[...base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [...base, style, pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 }]}
    >
      {children}
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.primary, cardShadow(c), { backgroundColor: c.primary, opacity: disabled ? 0.35 : pressed ? 0.88 : 1 }]}
    >
      <Text style={[styles.primaryText, { color: c.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function SoftButton({ label, onPress, disabled, tone = 'default' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'default' | 'danger' }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.soft, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[styles.softText, { color: tone === 'danger' ? c.danger : disabled ? c.textTertiary : c.icon }]}>{label}</Text>
    </Pressable>
  );
}

/** "열기", "정리하기" 같은 작은 알약 버튼 */
export function PillButton({ label, onPress, accessibilityLabel, icon }: { label: string; onPress: () => void; accessibilityLabel?: string; icon?: 'chevron-down' | 'chevron-right' }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.pill, { backgroundColor: pressed ? c.surfacePressed : c.accentSoft }]}
    >
      <Text style={[styles.pillText, { color: c.icon }]}>{label}</Text>
      {icon ? <Icon name={icon} size={14} color={c.icon} strokeWidth={2.2} /> : null}
    </Pressable>
  );
}

export interface PillTab<K extends string> {
  key: K;
  label: string;
}

/** 레퍼런스의 알약형 탭: 선택 탭은 연한 블루 알약 + 네이비 밑줄 */
export function PillTabs<K extends string>({ tabs, value, onChange }: { tabs: PillTab<K>[]; value: K; onChange: (k: K) => void }) {
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.tabItem}
          >
            <View style={[styles.tabPill, active && { backgroundColor: c.pill }]}>
              <Text style={[styles.tabText, { color: active ? c.text : c.textSecondary, fontFamily: active ? fonts.bold : fonts.medium }]}>
                {t.label}
              </Text>
            </View>
            <View style={[styles.tabLine, { backgroundColor: active ? c.icon : 'transparent' }]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SectionHeader({ title, actionLabel, onAction, actionChevron }: { title: string; actionLabel?: string; onAction?: () => void; actionChevron?: boolean }) {
  const c = useColors();
  return (
    <View style={styles.section}>
      <Text style={[type.section, { color: c.text }]} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        actionChevron ? (
          <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" style={styles.more}>
            <Text style={[styles.moreText, { color: c.textTertiary }]}>{actionLabel}</Text>
            <Icon name="chevron-right" size={13} color={c.textTertiary} strokeWidth={2} />
          </Pressable>
        ) : (
          <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" style={[styles.tag, { backgroundColor: c.accentSoft }]}>
            <Text style={[styles.tagText, { color: c.icon }]}>{actionLabel}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.empty}>
      <Text style={[type.bodyStrong, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      {body ? <Text style={[styles.emptyBody, { color: c.textSecondary }]}>{body}</Text> : null}
      {action}
    </View>
  );
}

export function Checkbox({ checked }: { checked: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.check, { borderColor: checked ? c.accent : c.textTertiary, backgroundColor: checked ? c.accent : 'transparent' }]}>
      {checked ? <Icon name="check" size={13} color="#FFFFFF" strokeWidth={2.6} /> : null}
    </View>
  );
}

export function Toggle({ value }: { value: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.toggle, { backgroundColor: value ? c.accent : c.surfacePressed }]}>
      <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glass: { borderRadius: radius.lg, borderWidth: 1 },
  primary: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fonts.bold, fontSize: 15.5 },
  soft: { height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  softText: { fontFamily: fonts.semibold, fontSize: 15 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 15, height: 34, borderRadius: 999, justifyContent: 'center' },
  pillText: { fontFamily: fonts.bold, fontSize: 13 },
  tabs: { paddingHorizontal: 18, gap: 6 },
  tabItem: { alignItems: 'center' },
  tabPill: { paddingHorizontal: 16, height: 36, borderRadius: 999, justifyContent: 'center' },
  tabText: { fontSize: 14.5, letterSpacing: -0.3 },
  tabLine: { height: 2.5, width: 34, borderRadius: 2, marginTop: 3 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontFamily: fonts.medium, fontSize: 12.5 },
  tag: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 },
  tagText: { fontFamily: fonts.bold, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, gap: 6 },
  emptyBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
});
