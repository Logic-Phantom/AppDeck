import { classifyApp } from '../categories/category-classifier';
import type { AppEntry, AppPlatform, DeviceAppRecord } from './app.types';

export function deviceAppId(platform: AppPlatform, packageName: string): string {
  return `${platform}:${packageName}`;
}

export interface MergeResult {
  apps: AppEntry[];
  added: number;
  updated: number;
  removed: number;
}

/**
 * 스캔 결과를 기존 목록에 병합한다 (순수 함수).
 * - 기기 메타데이터(이름·버전·아이콘·시스템 여부)만 갱신한다.
 * - 사용자 데이터(사용자 분류·별칭·즐겨찾기·숨김·정리 후보·실행 횟수)는 절대 덮어쓰지 않는다.
 * - 스캔에서 사라진 device_scan 앱은 삭제하지 않고 installationStatus='removed'로 표시한다.
 * - manual/demo 항목은 스캔과 무관하게 그대로 둔다.
 */
export function mergeScan(
  existing: readonly AppEntry[],
  scanned: readonly DeviceAppRecord[],
  platform: AppPlatform,
  nowIso: string,
): MergeResult {
  const byId = new Map(existing.map((a) => [a.id, a]));
  const seen = new Set<string>();
  let added = 0;
  let updated = 0;
  let removed = 0;
  const out: AppEntry[] = [];

  for (const rec of scanned) {
    const id = deviceAppId(platform, rec.packageName);
    if (seen.has(id)) continue; // 같은 패키지 중복 방지
    seen.add(id);
    const prev = byId.get(id);
    const suggestion = classifyApp({
      displayName: rec.displayName,
      packageName: rec.packageName,
      platformCategory: rec.platformCategory ?? null,
    });
    if (prev) {
      const changed =
        prev.displayName !== rec.displayName ||
        prev.versionCode !== (rec.versionCode ?? null) ||
        prev.iconUri !== (rec.iconCacheUri ?? null) ||
        prev.installationStatus !== 'device_confirmed';
      if (changed) updated += 1;
      out.push({
        ...prev,
        displayName: rec.displayName,
        versionName: rec.versionName ?? null,
        versionCode: rec.versionCode ?? null,
        firstInstallTime: rec.firstInstallTime ?? null,
        lastUpdateTime: rec.lastUpdateTime ?? null,
        isSystemApp: rec.isSystemApp,
        hasLaunchIntent: rec.hasLaunchIntent,
        iconUri: rec.iconCacheUri ?? prev.iconUri,
        platformCategory: rec.platformCategory ?? null,
        suggestedCategoryId: suggestion.categoryId,
        suggestionConfidence: suggestion.confidence,
        installationStatus: 'device_confirmed',
        lastScannedAt: nowIso,
        updatedAt: changed ? nowIso : prev.updatedAt,
      });
    } else {
      added += 1;
      out.push({
        id,
        platform,
        packageName: rec.packageName,
        displayName: rec.displayName,
        versionName: rec.versionName ?? null,
        versionCode: rec.versionCode ?? null,
        firstInstallTime: rec.firstInstallTime ?? null,
        lastUpdateTime: rec.lastUpdateTime ?? null,
        isSystemApp: rec.isSystemApp,
        hasLaunchIntent: rec.hasLaunchIntent,
        source: 'device_scan',
        installationStatus: 'device_confirmed',
        platformCategory: rec.platformCategory ?? null,
        suggestedCategoryId: suggestion.categoryId,
        suggestionConfidence: suggestion.confidence,
        userCategoryId: null,
        iconUri: rec.iconCacheUri ?? null,
        accentColor: null,
        launchUrl: null,
        aliases: [],
        isFavorite: false,
        favoriteOrder: 0,
        isHidden: false,
        isCleanupCandidate: false,
        cleanupReason: null,
        lastScannedAt: nowIso,
        lastOpenedFromAppDeckAt: null,
        appDeckLaunchCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }
  }

  for (const prev of existing) {
    if (seen.has(prev.id)) continue;
    if (prev.source === 'device_scan' && prev.platform === platform && prev.installationStatus !== 'removed') {
      removed += 1;
      out.push({ ...prev, installationStatus: 'removed', updatedAt: nowIso });
    } else {
      out.push(prev);
    }
  }

  return { apps: out, added, updated, removed };
}
