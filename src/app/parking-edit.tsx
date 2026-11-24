import { Directory, File, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { Screen, ScreenHeader } from '@/components/Screen';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import type { ParkingFeeRule, ParkingSession } from '@/domain/parking/parking';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { createId } from '@/shared/ids';

const MAX_PHOTOS = 3;

/** 사용자가 고른 사진만 앱 전용 폴더로 복사한다(웹은 브라우저 URI 그대로). */
function persistPhoto(uri: string): string {
  if (Platform.OS === 'web') return uri;
  const dir = new Directory(Paths.document, 'parking');
  if (!dir.exists) dir.create();
  const target = new File(dir, `${createId()}.jpg`);
  new File(uri).copy(target);
  return target.uri;
}

const num = (v: string) => {
  const n = Number(v.replace(/[^0-9]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export default function ParkingEditScreen() {
  const c = useColors();
  const router = useRouter();
  const { parking, saveParking, showToast } = useAppDeck();
  const [title, setTitle] = useState(parking?.locationTitle ?? '');
  const [detail, setDetail] = useState(parking?.locationDetail ?? '');
  const [photos, setPhotos] = useState<string[]>(parking?.photoUris ?? []);
  const [baseMin, setBaseMin] = useState(parking?.feeRule ? String(parking.feeRule.baseMinutes) : '');
  const [baseFee, setBaseFee] = useState(parking?.feeRule ? String(parking.feeRule.baseFee) : '');
  const [unitMin, setUnitMin] = useState(parking?.feeRule ? String(parking.feeRule.unitMinutes) : '');
  const [unitFee, setUnitFee] = useState(parking?.feeRule ? String(parking.feeRule.unitFee) : '');

  const pick = async () => {
    // 시스템 사진 선택기 사용: 고른 사진만 접근(갤러리 전체 권한 요청 안 함)
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: true, selectionLimit: MAX_PHOTOS - photos.length });
    if (result.canceled) return;
    try {
      setPhotos((p) => [...p, ...result.assets.map((a) => persistPhoto(a.uri))].slice(0, MAX_PHOTOS));
    } catch {
      showToast('사진을 저장하지 못했어요.');
    }
  };

  const save = async () => {
    const b = num(baseMin);
    const bf = num(baseFee);
    const feeRule: ParkingFeeRule | null =
      b && bf ? { baseMinutes: b, baseFee: bf, unitMinutes: num(unitMin) ?? 10, unitFee: num(unitFee) ?? 0 } : null;
    const session: ParkingSession = parking
      ? { ...parking, locationTitle: title.trim(), locationDetail: detail.trim(), photoUris: photos, feeRule }
      : {
          id: createId(),
          locationTitle: title.trim(),
          locationDetail: detail.trim(),
          photoUris: photos,
          startedAt: new Date().toISOString(),
          pausedTotalMs: 0,
          pausedAt: null,
          feeRule,
          endedAt: null,
        };
    await saveParking(session);
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title={parking ? '주차 정보 수정' : '주차 위치 기록'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormField label="위치" value={title} onChangeText={setTitle} placeholder="예: 지하 2층 B구역" />
          <FormField label="상세 위치 (선택)" value={detail} onChangeText={setDetail} placeholder="예: 기둥 번호 B12" />

          <View style={styles.photoSection}>
            <Text style={[styles.label, { color: c.textSecondary }]}>사진 (선택, 최대 {MAX_PHOTOS}장)</Text>
            <View style={styles.photos}>
              {photos.map((uri) => (
                <View key={uri}>
                  <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                  <Pressable
                    onPress={() => setPhotos((p) => p.filter((x) => x !== uri))}
                    style={[styles.remove, { backgroundColor: c.text }]}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="사진 삭제"
                  >
                    <Icon name="close" size={10} color={c.canvas} strokeWidth={2.6} />
                  </Pressable>
                </View>
              ))}
              {photos.length < MAX_PHOTOS ? (
                <Pressable onPress={() => void pick()} style={[styles.thumb, styles.add, { backgroundColor: c.surfaceMuted }]} accessibilityRole="button" accessibilityLabel="사진 추가">
                  <Icon name="camera" size={22} color={c.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={[styles.feeBox, { borderColor: c.border }]}>
            <Text style={[styles.label, { color: c.text }]}>요금 규칙 (선택)</Text>
            <Text style={[styles.note, { color: c.textTertiary }]}>주차장 안내판의 요금을 직접 입력해요. 앱덱은 요금 정보를 따로 조회하지 않아요.</Text>
            <View style={styles.grid}>
              <View style={styles.cell}><FormField label="기본 시간(분)" value={baseMin} onChangeText={setBaseMin} keyboardType="number-pad" placeholder="30" /></View>
              <View style={styles.cell}><FormField label="기본 요금(원)" value={baseFee} onChangeText={setBaseFee} keyboardType="number-pad" placeholder="2500" /></View>
              <View style={styles.cell}><FormField label="추가 단위(분)" value={unitMin} onChangeText={setUnitMin} keyboardType="number-pad" placeholder="10" /></View>
              <View style={styles.cell}><FormField label="추가 요금(원)" value={unitFee} onChangeText={setUnitFee} keyboardType="number-pad" placeholder="500" /></View>
            </View>
          </View>

          <PrimaryButton label={parking ? '저장하기' : '주차 시작하기'} disabled={!title.trim()} onPress={() => void save()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 18, paddingBottom: 40 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5 },
  note: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16 },
  photoSection: { gap: 8 },
  photos: { flexDirection: 'row', gap: 10 },
  thumb: { width: 84, height: 84, borderRadius: 12 },
  add: { alignItems: 'center', justifyContent: 'center' },
  remove: { position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  feeBox: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '47%' },
});
