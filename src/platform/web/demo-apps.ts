import type { DeviceAppRecord } from '@/domain/apps/app.types';

/**
 * 웹 프리뷰 전용 가상 데이터 (실제 기기 목록 아님).
 * 서비스 로고는 복제하지 않고 이름 첫 글자 모노그램으로만 표시한다.
 */
export interface DemoApp extends DeviceAppRecord {
  accentColor: string;
  monogram: string;
}

function demo(packageName: string, displayName: string, accentColor: string, monogram?: string): DemoApp {
  return {
    packageName,
    displayName,
    accentColor,
    monogram: monogram ?? displayName.slice(0, 1),
    versionName: '1.0.0',
    versionCode: '1',
    firstInstallTime: null,
    lastUpdateTime: null,
    isSystemApp: false,
    hasLaunchIntent: true,
    iconCacheUri: null,
    platformCategory: null,
  };
}

export const DEMO_DEVICE_APPS: readonly DemoApp[] = [
  demo('com.sampleapp', '배달의민족', '#2AC1BC', '배민'),
  demo('com.coupang.mobile.eats', '쿠팡이츠', '#3B7BF6', '이츠'),
  demo('com.fineapp.yogiyo', '요기요', '#FA0050', '요기요'),
  demo('com.shinhan.ddangyo', '땡겨요', '#FF5A3C', '땡겨'),
  demo('com.starbucks.co', '스타벅스', '#00704A'),
  demo('com.coupang.mobile', '쿠팡', '#E5483A'),
  demo('com.musinsa.store', '무신사', '#111111'),
  demo('com.nhn.android.nmap', '네이버 지도', '#03C75A', 'N'),
  demo('net.daum.android.map', '카카오맵', '#FFD400', '●'),
  demo('com.skt.tmap.ku', '티맵', '#7A5CFF', 'T'),
  demo('com.korail.talk', '코레일톡', '#1E5BD8', 'K'),
  demo('kr.co.tmoney.tmoneybus', '고속버스티머니', '#E8433B', '버스'),
  demo('kr.goodchoice.abouthere', '여기어때', '#F23D63', '여기'),
  demo('com.koreanair.passenger', '대한항공', '#0A4FA8', '✈'),
  demo('com.samsung.android.messaging', '메시지', '#3478F6', '✉'),
  demo('com.instagram.android', '인스타그램', '#D6377D', '◎'),
  demo('com.devsisters.ck', '쿠키런: 킹덤', '#B9672E', '쿠키'),
  demo('kr.go.nts.android', '손택스', '#2C6BB5', '세금'),
  demo('com.kepco.cyberbranch', '한전ON', '#0B6FB8', '한전'),
  demo('kr.go.minwon.m', '정부24', '#164B9C', '24'),
  demo('com.sec.android.app.popupcalculator', '계산기', '#4B5563', '±'),
  demo('com.nhn.android.webtoon', '네이버 웹툰', '#00D564', '웹툰'),
  demo('com.sec.android.app.shealth', 'Samsung Health', '#1FB6A8', '♥'),
  demo('com.kakao.taxi', '카카오 T', '#1E1E1E', 'T'),
  demo('com.netflix.mediaclient', '넷플릭스', '#141414', 'N'),
  demo('com.google.android.youtube', '유튜브', '#FF2D2D', '▶'),
  demo('net.cj.cjhv.gs.tving', '티빙', '#FF153C', 'T'),
  demo('com.coupang.mobile.play', '쿠팡플레이', '#5B5BF0', '▶'),
  demo('com.cgv.android.movieapp', 'CGV', '#E71A0F'),
  demo('com.kakao.talk', '카카오톡', '#F7D300', 'TALK'),
  demo('com.kakaobank.channel', '카카오뱅크', '#FFC800', 'B'),
  demo('viva.republica.toss', '토스', '#0064FF'),
  demo('com.iloen.melon', '멜론', '#00CD3C'),
  demo('com.nhn.android.nstore', '네이버 시리즈', '#00C473', 'N'),
  demo('com.cultsotry.yanolja.nativeapp', '야놀자', '#FF3478'),
];

export const DEMO_ACCENTS: Readonly<Record<string, { color: string; monogram: string }>> = Object.fromEntries(
  DEMO_DEVICE_APPS.map((a) => [a.packageName, { color: a.accentColor, monogram: a.monogram }]),
);

/** 데모 첫 실행 시의 사용자 설정 예시(즐겨찾기/정리 후보). 실행 기록은 만들지 않는다. */
export const DEMO_FAVORITES = [
  'com.coupang.mobile',
  'com.nhn.android.nmap',
  'com.netflix.mediaclient',
  'com.google.android.youtube',
  'com.sampleapp',
  'com.coupang.mobile.eats',
  'net.cj.cjhv.gs.tving',
  'com.kakao.talk',
];
export const DEMO_CLEANUP = ['com.nhn.android.nstore', 'com.coupang.mobile.play', 'com.cultsotry.yanolja.nativeapp'];
