import type { AppCategoryId, CategoryConfidence } from '../categories/category.types';

export type AppPlatform = 'android' | 'ios' | 'web';
/** device_scan: 기기에서 확인됨 / manual: 사용자가 직접 등록 / demo: 웹 프리뷰 가상 데이터 */
export type AppSource = 'device_scan' | 'manual' | 'demo';
export type InstallationStatus = 'device_confirmed' | 'removed' | 'unknown' | 'user_marked_installed' | 'open_confirmed';
export type CleanupReason = 'manual' | 'duplicate' | 'rarely' | 'recheck' | 'usage_stats';

export interface AppEntry {
  id: string;
  platform: AppPlatform;
  packageName: string | null;
  displayName: string;
  versionName: string | null;
  versionCode: string | null;
  firstInstallTime: number | null;
  lastUpdateTime: number | null;
  isSystemApp: boolean;
  hasLaunchIntent: boolean;
  source: AppSource;
  installationStatus: InstallationStatus;
  platformCategory: number | null;
  suggestedCategoryId: AppCategoryId;
  suggestionConfidence: CategoryConfidence;
  userCategoryId: AppCategoryId | null;
  iconUri: string | null;
  /** 아이콘이 없을 때 쓰는 모노그램 배경색 (데모/직접 등록) */
  accentColor: string | null;
  launchUrl: string | null;
  aliases: string[];
  isFavorite: boolean;
  favoriteOrder: number;
  isHidden: boolean;
  isCleanupCandidate: boolean;
  cleanupReason: CleanupReason | null;
  lastScannedAt: string | null;
  lastOpenedFromAppDeckAt: string | null;
  appDeckLaunchCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 네이티브 스캔 결과를 정규화한 레코드 */
export interface DeviceAppRecord {
  packageName: string;
  displayName: string;
  versionName?: string | null;
  versionCode?: string | null;
  firstInstallTime?: number | null;
  lastUpdateTime?: number | null;
  isSystemApp: boolean;
  hasLaunchIntent: boolean;
  iconCacheUri?: string | null;
  platformCategory?: number | null;
}

export interface LaunchHistoryEntry {
  id: string;
  appId: string;
  launchedAt: string;
  result: 'opened' | 'failed';
  reason: string | null;
}

export function effectiveCategory(app: Pick<AppEntry, 'userCategoryId' | 'suggestedCategoryId'>): AppCategoryId {
  return app.userCategoryId ?? app.suggestedCategoryId;
}

/** 분류 확인 필요: 사용자가 직접 정하지 않았고 자동 후보의 신뢰도가 낮음 */
export function needsCategoryReview(app: AppEntry): boolean {
  return !app.userCategoryId && app.suggestionConfidence === 'low';
}

export function isVisible(app: AppEntry, includeSystemApps: boolean): boolean {
  if (app.isHidden) return false;
  if (app.installationStatus === 'removed') return false;
  if (app.isSystemApp && !includeSystemApps) return false;
  return true;
}
