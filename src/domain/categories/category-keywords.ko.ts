import type { AppCategoryId } from './category.types';

/**
 * 로컬 분류 규칙 (외부 AI/네트워크 사용 안 함).
 * - packagePatterns: 패키지명 부분 일치(소문자). 알려진 서비스의 공개 패키지명을 "분류 힌트"로만 사용한다.
 *   이 목록은 설치 앱 목록이 아니며, 기기에 없는 앱을 화면에 추가하지 않는다.
 * - nameKeywords: 앱 표시 이름에 포함되면 해당 카테고리 후보로 본다.
 * 여러 규칙이 맞으면 가장 긴(구체적인) 패턴이 이긴다. 예: tmoneybus(여행) > tmoney(교통)
 * 규칙이 바뀌면 RULES_VERSION을 올린다. 재분류 시에도 사용자 지정 분류는 보존된다.
 */
export const RULES_VERSION = 2;

export interface CategoryRule {
  categoryId: AppCategoryId;
  packagePatterns: string[];
  nameKeywords: string[];
}

export const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    categoryId: 'food_delivery',
    packagePatterns: ['com.sampleapp', 'baemin', 'coupang.mobile.eats', 'fineapp.yogiyo', 'yogiyo', 'ddangyo', 'dominos', 'pizzahut', 'bbq', 'kyochon', 'bhc'],
    nameKeywords: ['배달', '배민', '이츠', 'eats', '요기요', '땡겨요', '피자', '치킨', 'delivery'],
  },
  {
    categoryId: 'food_dining',
    packagePatterns: ['starbucks', 'mcdonalds', 'burgerking', 'lotteria', 'catchtable', 'tabling', 'ediya', 'twosome', 'megacoffee', 'baskin', 'dunkin', 'paris', 'compose', 'hollys', 'paikdabang'],
    nameKeywords: ['스타벅스', '맥도날드', '버거', '커피', '카페', '캐치테이블', '테이블링', '식당', '레스토랑', '베이커리', 'coffee', 'cafe'],
  },
  {
    categoryId: 'maps_navigation',
    packagePatterns: ['nhn.android.nmap', 'net.daum.android.map', 'kakao.map', 'skt.tmap', 'tmap', 'google.android.apps.maps', 'kakaonavi', 'atlan', 'inavi'],
    nameKeywords: ['지도', '맵', '내비', '네비', '티맵', 'map', 'navi'],
  },
  {
    categoryId: 'transport_mobility',
    packagePatterns: ['kakao.taxi', 'kakaot', 'uber', 'tada', 'socar', 'greencar', 'tmoney', 'kakaobus', 'subway', 'metro', 'iparking', 'parking', 'evcharg', 'hipass', 'kickboard', 'gcoo'],
    nameKeywords: ['택시', '버스', '지하철', '카셰어', '쏘카', '주차', '전기차', '충전', '킥보드', '하이패스', '교통', 'taxi', 'metro'],
  },
  {
    categoryId: 'travel_booking',
    packagePatterns: [
      'korail', 'srail', 'tmoneybus', 'expressbus', 'bustago', 'kobus', 'txbus',
      'koreanair', 'flyasiana', 'jejuair', 'jinair', 'twayair', 'airbusan', 'airseoul', 'eastarjet',
      'goodchoice', 'yanolja', 'yeogi', 'airbnb', 'agoda', 'booking', 'ctrip', 'trip.com', 'skyscanner', 'myrealtrip', 'hotels', 'expedia', 'klook', 'triple',
    ],
    nameKeywords: [
      '코레일', '기차', 'ktx', 'srt', '고속버스', '시외버스', '버스타고', '항공', '대한항공', '아시아나', '제주항공', '진에어', '티웨이',
      '여기어때', '야놀자', '숙소', '숙박', '호텔', '에어비앤비', '아고다', '스카이스캐너', '마이리얼트립', '트립닷컴', '여행', 'travel', 'hotel',
    ],
  },
  {
    categoryId: 'streaming_video',
    packagePatterns: ['netflix', 'google.android.youtube', 'youtube', 'tving', 'wavve', 'pooq', 'coupangplay', 'coupang.mobile.play', 'disney', 'watcha', 'laftel', 'primevideo', 'chzzk', 'afreeca', 'soop', 'twitch', 'kakaotv', 'appletv'],
    nameKeywords: ['넷플릭스', '유튜브', '티빙', '웨이브', '쿠팡플레이', '디즈니', '왓챠', '라프텔', '치지직', 'ott', 'video', '영상', 'tv'],
  },
  {
    categoryId: 'tickets_culture',
    packagePatterns: ['cgv', 'lottecinema', 'megabox', 'interpark.ticket', 'yes24.ticket', 'melonticket', 'ticketlink'],
    nameKeywords: ['cgv', '롯데시네마', '메가박스', '티켓', '예매', '공연', '시네마', '영화', 'cinema', 'ticket'],
  },
  {
    categoryId: 'music_audio',
    packagePatterns: ['melon', 'genie', 'dreamus.flo', 'spotify', 'youtube.music', 'apple.android.music', 'vibe', 'bugs', 'podcast', 'podbbang', 'audioclip', 'soundcloud', 'radio'],
    nameKeywords: ['멜론', '지니', '플로', '스포티파이', '음악', '뮤직', '바이브', '벅스', '팟캐스트', '라디오', 'music'],
  },
  {
    categoryId: 'games',
    packagePatterns: ['game', 'nexon', 'netmarble', 'ncsoft', 'supercell', 'krafton', 'com.pubg', 'kakaogames', 'devsisters', 'roblox', 'mojang', 'king.', 'hoyoverse', 'mihoyo', 'com.ea.', 'gameloft', 'miniclip', 'smilegate', 'com2us', 'gravity'],
    nameKeywords: ['게임', '쿠키런', '배틀그라운드', '리니지', '로블록스', '마인크래프트', '포켓몬', '퍼즐', '카트라이더', '메이플', 'game'],
  },
  {
    categoryId: 'news_reading',
    packagePatterns: ['nhn.android.search', 'net.daum.android.daum', 'news', 'webtoon', 'kakaopage', 'nhn.android.nstore', 'millie', 'ridibooks', 'kyobo', 'yes24', 'aladin', 'flipboard'],
    nameKeywords: ['뉴스', '웹툰', '시리즈', '카카오페이지', '밀리의서재', '리디', '교보', '도서', '전자책', '신문', 'news', 'webtoon'],
  },
  {
    categoryId: 'shopping',
    packagePatterns: ['coupang.mobile', 'gmarket', 'auction', '11st', 'elevenst', 'ssg', 'musinsa', 'kurly', 'ably', 'zigzag', 'oliveyoung', 'aliexpress', 'temu', 'daangn', 'bunjang', 'joongna', 'navershopping', 'tmon', 'wemakeprice', 'gsshop', 'cjonstyle', 'lotteon', 'hmall', 'emart', 'homeplus', '29cm', 'wconcept', 'kream', 'shein'],
    nameKeywords: ['쿠팡', '쇼핑', '마켓', '무신사', '컬리', '에이블리', '지그재그', '올리브영', '당근', '번개장터', '중고나라', '11번가', '지마켓', '이마트', '홈플러스', 'shop', 'mall'],
  },
  {
    categoryId: 'finance_payment',
    packagePatterns: [
      'viva.republica.toss', 'kakaobank', 'kbstar', 'shinhan', 'wooribank', 'hanabank', 'nh.mobile', 'nonghyup', 'kbank', 'ibk', 'citibank', 'scbank',
      'samsung.android.spay', 'samsungpay', 'naverpay', 'kakaopay', 'paybooc', 'samsungcard', 'hyundaicard', 'shinhancard', 'lottecard', 'bccard', 'kbcard', 'wooricard', 'hanacard',
      'upbit', 'bithumb', 'kiwoom', 'miraeasset', 'namuh', 'kbsec', 'truefriend', 'samsungpop', 'payco',
    ],
    nameKeywords: ['은행', '뱅크', '토스', '페이', '카드', '증권', '송금', '주식', '코인', 'bank', 'pay'],
  },
  {
    categoryId: 'bills_tax',
    packagePatterns: ['kr.go.', 'hometax', 'kr.go.nts', 'wetax', 'gov24', 'minwon', 'kepco', 'nhis', 'or.nps', 'kr.or.', 'aptner', 'citygas', 'samchully', 'giro', 'ebill'],
    nameKeywords: ['홈택스', '손택스', '위택스', '정부24', '국세청', '한전', '전기요금', '도시가스', '가스앱', '수도', '건강보험', '국민연금', '관리비', '아파트아이', '아파트너', '지로', '공과금', '세금', '민원', '고지서'],
  },
  {
    categoryId: 'health_lifestyle',
    packagePatterns: ['weather', 'zigbang', 'dabang', 'bucketplace', 'todayhouse', 'smartthings', 'thinq', 'homenet', 'laundry', 'cleaning', 'miso', 'ohou', 'kakao.home'],
    nameKeywords: ['날씨', '부동산', '직방', '다방', '오늘의집', '스마트싱스', '씽큐', '세탁', '청소', '홈', '생활', 'weather'],
  },
  {
    categoryId: 'health_fitness',
    packagePatterns: ['shealth', 'health', 'fitness', 'strava', 'nike', 'pedometer', 'cashwalk', 'goodoc', 'ddocdoc', 'pharm', 'hospital', 'yoga', 'diet'],
    nameKeywords: ['헬스', '건강', '운동', '걸음', '만보기', '캐시워크', '병원', '약국', '굿닥', '똑닥', '다이어트', '요가', 'fitness'],
  },
  {
    categoryId: 'messaging_social',
    packagePatterns: [
      'com.kakao.talk', 'instagram', 'facebook', 'twitter', 'com.x.', 'threads', 'jp.naver.line', 'telegram', 'discord', 'whatsapp', 'band', 'tiktok', 'snapchat',
      'apps.messaging', 'android.messaging', 'android.mms', 'messaging', 'mms', 'messenger',
    ],
    nameKeywords: ['카카오톡', '페이스북', '메시지', '메신저', '문자', 'sms', '인스타그램', '스레드', '밴드', '텔레그램', '디스코드', '틱톡', 'talk', 'chat', 'messages'],
  },
  {
    categoryId: 'productivity',
    packagePatterns: ['notion', 'apps.docs', 'apps.sheets', 'apps.slides', 'microsoft.office', 'slack', 'teams', 'zoom', 'webex', 'calendar', 'android.keep', 'app.notes', 'evernote', 'dropbox', 'apps.docs.drive', 'onedrive', 'gmail', 'outlook', 'jandi', 'dooray', 'navercloud', 'mybox', 'adobe.reader', 'scanner'],
    nameKeywords: ['노션', '캘린더', '메모', '노트', '문서', '드라이브', '메일', '오피스', '슬랙', '스캔', 'notes', 'docs', 'mail'],
  },
  {
    categoryId: 'education',
    packagePatterns: ['duolingo', 'classting', 'ebs', 'megastudy', 'speak', 'quizlet', 'santa', 'cake', 'class101', 'mathpresso', 'qanda', 'inflearn', 'coursera', 'udemy'],
    nameKeywords: ['교육', '학습', '영어', '단어', '강의', '클래스', '공부', '듀오링고', '콴다', 'ebs', 'study'],
  },
  {
    categoryId: 'photo_camera',
    packagePatterns: ['camera', 'gallery', 'photos', 'snow', 'foodie', 'b612', 'lightroom', 'vsco', 'capcut', 'picsart', 'snapseed', 'meitu', 'ulike'],
    nameKeywords: ['카메라', '갤러리', '사진', '앨범', '편집', '캡컷', 'camera', 'photo'],
  },
  {
    categoryId: 'system_tools',
    packagePatterns: [
      'android.settings', 'filemanager', 'myfiles', 'apps.nbu.files', 'calculator', 'calc', 'clock', 'flashlight', 'torch', 'qrcode', 'barcode', 'recorder', 'voicenote',
      'translate', 'papago', 'compass', 'vending', 'galaxyapps', 'chrome', 'browser', 'sbrowser', 'googlequicksearchbox', 'vpn', 'v3mobile', 'ahnlab', 'battery', 'cleaner', 'keyboard', 'samsung.android.app.smartcapture',
    ],
    nameKeywords: ['설정', '파일', '내 파일', '계산기', '시계', '알람', '손전등', '플래시', 'qr', '스캐너', '녹음', '번역', '파파고', '나침반', '브라우저', '크롬', '인터넷', '스토어', '백신', '배터리', '키보드', 'settings', 'files', 'chrome'],
  },
];

/** Android ApplicationInfo.category 값 → 앱덱 카테고리 (힌트일 뿐 확정하지 않는다) */
export const ANDROID_PLATFORM_CATEGORY: Readonly<Record<number, AppCategoryId>> = {
  0: 'games',
  1: 'music_audio',
  2: 'streaming_video',
  3: 'photo_camera',
  4: 'messaging_social',
  5: 'news_reading',
  6: 'maps_navigation',
  7: 'productivity',
  8: 'system_tools',
};
