import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen, ScreenHeader } from '@/components/Screen';
import { EmptyState, PillButton, PrimaryButton } from '@/components/ui';
import { Icon } from '@/design-system/Icon';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { elapsedMs, estimateFee, formatDuration, togglePause } from '@/domain/parking/parking';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

function formatStart(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return sameDay ? `오늘 ${hm}` : `${d.getMonth() + 1}월 ${d.getDate()}일 ${hm}`;
}

export default function ParkingScreen() {
  const c = useColors();
  const router = useRouter();
  const { parking, saveParking } = useAppDeck();
  const [now, setNow] = useState(() => Date.now());
  const [photoIndex, setPhotoIndex] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const running = !!parking && !parking.pausedAt && !parking.endedAt;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  if (!parking) {
    return (
      <Screen tab="home">
        <ScreenHeader title="주차 위치" />
        <EmptyState
          title="기록된 주차 위치가 없어요"
          body="층·구역·기둥 번호와 사진을 남겨 두면 차를 찾을 때 편해요. 위치 정보(GPS)는 사용하지 않아요."
          action={
            <View style={styles.emptyAction}>
              <PrimaryButton label="주차 위치 기록하기" onPress={() => router.push('/parking-edit')} />
            </View>
          }
        />
      </Screen>
    );
  }

  const ms = elapsedMs(parking, now);
  const photo = parking.photoUris[photoIndex];

  return (
    <Screen tab="home">
      <ScreenHeader title="주차 위치" />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => (parking.photoUris.length > 1 ? setPhotoIndex((i) => (i + 1) % parking.photoUris.length) : router.push('/parking-edit'))}
          style={[styles.photo, { backgroundColor: c.surfaceMuted }]}
          accessibilityRole="button"
          accessibilityLabel={photo ? '다음 사진 보기' : '사진 추가'}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={styles.photoEmpty}>
              <Icon name="camera" size={28} color={c.textTertiary} />
              <Text style={[styles.photoEmptyText, { color: c.textTertiary }]}>주차 위치 사진 추가</Text>
            </View>
          )}
          {photo ? (
            <View style={styles.photoBadge}>
              <Icon name="camera" size={12} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.photoBadgeText}>
                사진 보기 {photoIndex + 1}/{parking.photoUris.length}
              </Text>
            </View>
          ) : null}
        </Pressable>

        <View style={styles.infoRow}>
          <Icon name="pin" size={22} color={c.danger} />
          <Text style={[styles.location, { color: c.text }]}>
            {parking.locationTitle}
            {parking.locationDetail ? `\n${parking.locationDetail}` : ''}
          </Text>
          <PillButton label="수정" onPress={() => router.push('/parking-edit')} />
        </View>

        <View style={styles.infoRow}>
          <Icon name="clock" size={21} color={c.text} />
          <View>
            <Text style={[styles.caption, { color: c.textSecondary }]}>주차 시간</Text>
            <Text style={[styles.value, { color: c.text }]}>{formatStart(parking.startedAt)}</Text>
          </View>
        </View>

        <View style={[styles.timer, { borderColor: c.border, backgroundColor: c.surface }]}>
          <View>
            <Text style={[styles.caption, { color: c.textSecondary }]}>{parking.pausedAt ? '일시정지' : '주차 중'}</Text>
            <Text style={[styles.clock, { color: c.text }]} accessibilityLabel={`경과 시간 ${formatDuration(ms)}`}>
              {formatDuration(ms)}
            </Text>
          </View>
          <Pressable
            onPress={() => void saveParking(togglePause(parking, new Date().toISOString()))}
            style={[styles.pause, { backgroundColor: c.accentSoft }]}
            accessibilityRole="button"
            accessibilityLabel={parking.pausedAt ? '타이머 다시 시작' : '타이머 일시정지'}
          >
            <Icon name={parking.pausedAt ? 'play' : 'pause'} size={16} color={c.accent} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/parking-edit')}
          style={[styles.fee, { backgroundColor: c.surfaceMuted }]}
          accessibilityRole="button"
          accessibilityLabel="요금 규칙 수정"
        >
          <Icon name="won" size={18} color={c.textSecondary} />
          <View style={styles.feeTexts}>
            <Text style={[styles.micro, { color: c.textSecondary }]}>예상 요금</Text>
            {parking.feeRule ? (
              <>
                <Text style={[styles.feeValue, { color: c.text }]}>{estimateFee(parking.feeRule, ms).toLocaleString('ko-KR')}원 ~</Text>
                <Text style={[styles.micro, { color: c.textTertiary }]}>
                  (기본 {parking.feeRule.baseMinutes}분 기준 · 직접 입력한 요금)
                </Text>
              </>
            ) : (
              <Text style={[styles.feeEmpty, { color: c.textSecondary }]}>요금 규칙을 입력하면 예상 요금을 보여 줘요</Text>
            )}
          </View>
        </Pressable>

        <View style={styles.end}>
          <PrimaryButton label="주차 종료하기" onPress={() => setConfirmEnd(true)} />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmEnd}
        title="주차를 종료할까요?"
        message={`주차 시간 ${formatDuration(ms)}${parking.feeRule ? ` · 예상 요금 ${estimateFee(parking.feeRule, ms).toLocaleString('ko-KR')}원` : ''}\n기록한 위치와 사진 정보는 삭제돼요.`}
        onClose={() => setConfirmEnd(false)}
        actions={[
          {
            label: '주차 종료',
            tone: 'primary',
            onPress: () => {
              setConfirmEnd(false);
              void saveParking(null).then(() => router.back());
            },
          },
          { label: '취소', onPress: () => setConfirmEnd(false) },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  emptyAction: { alignSelf: 'stretch', marginTop: 16 },
  photo: { height: 210, marginHorizontal: 2, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoEmptyText: { fontFamily: fonts.medium, fontSize: 13 },
  photoBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20,22,30,0.72)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  photoBadgeText: { color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 11 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 22, paddingTop: 20 },
  location: { flex: 1, fontFamily: fonts.bold, fontSize: 16, lineHeight: 24, letterSpacing: -0.3 },
  caption: { fontFamily: fonts.medium, fontSize: 12 },
  value: { fontFamily: fonts.bold, fontSize: 15, marginTop: 3 },
  timer: {
    marginHorizontal: 16,
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clock: { fontFamily: fonts.bold, fontSize: 26, letterSpacing: 0.3, marginTop: 4, fontVariant: ['tabular-nums'] },
  pause: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  fee: { marginHorizontal: 16, marginTop: 10, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', gap: 10 },
  feeTexts: { flex: 1, gap: 3 },
  micro: { fontFamily: fonts.medium, fontSize: 11 },
  feeValue: { fontFamily: fonts.bold, fontSize: 16 },
  feeEmpty: { fontFamily: fonts.medium, fontSize: 13 },
  end: { marginHorizontal: 16, marginTop: 22 },
});
