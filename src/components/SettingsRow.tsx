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
  const color = tone === 'danger' ? c.danger : c.icon;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={[label, subtitle, value].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.row, !last && { borderBottomColor: c.hairline, borderBottomWidth: 1 }, pressed && { opacity: 0.6 }]}
    >
      <Icon name={icon} size={23} color={color} strokeWidth={1.9} />
      <View style={styles.texts}>
        <Text style={[styles.label, { color: tone === 'danger' ? c.danger : c.text }]}>{label}</Text>
        {subtitle ? <Text style={[styles.sub, { color: c.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[styles.value, { color: c.textSecondary }]}>{value}</Text> : null}
      {right}
      {onPress && showChevron && !right ? <Icon name="chevron-right" size={19} color={c.icon} strokeWidth={2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 62, paddingVertical: 12 },
  texts: { flex: 1, gap: 3 },
  label: { fontFamily: fonts.bold, fontSize: 15.5, letterSpacing: -0.3 },
  sub: { fontFamily: fonts.medium, fontSize: 12.5 },
  value: { fontFamily: fonts.medium, fontSize: 13.5 },
});
