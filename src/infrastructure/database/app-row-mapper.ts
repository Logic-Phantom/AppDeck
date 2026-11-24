import type { AppEntry, AppPlatform, AppSource, CleanupReason, InstallationStatus } from '@/domain/apps/app.types';
import { isCategoryId } from '@/domain/categories/category.catalog';
import type { CategoryConfidence } from '@/domain/categories/category.types';

import type { SqlValue } from './sql-driver';

export interface AppRow {
  id: string;
  platform: string;
  package_name: string | null;
  display_name: string;
  version_name: string | null;
  version_code: string | null;
  first_install_time: number | null;
  last_update_time: number | null;
  is_system_app: number;
  has_launch_intent: number;
  source: string;
  installation_status: string;
  platform_category: number | null;
  suggested_category_id: string | null;
  suggestion_confidence: string | null;
  user_category_id: string | null;
  icon_cache_uri: string | null;
  accent_color: string | null;
  launch_url: string | null;
  is_favorite: number;
  favorite_order: number;
  is_hidden: number;
  is_cleanup_candidate: number;
  cleanup_reason: string | null;
  last_scanned_at: string | null;
  last_opened_from_appdeck_at: string | null;
  appdeck_launch_count: number;
  created_at: string;
  updated_at: string;
}

export const APP_COLUMNS = [
  'id', 'platform', 'package_name', 'display_name', 'version_name', 'version_code', 'first_install_time',
  'last_update_time', 'is_system_app', 'has_launch_intent', 'source', 'installation_status', 'platform_category',
  'suggested_category_id', 'suggestion_confidence', 'user_category_id', 'icon_cache_uri', 'accent_color', 'launch_url',
  'is_favorite', 'favorite_order', 'is_hidden', 'is_cleanup_candidate', 'cleanup_reason', 'last_scanned_at',
  'last_opened_from_appdeck_at', 'appdeck_launch_count', 'created_at', 'updated_at',
] as const;

const CONFIDENCE: CategoryConfidence[] = ['high', 'medium', 'low'];

export function rowToApp(row: AppRow, aliases: string[]): AppEntry {
  return {
    id: row.id,
    platform: row.platform as AppPlatform,
    packageName: row.package_name,
    displayName: row.display_name,
    versionName: row.version_name,
    versionCode: row.version_code,
    firstInstallTime: row.first_install_time,
    lastUpdateTime: row.last_update_time,
    isSystemApp: row.is_system_app === 1,
    hasLaunchIntent: row.has_launch_intent === 1,
    source: row.source as AppSource,
    installationStatus: row.installation_status as InstallationStatus,
    platformCategory: row.platform_category,
    suggestedCategoryId: isCategoryId(row.suggested_category_id) ? row.suggested_category_id : 'other',
    suggestionConfidence: CONFIDENCE.includes(row.suggestion_confidence as CategoryConfidence)
      ? (row.suggestion_confidence as CategoryConfidence)
      : 'low',
    userCategoryId: isCategoryId(row.user_category_id) ? row.user_category_id : null,
    iconUri: row.icon_cache_uri,
    accentColor: row.accent_color,
    launchUrl: row.launch_url,
    aliases,
    isFavorite: row.is_favorite === 1,
    favoriteOrder: row.favorite_order,
    isHidden: row.is_hidden === 1,
    isCleanupCandidate: row.is_cleanup_candidate === 1,
    cleanupReason: (row.cleanup_reason as CleanupReason | null) ?? null,
    lastScannedAt: row.last_scanned_at,
    lastOpenedFromAppDeckAt: row.last_opened_from_appdeck_at,
    appDeckLaunchCount: row.appdeck_launch_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function appToParams(app: AppEntry): SqlValue[] {
  const b = (v: boolean) => (v ? 1 : 0);
  return [
    app.id, app.platform, app.packageName, app.displayName, app.versionName, app.versionCode, app.firstInstallTime,
    app.lastUpdateTime, b(app.isSystemApp), b(app.hasLaunchIntent), app.source, app.installationStatus,
    app.platformCategory, app.suggestedCategoryId, app.suggestionConfidence, app.userCategoryId, app.iconUri,
    app.accentColor, app.launchUrl, b(app.isFavorite), app.favoriteOrder, b(app.isHidden), b(app.isCleanupCandidate),
    app.cleanupReason, app.lastScannedAt, app.lastOpenedFromAppDeckAt, app.appDeckLaunchCount, app.createdAt,
    app.updatedAt,
  ];
}
