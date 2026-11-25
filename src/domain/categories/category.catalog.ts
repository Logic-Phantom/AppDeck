import type { AppCategoryId, CategoryDefinition, CategoryGroupId } from './category.types';

export const CATEGORY_CATALOG: readonly CategoryDefinition[] = [
  { id: 'food_delivery', name: '배달·주문', shortName: '배달앱', appLabel: '음식 배달', tagline: '맛있는 걸 더 빠르게', group: 'lifestyle', sortOrder: 1 },
  { id: 'maps_navigation', name: '지도·위치', shortName: '지도', appLabel: '지도·길찾기', tagline: '어디든지 쉽게', group: 'mobility', sortOrder: 2 },
  { id: 'streaming_video', name: 'OTT·영상', shortName: 'OTT', appLabel: '영상 스트리밍', tagline: '보고 싶은 콘텐츠를', group: 'entertainment', sortOrder: 3 },
  { id: 'shopping', name: '쇼핑', shortName: '쇼핑', appLabel: '쇼핑', tagline: '원하는 걸 바로', group: 'lifestyle', sortOrder: 4 },
  { id: 'transport_mobility', name: '교통·이동', shortName: '교통', appLabel: '교통·이동', tagline: '더 스마트하게', group: 'mobility', sortOrder: 5 },
  { id: 'health_lifestyle', name: '생활편의', shortName: '생활', appLabel: '생활편의', tagline: '일상을 더 편리하게', group: 'lifestyle', sortOrder: 6 },
  { id: 'travel_booking', name: '여행·숙박', shortName: '여행', appLabel: '기차·버스·항공·숙소', tagline: '기차·항공·숙소 예약까지', group: 'mobility', sortOrder: 7 },
  { id: 'messaging_social', name: '메신저·SNS', shortName: '메신저', appLabel: '메신저·문자', tagline: '문자부터 SNS까지', group: 'tools', sortOrder: 8 },
  { id: 'games', name: '게임', shortName: '게임', appLabel: '게임', tagline: '잠깐의 즐거움', group: 'entertainment', sortOrder: 9 },
  { id: 'finance_payment', name: '금융·결제', shortName: '금융', appLabel: '금융·결제', tagline: '송금과 결제를 간편하게', group: 'lifestyle', sortOrder: 10 },
  { id: 'bills_tax', name: '공과금·세금', shortName: '공과금', appLabel: '공과금·세금·민원', tagline: '세금·요금·민원 한곳에', group: 'lifestyle', sortOrder: 11 },
  { id: 'food_dining', name: '음식점·카페', shortName: '음식점', appLabel: '음식점·카페', tagline: '카페·맛집 주문과 예약', group: 'lifestyle', sortOrder: 12 },
  { id: 'tickets_culture', name: '영화·공연', shortName: '예매', appLabel: '영화·공연 예매', tagline: '예매는 빠르게', group: 'entertainment', sortOrder: 13 },
  { id: 'music_audio', name: '음악·오디오', shortName: '음악', appLabel: '음악·오디오', tagline: '듣고 싶은 그대로', group: 'entertainment', sortOrder: 14 },
  { id: 'news_reading', name: '뉴스·웹툰·책', shortName: '읽기', appLabel: '뉴스·웹툰·도서', tagline: '읽을거리 모아보기', group: 'entertainment', sortOrder: 15 },
  { id: 'health_fitness', name: '건강·운동', shortName: '건강', appLabel: '건강·운동', tagline: '오늘도 건강하게', group: 'lifestyle', sortOrder: 16 },
  { id: 'productivity', name: '업무·생산성', shortName: '업무', appLabel: '업무·생산성', tagline: '일은 더 가볍게', group: 'tools', sortOrder: 17 },
  { id: 'education', name: '교육·학습', shortName: '교육', appLabel: '교육·학습', tagline: '배움을 꾸준히', group: 'tools', sortOrder: 18 },
  { id: 'photo_camera', name: '사진·카메라', shortName: '사진', appLabel: '사진·카메라', tagline: '순간을 남기기', group: 'tools', sortOrder: 19 },
  { id: 'system_tools', name: '유틸리티', shortName: '유틸', appLabel: '유틸리티', tagline: '계산기·파일·QR 같은 도구', group: 'tools', sortOrder: 20 },
  { id: 'other', name: '기타', shortName: '기타', appLabel: '기타', tagline: '분류가 필요한 앱', group: 'tools', sortOrder: 99 },
];

export const CATEGORY_GROUPS: readonly { id: CategoryGroupId; name: string }[] = [
  { id: 'lifestyle', name: '라이프스타일' },
  { id: 'entertainment', name: '엔터테인먼트' },
  { id: 'mobility', name: '이동·여행' },
  { id: 'tools', name: '소통·도구' },
];

const BY_ID = new Map(CATEGORY_CATALOG.map((c) => [c.id, c]));

export function getCategory(id: AppCategoryId): CategoryDefinition {
  return BY_ID.get(id) ?? BY_ID.get('other')!;
}

export function isCategoryId(value: unknown): value is AppCategoryId {
  return typeof value === 'string' && BY_ID.has(value as AppCategoryId);
}
