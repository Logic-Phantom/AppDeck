import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

export interface DialogAction {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger' | 'default';
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  actions: DialogAction[];
  onClose: () => void;
}

/** 웹/네이티브 공통 확인 다이얼로그 */
export function ConfirmDialog({ visible, title, message, actions, onClose }: Props) {
  const c = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="닫기">
        <Pressable style={[styles.sheet, { backgroundColor: c.surface }]} onPress={() => undefined}>
          <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
            {title}
          </Text>
          {message ? <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text> : null}
          <View style={styles.actions}>
            {actions.map((a) => {
              const bg = a.tone === 'primary' ? c.primary : a.tone === 'danger' ? c.danger : c.surfaceMuted;
              const fg = a.tone === 'primary' ? c.onPrimary : a.tone === 'danger' ? '#FFFFFF' : c.textSecondary;
              return (
                <Pressable
                  key={a.label}
                  onPress={a.onPress}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.btn, { backgroundColor: bg, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Text style={[styles.btnText, { color: fg }]}>{a.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,12,20,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  sheet: { width: '100%', maxWidth: 360, borderRadius: 20, padding: 22 },
  title: { fontFamily: fonts.bold, fontSize: 17, letterSpacing: -0.3 },
  message: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, marginTop: 8 },
  actions: { gap: 8, marginTop: 20 },
  btn: { height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.semibold, fontSize: 14.5 },
});
