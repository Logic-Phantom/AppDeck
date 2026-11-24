import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts, radius, type } from '@/design-system/tokens';

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.primary, { backgroundColor: c.primary, opacity: disabled ? 0.35 : pressed ? 0.85 : 1 }]}
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
      style={({ pressed }) => [
        styles.soft,
        { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={[styles.softText, { color: tone === 'danger' ? c.danger : disabled ? c.textTertiary : c.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

/** "열기" 같은 작은 알약 버튼 */
export function PillButton({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel?: string }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.pill, { backgroundColor: pressed ? c.surfacePressed : c.surfaceMuted }]}
    >
      <Text style={[styles.pillText, { color: c.text }]}>{label}</Text>
    </Pressable>
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
          <Pressable
            onPress={onAction}
            hitSlop={10}
            accessibilityRole="button"
            style={[styles.tag, { backgroundColor: c.surfaceMuted }]}
          >
            <Text style={[styles.tagText, { color: c.textSecondary }]}>{actionLabel}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, style]}>{children}</View>;
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
    <View
      style={[
        styles.check,
        { borderColor: checked ? c.accent : c.textTertiary, backgroundColor: checked ? c.accent : 'transparent' },
      ]}
    >
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
  primary: { height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: fonts.semibold, fontSize: 15 },
  soft: { height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  softText: { fontFamily: fonts.semibold, fontSize: 14.5 },
  pill: { paddingHorizontal: 13, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontFamily: fonts.semibold, fontSize: 12.5 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontFamily: fonts.medium, fontSize: 12 },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontFamily: fonts.semibold, fontSize: 11.5 },
  card: { borderRadius: radius.md, borderWidth: 1, padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, gap: 6 },
  emptyBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  check: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
});
