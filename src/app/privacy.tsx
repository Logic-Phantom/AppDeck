import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/Screen';
import { useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '앱덱이 확인하는 정보',
    body: '• 설치 앱 목록: 앱 이름, 아이콘, 패키지명, 버전, 설치·업데이트 시각 (Android, 동의한 경우에만)\n• 내가 만든 정보: 카테고리, 별칭, 즐겨찾기, 숨김, 정리 후보\n• 앱덱 실행 기록: 앱덱에서 실행을 요청한 시각과 결과\n• 사용 기록(선택): Android 사용 기록을 직접 허용한 경우 기간별 마지막 사용 시각\n• 주차 메모: 직접 입력한 위치 문구, 고른 사진, 요금 규칙',
  },
  {
    title: '저장 위치와 전송',
    body: '모든 정보는 이 기기의 앱 전용 저장소(SQLite)와 캐시 폴더에만 저장돼요. 서버, 광고, 분석, AI 서비스로 보내지 않아요. 앱덱에는 로그인, 광고 SDK, 분석 SDK가 없어요.',
  },
  {
    title: '권한',
    body: '• 앱 목록 확인(QUERY_ALL_PACKAGES): 설치 앱 검색·분류·실행이라는 핵심 기능에 사용해요.\n• 사용 기록 접근(선택, 기본 꺼짐): 시스템 설정에서 직접 허용해야 하고 언제든 끌 수 있어요.\n• 사진: 시스템 사진 선택기로 고른 사진만 사용해요. 위치·카메라·연락처 권한은 사용하지 않아요.',
  },
  {
    title: '하지 않는 일',
    body: '다른 앱을 삭제하거나 강제 종료하지 않아요. 백그라운드에서 앱 사용을 감시하지 않아요. 실행하지 않은 앱의 기록이나 추정한 미사용 기간을 만들지 않아요.',
  },
  {
    title: '삭제와 내보내기',
    body: '설정 > 앱 데이터 초기화에서 앱덱 데이터(앱 목록, 설정, 기록, 주차 메모, 아이콘 캐시)를 모두 지울 수 있어요. 데이터 내보내기 파일에는 앱 목록이 들어 있으니 공유에 주의해 주세요.',
  },
];

export default function PrivacyScreen() {
  const c = useColors();
  const { capabilities } = useAppDeck();
  return (
    <Screen>
      <ScreenHeader title="개인정보 보호" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.platform, { backgroundColor: c.accentSoft }]}>
          <Text style={[styles.platformText, { color: c.accent }]}>{capabilities.limitationNote}</Text>
        </View>
        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
              {s.title}
            </Text>
            <Text style={[styles.body, { color: c.textSecondary }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  platform: { borderRadius: 12, padding: 14 },
  platformText: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 19 },
  section: { marginTop: 22, gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 15 },
  body: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 21 },
});
