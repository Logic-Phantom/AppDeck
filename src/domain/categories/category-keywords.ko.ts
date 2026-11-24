import type { AppCategoryId } from './category.types';

/**
 * 로컬 분류 규칙 (외부 AI/네트워크 사용 안 함).
 * - packagePatterns: 패키지명 부분 일치(소문자). 알려진 서비스의 공개 패키지명을 "분류 힌트"로만 사용한다.
 *   이 목록은 설치 앱 목록이 아니며, 기기에 없는 앱을 화면에 추가하지 않는다.
 * - nameKeywords: 앱 표시 이름에 포함되면 해당 카테고리 후보로 본다.
 * 규칙이 바뀌면 RULES_VERSION을 올린다. 재분류 시에도 사용자 지정 분류는 보존된다.
 */
export const RULES_VERSION = 1;

export interface CategoryRule {
  categoryId: AppCategoryId;
  packagePatterns: string[];
  nameKeywords: string[];
}

export const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    categoryId: 'food_delivery',
    packagePatterns: ['com.sampleapp', 'baemin', 'coupang.mobile.eats', 'com.fineapp.yogiyo', 'yogiyo', 'ddangyo', 'shinhan.ddangyo'],
    nameKeywords: ['배달', '배민', '이츠', 'eats', '요기요', '땡겨요', 'delivery'],
  },
  {
    categoryId: 'food_dining',
    packagePatterns: ['starbucks', 'mcdonalds', 'burgerking', 'lotteria', 'catchtable', 'tabling', 'ediya', 'twosome', 'megacoffee'],
    nameKeywords: ['스타벅스', '맥도날드', '버거', '커피', '카페', '캐치테이블', '테이블링', '식당', '레스토랑', 'coffee'],
  },
  {
    categoryId: 'maps_navigation',
    packagePatterns: ['com.nhn.android.nmap', 'net.daum.android.map', 'com.kakao.map', 'com.skt.tmap', 'tmap', 'com.google.android.apps.maps', 'kakaonavi', 'atlan'],
    nameKeywords: ['지도', '맵', '내비', '네비', '티맵', 'map', 'navi'],
  },
  {
    categoryId: 'transport_mobility',
    packagePatterns: ['kakao.taxi', 'kakaot', 'korail', 'kr.co.srail', 'tmoney', 'socar', 'greencar', 'uber', 'kakaobus', 'subway'],
    nameKeywords: ['택시', '버스', '지하철', '코레일', '기차', '카셰어', '쏘카', '주차', 'taxi'],
  },
  {
    categoryId: 'streaming_video',
    packagePatterns: ['netflix', 'google.android.youtube', 'youtube', 'tving', 'wavve', 'pooq', 'coupangplay', 'coupang.mobile.play', 'disney', 'watcha', 'laftel', 'primevideo', 'chzzk', 'afreeca'],
    nameKeywords: ['넷플릭스', '유튜브', '티빙', '웨이브', '쿠팡플레이', '디즈니', '왓챠', '라프텔', '치지직', 'tv', 'ott', 'video', '영상'],
  },
  {
    categoryId: 'tickets_culture',
    packagePatterns: ['cgv', 'lottecinema', 'megabox', 'interpark', 'yes24.ticket', 'melonticket'],
    nameKeywords: ['cgv', '롯데시네마', '메가박스', '티켓', '예매', '공연', '시네마', 'cinema', 'ticket'],
  },
  {
    categoryId: 'shopping',
    packagePatterns: ['coupang.mobile', 'gmarket', 'auction', '11st', 'elevenst', 'ssg', 'musinsa', 'kurly', 'ably', 'zigzag', 'oliveyoung', 'aliexpress', 'temu', 'daangn', 'bunjang', 'navershopping'],
    nameKeywords: ['쿠팡', '쇼핑', '마켓', '무신사', '컬리', '에이블리', '지그재그', '올리브영', '당근', '번개장터', '11번가', '지마켓', 'shop', 'mall'],
  },
  {
    categoryId: 'finance_payment',
    packagePatterns: ['viva.republica.toss', 'kakaobank', 'kbstar', 'shinhan', 'wooribank', 'hanabank', 'nh.mobile', 'kbank', 'samsung.android.spay', 'naverpay', 'kakaopay', 'paybooc', 'upbit'],
    nameKeywords: ['은행', '뱅크', '토스', '페이', '카드', '증권', '송금', 'bank', 'pay'],
  },
  {
    categoryId: 'messaging_social',
    packagePatterns: ['com.kakao.talk', 'instagram', 'facebook', 'twitter', 'threads', 'jp.naver.line', 'telegram', 'discord', 'whatsapp', 'band', 'messaging', 'mms'],
    nameKeywords: ['카카오톡', '페이스북', '메시지', '메신저', '인스타그램', '스레드', '밴드', '텔레그램', '디스코드', 'talk', 'chat'],
  },
  {
    categoryId: 'music_audio',
    packagePatterns: ['melon', 'genie', 'dreamus.flo', 'spotify', 'youtube.music', 'apple.android.music', 'vibe', 'bugs', 'podcast'],
    nameKeywords: ['멜론', '지니', '플로', '스포티파이', '음악', '뮤직', '바이브', '팟캐스트', 'music'],
  },
  {
    categoryId: 'travel_booking',
    packagePatterns: ['yanolja', 'goodchoice', 'yeogi', 'airbnb', 'agoda', 'booking', 'trip.com', 'skyscanner', 'myrealtrip', 'koreanair', 'flyasiana', 'jejuair'],
    nameKeywords: ['야놀자', '여기어때', '에어비앤비', '아고다', '항공', '숙소', '호텔', '여행', 'travel', 'hotel'],
  },
  {
    categoryId: 'productivity',
    packagePatterns: ['notion', 'google.android.apps.docs', 'microsoft.office', 'slack', 'calendar', 'android.keep', 'evernote', 'dropbox', 'drive', 'gmail', 'outlook', 'navercloud'],
    nameKeywords: ['노션', '캘린더', '메모', '문서', '드라이브', '메일', '오피스', 'notes', 'docs'],
  },
  {
    categoryId: 'photo_camera',
    packagePatterns: ['camera', 'gallery', 'photos', 'snow', 'foodie', 'b612', 'lightroom', 'vsco', 'capcut'],
    nameKeywords: ['카메라', '갤러리', '사진', '앨범', '편집', 'camera', 'photo'],
  },
  {
    categoryId: 'health_lifestyle',
    packagePatterns: ['health', 'fitness', 'weather', 'zigbang', 'dabang', 'baeminmart', 'todayhouse', 'bucketplace'],
    nameKeywords: ['건강', '헬스', '날씨', '부동산', '직방', '오늘의집', '운동', '병원', '약국', 'health', 'weather'],
  },
  {
    categoryId: 'games',
    packagePatterns: ['game', 'nexon', 'netmarble', 'ncsoft', 'supercell', 'krafton', 'com.pubg', 'kakaogames'],
    nameKeywords: ['게임', 'game'],
  },
  {
    categoryId: 'system_tools',
    packagePatterns: ['android.settings', 'filemanager', 'myfiles', 'calculator', 'vending', 'chrome', 'browser', 'samsung.android.app', 'google.android.googlequicksearchbox'],
    nameKeywords: ['설정', '파일', '계산기', '플레이 스토어', '브라우저', '크롬', 'settings', 'files', 'chrome'],
  },
];

/** Android ApplicationInfo.category 값 → 앱덱 카테고리 (힌트일 뿐 확정하지 않는다) */
export const ANDROID_PLATFORM_CATEGORY: Readonly<Record<number, AppCategoryId>> = {
  0: 'games',
  1: 'music_audio',
  2: 'streaming_video',
  3: 'photo_camera',
  4: 'messaging_social',
  6: 'maps_navigation',
  7: 'productivity',
};
