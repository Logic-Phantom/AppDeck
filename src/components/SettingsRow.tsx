import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

interface Props {
  icon: IconName;
  label: string;
  subtitle?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  last?: boolean;
  tone?: 'default' | 'danger';
}

export function SettingsRow({ icon, label, subtitle, value, right, onPress, showChevron = true, last, tone = 'default' }: Props) {
  const c = useColors();
  const labelColor = tone === 'danger' ? c.danger : c.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[label, subtitle, value].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.row, !last && { borderBottomColor: c.hairline, borderBottomWidth: 1 }, pressed && { opacity: 0.6 }]}
    >
      <Icon name={icon} size={21} color={labelColor} strokeWidth={1.7} />
      <View style={styles.texts}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {subtitle ? <Text style={[styles.sub, { color: c.textTertiary }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[styles.value, { color: c.textTertiary }]}>{value}</Text> : null}
      {right}
      {onPress && showChevron && !right ? <Icon name="chevron-right" size={17} color={c.textSecondary} strokeWidth={1.8} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingVertical: 12 },
  texts: { flex: 1, gap: 3 },
  label: { fontFamily: fonts.semibold, fontSize: 14.5, letterSpacing: -0.2 },
  sub: { fontFamily: fonts.medium, fontSize: 12 },
  value: { fontFamily: fonts.medium, fontSize: 12.5 },
});
