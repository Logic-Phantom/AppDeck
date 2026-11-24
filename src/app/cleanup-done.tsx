import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { CleanupDoneIllustration } from '@/design-system/brand';
import { useColors } from '@/design-system/theme';
import { fonts, type } from '@/design-system/tokens';

export default function CleanupDoneScreen() {
  const c = useColors();
  const router = useRouter();
  return (
    <Screen tab="settings">
      <Text style={[type.title, styles.title, { color: c.text }]} accessibilityRole="header">
        앱 정리
      </Text>
      <View style={styles.center}>
        <CleanupDoneIllustration size={128} />
        <Text style={[styles.headline, { color: c.text }]}>정리가 완료되었어요!</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>
          이제 필요한 앱을{'\n'}더 빠르게 찾을 수 있어요.
        </Text>
      </View>
      <View style={styles.bottom}>
        <PrimaryButton label="확인" onPress={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: 20, paddingTop: 18 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  headline: { fontFamily: fonts.bold, fontSize: 19, marginTop: 28, letterSpacing: -0.4 },
  body: { fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 21, marginTop: 12, textAlign: 'center' },
  bottom: { paddingHorizontal: 20, paddingBottom: 22 },
});
