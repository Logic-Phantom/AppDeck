import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon, type IconName } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  trailing?: { icon: IconName; label: string; onPress: () => void } | null;
  autoFocus?: boolean;
  compact?: boolean;
}

export function SearchField({ value, onChangeText, onSubmit, placeholder, trailing, autoFocus, compact }: Props) {
  const c = useColors();
  return (
    <View style={[styles.box, compact && styles.compact, { backgroundColor: c.surfaceMuted }]}>
      {!compact ? <Icon name="search" size={19} color={c.textSecondary} strokeWidth={1.9} /> : null}
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
        style={[styles.input, { color: c.text }]}
      />
      {trailing ? (
        <Pressable onPress={trailing.onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={trailing.label}>
          <Icon name={trailing.icon} size={compact ? 15 : 19} color={c.textSecondary} strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: 14, paddingHorizontal: 16 },
  compact: { height: 42, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, fontFamily: fonts.medium, fontSize: 14.5, paddingVertical: 0, letterSpacing: -0.2 },
});
