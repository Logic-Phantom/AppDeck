import type { AppCategoryId } from '../categories/category.types';
import { normalizeText, stripParticles } from './query-normalizer';

export interface PurposeIntent {
  id: string;
  label: string;
  /** 결과 탭 순서대로의 카테고리. 첫 번째가 주 카테고리. */
  categories: AppCategoryId[];
  keywords: string[];
}

/** 목적 검색 사전. 로컬 규칙만 사용하고 네트워크·AI를 쓰지 않는다. */
export const PURPOSE_INTENTS: readonly PurposeIntent[] = [
  { id: 'delivery', label: '배달·주문', categories: ['food_delivery', 'food_dining'], keywords: ['배달', '배달주문', '음식주문', '포장주문', '포장', '야식', '치킨', '피자', '음식', '맛집'] },
  { id: 'directions', label: '길찾기', categories: ['maps_navigation', 'transport_mobility'], keywords: ['지도', '길찾기', '길 찾기', '내비', '네비', '위치', '주차'] },
  { id: 'transport', label: '교통·이동', categories: ['transport_mobility', 'maps_navigation'], keywords: ['교통', '이동', '택시', '버스', '지하철', '카셰어', '킥보드', '충전'] },
  { id: 'ott', label: 'OTT', categories: ['streaming_video'], keywords: ['ott', 'ott보기', '영상', '드라마', '예능', '동영상', '스트리밍', 'tv'] },
  { id: 'shopping', label: '쇼핑', categories: ['shopping'], keywords: ['쇼핑', '쇼핑하기', '온라인쇼핑', '장보기', '구매', '중고'] },
  { id: 'movie', label: '영화 예매', categories: ['tickets_culture', 'streaming_video'], keywords: ['영화', '영화예매', '예매', '공연', '티켓', '뮤지컬', '콘서트', '극장'] },
  { id: 'travel', label: '여행·숙박', categories: ['travel_booking', 'transport_mobility'], keywords: ['여행', '항공', '항공권', '비행기', '기차', 'ktx', 'srt', '코레일', '고속버스', '시외버스', '숙소', '숙박', '호텔', '펜션', '숙소예약'] },
  { id: 'finance', label: '금융', categories: ['finance_payment'], keywords: ['은행', '송금', '결제', '금융', '계좌', '이체', '주식', '증권'] },
  { id: 'bills', label: '공과금·세금', categories: ['bills_tax', 'finance_payment'], keywords: ['공과금', '세금', '연말정산', '전기요금', '가스요금', '수도요금', '관리비', '민원', '고지서', '납부'] },
  { id: 'chat', label: '메신저', categories: ['messaging_social'], keywords: ['메신저', '채팅', '연락', '메시지', '문자', 'sms', 'sns', '소셜'] },
  { id: 'music', label: '음악', categories: ['music_audio'], keywords: ['음악', '노래', '스트리밍음악', '뮤직', '팟캐스트', '라디오'] },
  { id: 'reading', label: '뉴스·웹툰', categories: ['news_reading'], keywords: ['뉴스', '웹툰', '만화', '소설', '전자책', '독서'] },
  { id: 'game', label: '게임', categories: ['games'], keywords: ['게임', '게임하기'] },
  { id: 'health', label: '건강·운동', categories: ['health_fitness'], keywords: ['운동', '건강', '헬스', '걸음', '병원', '약국', '다이어트'] },
  { id: 'life', label: '생활편의', categories: ['health_lifestyle'], keywords: ['생활', '날씨', '부동산', '집', '인테리어', '가전'] },
  { id: 'work', label: '업무', categories: ['productivity'], keywords: ['업무', '메모', '일정', '캘린더', '문서', '메일', '회의'] },
  { id: 'study', label: '공부', categories: ['education'], keywords: ['공부', '교육', '학습', '영어', '강의'] },
  { id: 'photo', label: '사진', categories: ['photo_camera'], keywords: ['사진', '카메라', '갤러리', '셀카'] },
  { id: 'utility', label: '유틸리티', categories: ['system_tools'], keywords: ['유틸', '유틸리티', '도구', '계산기', '손전등', 'qr', '번역', '파일', '녹음'] },
];

export function findPurposeIntent(id: string): PurposeIntent | undefined {
  return PURPOSE_INTENTS.find((i) => i.id === id);
}

/** 검색어 → 목적. 정확 일치를 우선하고, 부분 일치는 가장 긴 키워드를 고른다. */
export function matchIntent(query: string): PurposeIntent | null {
  const full = normalizeText(query);
  if (!full) return null;
  const stripped = stripParticles(query);
  let best: { intent: PurposeIntent; score: number } | null = null;
  for (const intent of PURPOSE_INTENTS) {
    for (const k of [intent.label, ...intent.keywords].map(normalizeText)) {
      let score = 0;
      if (k === full || k === stripped) score = 100 + k.length;
      else if (k.length >= 2 && (full.includes(k) || stripped.includes(k))) score = 50 + k.length;
      if (score > 0 && (!best || score > best.score)) best = { intent, score };
    }
  }
  return best?.intent ?? null;
}
