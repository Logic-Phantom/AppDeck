import type { AppEntry, CleanupReason } from '../apps/app.types';

export const CLEANUP_REASON_LABEL: Record<CleanupReason, string> = {
  manual: '직접 설정',
  duplicate: '비슷한 앱이 있어요',
  rarely: '필요할 때만 사용',
  recheck: '다시 확인',
  usage_stats: '기간 내 실행 기록 없음',
};

export interface UsageSummary {
  packageName: string;
  /** 0/없음은 "정보 없음"이며 미사용으로 단정하지 않는다 */
  lastTimeUsed: number | null;
}

export interface CleanupOverview {
  managedCount: number;
  candidateCount: number;
  /** 정리 후보가 아닌 앱의 비율(0~100). 사용 기록이 아니라 사용자가 정리한 상태를 뜻한다. */
  tidyPercent: number;
}

export function cleanupOverview(apps: readonly AppEntry[]): CleanupOverview {
  const managedCount = apps.length;
  const candidateCount = apps.filter((a) => a.isCleanupCandidate).length;
  const tidyPercent = managedCount === 0 ? 100 : Math.round(((managedCount - candidateCount) / managedCount) * 100);
  return { managedCount, candidateCount, tidyPercent };
}

/**
 * 사용 기록(사용자가 허용한 Android UsageStats)으로 기간 내 실행 기록이 없는 앱을 찾는다.
 * - 사용 기록에 아예 없는 앱, lastTimeUsed가 null/0인 앱은 "정보 없음"으로 분리하며 미사용으로 보지 않는다.
 */
export function findUnusedByUsage(
  apps: readonly AppEntry[],
  usage: readonly UsageSummary[],
  sinceMs: number,
): { unused: AppEntry[]; unknown: AppEntry[] } {
  const byPkg = new Map(usage.map((u) => [u.packageName, u]));
  const unused: AppEntry[] = [];
  const unknown: AppEntry[] = [];
  for (const app of apps) {
    if (!app.packageName) continue;
    const u = byPkg.get(app.packageName);
    if (!u || !u.lastTimeUsed) unknown.push(app);
    else if (u.lastTimeUsed < sinceMs) unused.push(app);
  }
  return { unused, unknown };
}
