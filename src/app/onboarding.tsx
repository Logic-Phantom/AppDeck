import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SoftButton } from '@/components/ui';
import { BrandTile } from '@/design-system/brand';
import { Icon, type IconName } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'bolt', title: '스마트 검색', body: '목적에 맞는 앱을 빠르게' },
  { icon: 'grid', title: '앱 보관함', body: '내 앱을 한눈에' },
  { icon: 'star', title: '즐겨찾기', body: '자주 쓰는 앱만' },
  { icon: 'broom', title: '앱 정리', body: '안 쓰는 앱은 깔끔하게' },
];

export default function OnboardingScreen() {
  const c = useColors();
  const router = useRouter();
  const { capabilities, acceptInventoryDisclosure, completeFirstRun } = useAppDeck();
  const [busy, setBusy] = useState(false);

  const finish = async (accept: boolean) => {
    setBusy(true);
    try {
      if (accept) await acceptInventoryDisclosure();
      await completeFirstRun();
      router.replace(accept || capabilities.canEnumerateInstalledApps ? '/' : '/add-app');
    } finally {
      setBusy(false);
    }
  };

  const disclosure = (() => {
    if (capabilities.isDemo) {
      return {
        title: '웹 미리보기',
        body: '웹에서는 다른 앱을 확인하거나 실행할 수 없어요. 화면 구성을 볼 수 있도록 가상 앱 목록을 보여 드려요. 실제 기능은 Android 앱에서 동작해요.',
        accept: '가상 데이터로 둘러보기',
      };
    }
    if (capabilities.platform === 'android' && capabilities.canEnumerateInstalledApps) {
      return {
        title: '설치된 앱 목록 확인 안내',
        body:
          '앱덱은 휴대폰에 설치된 앱을 검색하고 카테고리별로 정리해 실행할 수 있도록, 앱 이름·아이콘·패키지 정보 등 앱 목록을 기기에서 확인합니다.\n\n' +
          '이 정보는 앱덱 화면 구성과 검색·실행을 위해 기기 안에서만 사용하며 서버, 광고, 분석 목적으로 전송하거나 공유하지 않습니다.\n\n' +
          '동의하지 않으면 직접 등록한 앱만 관리할 수 있어요. 설정에서 언제든 데이터를 삭제할 수 있어요.',
        accept: '동의하고 내 앱 불러오기',
      };
    }
    return {
      title: capabilities.platform === 'ios' ? 'iPhone에서는 직접 등록해요' : '앱 목록 모듈이 없는 빌드예요',
      body: capabilities.limitationNote + '\n\n등록한 앱의 이름·분류·링크는 기기 안에만 저장돼요.',
      accept: null,
    };
  })();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.canvas }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <BrandTile size={72} />
          <View style={styles.brandText}>
            <Text style={[styles.wordmark, { color: c.text }]}>APPDECK</Text>
            <Text style={[styles.slogan, { color: c.textSecondary }]}>찾지 말고, 여기서 한 번에.</Text>
          </View>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={f.title} style={[styles.feature, i > 0 && { borderLeftWidth: 1, borderLeftColor: c.hairline }]}>
              <Icon name={f.icon} size={26} color={c.text} strokeWidth={1.5} />
              <Text style={[styles.featureTitle, { color: c.text }]}>{f.title}</Text>
              <Text style={[styles.featureBody, { color: c.textTertiary }]}>{f.body}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: c.surfaceMuted }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{disclosure.title}</Text>
          <Text style={[styles.cardBody, { color: c.textSecondary }]}>{disclosure.body}</Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {disclosure.accept ? (
          <>
            <PrimaryButton label={disclosure.accept} disabled={busy} onPress={() => void finish(true)} />
            {!capabilities.isDemo ? <SoftButton label="동의하지 않고 시작하기" disabled={busy} onPress={() => void finish(false)} /> : null}
          </>
        ) : (
          <PrimaryButton label="앱 직접 등록하며 시작하기" disabled={busy} onPress={() => void finish(false)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 36, paddingBottom: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  brandText: { gap: 6 },
  wordmark: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: 0.4 },
  slogan: { fontFamily: fonts.medium, fontSize: 15, letterSpacing: -0.3 },
  features: { flexDirection: 'row', marginTop: 34 },
  feature: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  featureTitle: { fontFamily: fonts.bold, fontSize: 12.5, marginTop: 4 },
  featureBody: { fontFamily: fonts.medium, fontSize: 10.5, textAlign: 'center' },
  card: { borderRadius: 16, padding: 18, marginTop: 32, gap: 10 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15.5 },
  cardBody: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 21 },
  actions: { paddingHorizontal: 22, paddingBottom: 18, gap: 8 },
});
