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
  { id: 'delivery', label: '배달 주문', categories: ['food_delivery', 'food_dining'], keywords: ['배달', '배달주문', '음식주문', '포장주문', '포장', '야식', '치킨', '피자', '음식', '맛집'] },
  { id: 'directions', label: '길 찾기', categories: ['maps_navigation', 'transport_mobility'], keywords: ['지도', '길찾기', '내비', '네비', '교통', '택시', '버스', '지하철', '주차', '위치'] },
  { id: 'ott', label: 'OTT 보기', categories: ['streaming_video'], keywords: ['ott', '영상', '드라마', '예능', '동영상', '스트리밍', 'tv'] },
  { id: 'shopping', label: '쇼핑하기', categories: ['shopping'], keywords: ['쇼핑', '온라인쇼핑', '장보기', '구매', '중고'] },
  { id: 'movie', label: '영화 예매', categories: ['tickets_culture', 'streaming_video'], keywords: ['영화', '영화예매', '예매', '공연', '티켓', '뮤지컬', '콘서트', '극장'] },
  { id: 'finance', label: '금융', categories: ['finance_payment'], keywords: ['은행', '송금', '결제', '금융', '계좌', '이체', '주식', '증권'] },
  { id: 'chat', label: '메신저', categories: ['messaging_social'], keywords: ['메신저', '채팅', '연락', '메시지', '문자', 'sns', '소셜'] },
  { id: 'music', label: '음악', categories: ['music_audio'], keywords: ['음악', '노래', '스트리밍음악', '뮤직', '팟캐스트', '라디오'] },
  { id: 'travel', label: '여행', categories: ['travel_booking', 'transport_mobility'], keywords: ['여행', '항공', '숙소', '호텔', '비행기', '숙박', '펜션'] },
  { id: 'work', label: '업무', categories: ['productivity'], keywords: ['업무', '메모', '일정', '캘린더', '문서', '메일', '회의'] },
  { id: 'photo', label: '사진', categories: ['photo_camera'], keywords: ['사진', '카메라', '갤러리', '셀카'] },
  { id: 'game', label: '게임', categories: ['games'], keywords: ['게임'] },
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
