import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { CLEANUP_ILLUSTRATION } from '@/design-system/purpose-icons';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';

export default function CleanupDoneScreen() {
  const c = useColors();
  const router = useRouter();
  return (
    <Screen tab="vault">
      <ScreenHeader title="앱 정리" onBack={() => router.dismissTo('/vault')} />
      <View style={styles.center}>
        <Image source={CLEANUP_ILLUSTRATION} style={styles.illust} contentFit="contain" />
        <Text style={[styles.headline, { color: c.text }]}>정리가 완료되었어요!</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>이제 필요한 앱을{'\n'}더 빠르게 찾을 수 있어요.</Text>
      </View>
      <View style={styles.bottom}>
        <PrimaryButton label="확인" onPress={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  illust: { width: 180, height: 180 },
  headline: { fontFamily: fonts.bold, fontSize: 21, marginTop: 24, letterSpacing: -0.5 },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: 'center' },
  bottom: { paddingHorizontal: 20, paddingBottom: 22 },
});
