import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, PrimaryButton, SoftButton } from '@/components/ui';
import { Backdrop, BrandTile, RibbonBackdrop } from '@/design-system/brand';
import { Icon, type IconName } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { cardShadow, fonts } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'bolt', title: '모든 앱을 한 번에', body: '앱을 찾는 시간을 절약해요' },
  { icon: 'star-filled', title: '더 스마트한 추천', body: '필요한 앱을 바로 찾아드려요' },
  { icon: 'grid', title: '깔끔한 관리', body: '앱을 정리하고, 더 가볍게' },
];

export default function OnboardingScreen() {
  const c = useColors();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { capabilities, acceptInventoryDisclosure, completeFirstRun } = useAppDeck();
  const [step, setStep] = useState<'brand' | 'consent'>('brand');
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

  if (step === 'brand') {
    return (
      <View style={[styles.root, { backgroundColor: c.canvas }]}>
        <View style={StyleSheet.absoluteFill}>
          <RibbonBackdrop width={width} height={height} />
        </View>
        <SafeAreaView style={styles.root}>
          <View style={styles.brandCenter}>
            <BrandTile size={104} />
            <Text style={[styles.wordmark, { color: c.text }]}>APPDECK</Text>
            <Text style={[styles.tagline, { color: c.textSecondary }]}>지금도, 더 스마트한{'\n'}일상을 시작해보세요</Text>
          </View>
          <Pressable
            onPress={() => setStep('consent')}
            accessibilityRole="button"
            accessibilityLabel="다음"
            style={({ pressed }) => [styles.next, cardShadow(c, 2), { backgroundColor: c.glass, borderColor: c.glassBorder, opacity: pressed ? 0.85 : 1 }]}
          >
            <Icon name="arrow-right" size={24} color={c.icon} strokeWidth={2.2} />
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

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
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <Backdrop />
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <BrandTile size={64} />
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: c.text }]}>APPDECK</Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>모든 앱을, 더 스마트하게</Text>
            </View>
          </View>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <GlassCard key={f.title} style={styles.feature}>
                <Icon name={f.icon} size={26} color={c.accent} strokeWidth={2} />
                <View style={styles.featureTexts}>
                  <Text style={[styles.featureTitle, { color: c.text }]}>{f.title}</Text>
                  <Text style={[styles.featureBody, { color: c.textSecondary }]}>{f.body}</Text>
                </View>
              </GlassCard>
            ))}
          </View>

          <GlassCard style={styles.card}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{disclosure.title}</Text>
            <Text style={[styles.cardBody, { color: c.textSecondary }]}>{disclosure.body}</Text>
          </GlassCard>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  brandCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  wordmark: { fontFamily: fonts.bold, fontSize: 36, letterSpacing: 0.6, marginTop: 30 },
  tagline: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 25, marginTop: 14, textAlign: 'center' },
  next: { position: 'absolute', right: 26, bottom: 34, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerText: { gap: 4 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 28, letterSpacing: 0.4 },
  headerSub: { fontFamily: fonts.medium, fontSize: 15, letterSpacing: -0.3 },
  features: { gap: 10, marginTop: 28 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 30 },
  featureTexts: { gap: 3 },
  featureTitle: { fontFamily: fonts.bold, fontSize: 14.5 },
  featureBody: { fontFamily: fonts.medium, fontSize: 12.5 },
  card: { padding: 18, marginTop: 20, gap: 10 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15.5 },
  cardBody: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 21 },
  actions: { paddingHorizontal: 20, paddingBottom: 18, gap: 8 },
});
