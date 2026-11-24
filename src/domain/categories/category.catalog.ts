import type { AppCategoryId, CategoryDefinition } from './category.types';

export const CATEGORY_CATALOG: readonly CategoryDefinition[] = [
  { id: 'food_delivery', name: '음식 배달', shortName: '배달앱', sortOrder: 1 },
  { id: 'food_dining', name: '음식점·카페', shortName: '음식점', sortOrder: 2 },
  { id: 'maps_navigation', name: '지도·길찾기', shortName: '지도', sortOrder: 3 },
  { id: 'transport_mobility', name: '교통·모빌리티', shortName: '교통', sortOrder: 4 },
  { id: 'streaming_video', name: 'OTT·영상', shortName: 'OTT', sortOrder: 5 },
  { id: 'tickets_culture', name: '영화·공연 예매', shortName: '예매', sortOrder: 6 },
  { id: 'shopping', name: '쇼핑', shortName: '쇼핑', sortOrder: 7 },
  { id: 'finance_payment', name: '금융·결제', shortName: '금융', sortOrder: 8 },
  { id: 'messaging_social', name: '메신저·소셜', shortName: '메신저', sortOrder: 9 },
  { id: 'music_audio', name: '음악·오디오', shortName: '음악', sortOrder: 10 },
  { id: 'travel_booking', name: '여행·숙소', shortName: '여행', sortOrder: 11 },
  { id: 'productivity', name: '생산성', shortName: '생산성', sortOrder: 12 },
  { id: 'photo_camera', name: '사진·카메라', shortName: '사진', sortOrder: 13 },
  { id: 'health_lifestyle', name: '건강·생활', shortName: '생활', sortOrder: 14 },
  { id: 'games', name: '게임', shortName: '게임', sortOrder: 15 },
  { id: 'system_tools', name: '시스템·도구', shortName: '도구', sortOrder: 16 },
  { id: 'other', name: '기타', shortName: '기타', sortOrder: 99 },
];

const BY_ID = new Map(CATEGORY_CATALOG.map((c) => [c.id, c]));

export function getCategory(id: AppCategoryId): CategoryDefinition {
  return BY_ID.get(id) ?? BY_ID.get('other')!;
}

export function isCategoryId(value: unknown): value is AppCategoryId {
  return typeof value === 'string' && BY_ID.has(value as AppCategoryId);
}
