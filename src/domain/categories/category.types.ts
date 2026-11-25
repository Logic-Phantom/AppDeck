export type AppCategoryId =
  | 'food_delivery'
  | 'food_dining'
  | 'maps_navigation'
  | 'transport_mobility'
  | 'travel_booking'
  | 'streaming_video'
  | 'tickets_culture'
  | 'music_audio'
  | 'games'
  | 'news_reading'
  | 'shopping'
  | 'finance_payment'
  | 'bills_tax'
  | 'health_lifestyle'
  | 'health_fitness'
  | 'messaging_social'
  | 'productivity'
  | 'education'
  | 'photo_camera'
  /** 유틸리티 (기존 저장 데이터 호환을 위해 id 유지) */
  | 'system_tools'
  | 'other';

export type CategoryGroupId = 'lifestyle' | 'entertainment' | 'mobility' | 'tools';

export type CategoryConfidence = 'high' | 'medium' | 'low';

export interface CategorySuggestion {
  categoryId: AppCategoryId;
  confidence: CategoryConfidence;
  reasons: string[];
  source: 'user' | 'platform' | 'local_rule' | 'fallback';
}

export interface CategoryDefinition {
  id: AppCategoryId;
  /** 카테고리 정식 이름 (카테고리 카드 제목) */
  name: string;
  /** 검색 결과 탭·섹션에 쓰는 짧은 이름 */
  shortName: string;
  /** 앱 행 부제목 (예: "음식 배달") */
  appLabel: string;
  /** 카테고리 카드 부제목 */
  tagline: string;
  group: CategoryGroupId;
  sortOrder: number;
}
