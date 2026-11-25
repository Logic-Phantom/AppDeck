import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { CLEANUP_ILLUSTRATION } from '@/design-system/purpose-icons';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { cleanupMessage, useCleanupData } from '@/features/cleanup/useCleanupData';

/** 레퍼런스 v2 "앱 정리" 안내 화면 */
export default function CleanupIntroScreen() {
  const c = useColors();
  const router = useRouter();
  const data = useCleanupData();
  const msg = cleanupMessage(data);

  return (
    <Screen tab="vault">
      <ScreenHeader
        title="앱 정리"
        right={
          <Pressable onPress={() => router.push('/settings-apps')} hitSlop={10} accessibilityRole="button" accessibilityLabel="숨긴 앱·앱 목록 설정">
            <Icon name="more" size={22} color={c.text} />
          </Pressable>
        }
      />
      <View style={styles.center}>
        <Image source={CLEANUP_ILLUSTRATION} style={styles.illust} contentFit="contain" />
        <Text style={[styles.headline, { color: c.text }]}>{msg.headline}</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>{msg.body}</Text>
      </View>
      <View style={styles.bottom}>
        <PrimaryButton
          label={msg.hasWork ? '지금 정리하기' : '정리 후보 고르러 가기'}
          onPress={() => (msg.hasWork ? router.push('/cleanup-select') : router.navigate('/vault'))}
        />
        <Text style={[styles.note, { color: c.textTertiary }]}>앱덱은 다른 앱을 직접 삭제하지 않아요.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 30 },
  illust: { width: 180, height: 180 },
  headline: { fontFamily: fonts.bold, fontSize: 21, marginTop: 24, letterSpacing: -0.5 },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: 'center' },
  bottom: { paddingHorizontal: 20, paddingBottom: 18, gap: 10 },
  note: { fontFamily: fonts.regular, fontSize: 11.5, textAlign: 'center' },
});
