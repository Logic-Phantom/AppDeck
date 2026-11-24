export type AppCategoryId =
  | 'food_delivery'
  | 'food_dining'
  | 'maps_navigation'
  | 'transport_mobility'
  | 'streaming_video'
  | 'tickets_culture'
  | 'shopping'
  | 'finance_payment'
  | 'messaging_social'
  | 'music_audio'
  | 'travel_booking'
  | 'productivity'
  | 'photo_camera'
  | 'health_lifestyle'
  | 'games'
  | 'system_tools'
  | 'other';

export type CategoryConfidence = 'high' | 'medium' | 'low';

export interface CategorySuggestion {
  categoryId: AppCategoryId;
  confidence: CategoryConfidence;
  reasons: string[];
  source: 'user' | 'platform' | 'local_rule' | 'fallback';
}

export interface CategoryDefinition {
  id: AppCategoryId;
  /** 카테고리 정식 이름 (앱 카드 부제목) */
  name: string;
  /** 검색 결과 탭에 쓰는 짧은 이름 */
  shortName: string;
  sortOrder: number;
}
