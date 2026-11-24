import { cleanupOverview, findUnusedByUsage } from '@/domain/cleanup/cleanup-rules';
import { elapsedMs, estimateFee, formatDuration, togglePause, type ParkingSession } from '@/domain/parking/parking';

import { syntheticApps } from '../fixtures/synthetic-apps';

describe('cleanup-rules', () => {
  it('정리 비율은 정리 후보가 아닌 앱 비율이다', () => {
    const apps = syntheticApps();
    const marked = apps.map((a, i) => (i < 3 ? { ...a, isCleanupCandidate: true } : a));
    expect(cleanupOverview(marked)).toEqual({ managedCount: 9, candidateCount: 3, tidyPercent: 67 });
    expect(cleanupOverview([]).tidyPercent).toBe(100);
  });

  it('사용 기록이 없거나 0인 앱은 미사용이 아니라 정보 없음이다', () => {
    const apps = syntheticApps().slice(0, 3);
    const since = 1_000;
    const { unused, unknown } = findUnusedByUsage(
      apps,
      [
        { packageName: apps[0].packageName!, lastTimeUsed: 500 },
        { packageName: apps[1].packageName!, lastTimeUsed: 0 },
      ],
      since,
    );
    expect(unused.map((a) => a.id)).toEqual([apps[0].id]);
    expect(unknown.map((a) => a.id)).toEqual([apps[1].id, apps[2].id]);
  });
});

describe('parking', () => {
  const base: ParkingSession = {
    id: 'p',
    locationTitle: '지하 2층 B구역',
    locationDetail: '',
    photoUris: [],
    startedAt: '2026-11-24T10:00:00.000Z',
    pausedTotalMs: 0,
    pausedAt: null,
    feeRule: { baseMinutes: 30, baseFee: 2500, unitMinutes: 10, unitFee: 500 },
    endedAt: null,
  };
  const at = (iso: string) => Date.parse(iso);

  it('경과 시간을 hh:mm:ss로 표시한다', () => {
    expect(formatDuration(elapsedMs(base, at('2026-11-24T11:23:17.000Z')))).toBe('01:23:17');
  });

  it('일시정지 시간은 제외한다', () => {
    const paused = togglePause(base, '2026-11-24T10:10:00.000Z');
    const resumed = togglePause(paused, '2026-11-24T10:20:00.000Z');
    expect(resumed.pausedTotalMs).toBe(10 * 60_000);
    expect(elapsedMs(resumed, at('2026-11-24T10:30:00.000Z'))).toBe(20 * 60_000);
    expect(elapsedMs(paused, at('2026-11-24T10:50:00.000Z'))).toBe(10 * 60_000);
  });

  it('기본 시간 이후 단위 요금을 올림으로 더한다', () => {
    const rule = base.feeRule!;
    expect(estimateFee(rule, 20 * 60_000)).toBe(2500);
    expect(estimateFee(rule, 31 * 60_000)).toBe(3000);
    expect(estimateFee(rule, 83 * 60_000)).toBe(2500 + 6 * 500);
  });
});
