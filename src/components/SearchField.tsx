import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon, type IconName } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { cardShadow, fonts } from '@/design-system/tokens';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  trailing?: { icon: IconName; label: string; onPress: () => void } | null;
  autoFocus?: boolean;
  /** compact: 헤더 안 검색창 / muted: 보관함처럼 연한 배경 */
  variant?: 'glass' | 'compact' | 'muted';
}

export function SearchField({ value, onChangeText, onSubmit, placeholder, trailing, autoFocus, variant = 'glass' }: Props) {
  const c = useColors();
  const box =
    variant === 'glass'
      ? [styles.box, cardShadow(c), { backgroundColor: c.glass, borderColor: c.glassBorder }]
      : variant === 'compact'
        ? [styles.box, styles.compact, { backgroundColor: c.surfaceMuted, borderColor: 'transparent' }]
        : [styles.box, styles.muted, { backgroundColor: c.surfaceMuted, borderColor: 'transparent' }];
  return (
    <View style={box}>
      <Icon name="search" size={variant === 'glass' ? 21 : 18} color={c.icon} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={c.textTertiary}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        accessibilityLabel="앱 검색"
        style={[styles.input, { color: c.text, fontSize: variant === 'glass' ? 15 : 14.5 }]}
      />
      {trailing ? (
        <Pressable onPress={trailing.onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={trailing.label}>
          <Icon name={trailing.icon} size={16} color={c.textSecondary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 11, height: 56, borderRadius: 18, paddingHorizontal: 18, borderWidth: 1 },
  compact: { height: 44, borderRadius: 22, paddingHorizontal: 15, gap: 9 },
  muted: { height: 48, borderRadius: 24, paddingHorizontal: 16, gap: 9 },
  input: { flex: 1, fontFamily: fonts.medium, paddingVertical: 0, letterSpacing: -0.2 },
});
