import { useEffect, useMemo, useState } from 'react';

import type { AppEntry } from '@/domain/apps/app.types';
import { findUnusedByUsage } from '@/domain/cleanup/cleanup-rules';
import { useAppDeck } from '@/features/app-data/AppDeckProvider';
import { getPlatformServices } from '@/platform';

const DAY = 24 * 60 * 60 * 1000;
export const UNUSED_DAYS = 30;

export interface CleanupData {
  /** 사용자가 직접 정리 후보로 표시한 앱 */
  candidates: AppEntry[];
  /** 사용 기록(사용자가 허용한 경우)으로 확인한 최근 30일 실행 기록 없는 앱. 기능이 꺼져 있으면 null */
  unusedByUsage: AppEntry[] | null;
  /** 화면에 보여 줄 "안 쓰는 앱" = 후보 ∪ 사용 기록 미사용 (중복 제거) */
  unusedApps: AppEntry[];
  usageActive: boolean;
}

/**
 * 사용 기록은 사용자가 켜고 OS 권한이 실제로 허용된 경우에만, 이 훅을 쓰는 화면이 열릴 때 조회한다.
 * 권한이 없으면 추정하지 않고 사용자가 지정한 정리 후보만 쓴다.
 */
export function useCleanupData(): CleanupData {
  const { visibleApps, settings, capabilities } = useAppDeck();
  const usageActive = settings.usageStatsEnabled && capabilities.canReadUsageStats;
  const [unusedByUsage, setUnusedByUsage] = useState<AppEntry[] | null>(null);

  useEffect(() => {
    if (!usageActive) return;
    const usage = getPlatformServices().usage;
    let alive = true;
    (async () => {
      if ((await usage.getStatus()) !== 'granted') return;
      const now = Date.now();
      const since = now - UNUSED_DAYS * DAY;
      const summary = await usage.getSummary(since, now);
      if (alive) setUnusedByUsage(findUnusedByUsage(visibleApps, summary, since).unused);
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [usageActive, visibleApps]);

  return useMemo(() => {
    const candidates = visibleApps.filter((a) => a.isCleanupCandidate);
    const usage = usageActive ? unusedByUsage : null;
    const seen = new Set(candidates.map((a) => a.id));
    const unusedApps = [...candidates, ...(usage ?? []).filter((a) => !seen.has(a.id))];
    return { candidates, unusedByUsage: usage, unusedApps, usageActive };
  }, [visibleApps, usageActive, unusedByUsage]);
}

/** 정리 안내 문구 — 사용 기록이 없으면 "사용하지 않은"이라고 말하지 않는다 */
export function cleanupMessage(data: CleanupData): { headline: string; body: string; hasWork: boolean } {
  const usageCount = data.unusedByUsage?.length ?? 0;
  if (usageCount > 0) {
    return {
      headline: '정리할 앱이 있어요!',
      body: `최근 ${UNUSED_DAYS}일간 사용하지 않은 앱 ${usageCount}개를\n정리할 수 있어요.`,
      hasWork: true,
    };
  }
  if (data.candidates.length > 0) {
    return {
      headline: '정리할 앱이 있어요!',
      body: `정리 후보로 표시한 앱 ${data.candidates.length}개를\n정리할 수 있어요.`,
      hasWork: true,
    };
  }
  return {
    headline: '정리할 앱이 없어요',
    body: '앱 정보에서 ‘정리 후보로 표시’하거나\n설정에서 앱 사용 기록을 켜 보세요.',
    hasWork: false,
  };
}
