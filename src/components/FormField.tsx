import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences';
}

export function FormField({ label, value, onChangeText, placeholder, hint, keyboardType, autoCapitalize }: Props) {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textTertiary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessibilityLabel={label}
        style={[styles.input, { backgroundColor: c.surfaceMuted, color: c.text }]}
      />
      {hint ? <Text style={[styles.hint, { color: c.textTertiary }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontFamily: fonts.medium, fontSize: 14.5 },
  hint: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16 },
});
