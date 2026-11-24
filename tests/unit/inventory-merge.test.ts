import { mergeScan } from '@/domain/apps/inventory-merge';

import { rec, syntheticApps } from '../fixtures/synthetic-apps';

const T2 = '2026-11-25T00:00:00.000Z';

describe('inventory-merge', () => {
  it('스캔 갱신이 사용자 데이터를 보존한다', () => {
    const before = syntheticApps().map((a) =>
      a.packageName === 'com.netflix.mediaclient'
        ? { ...a, userCategoryId: 'games' as const, aliases: ['넷플'], isFavorite: true, isHidden: true, isCleanupCandidate: true, cleanupReason: 'manual' as const, appDeckLaunchCount: 3 }
        : a,
    );
    const { apps, updated } = mergeScan(before, [rec('com.netflix.mediaclient', 'Netflix', { versionCode: '2' })], 'android', T2);
    const n = apps.find((a) => a.packageName === 'com.netflix.mediaclient')!;
    expect(n.displayName).toBe('Netflix');
    expect(n.versionCode).toBe('2');
    expect(n).toMatchObject({
      userCategoryId: 'games',
      aliases: ['넷플'],
      isFavorite: true,
      isHidden: true,
      isCleanupCandidate: true,
      appDeckLaunchCount: 3,
    });
    expect(updated).toBe(1);
  });

  it('같은 패키지를 중복 등록하지 않는다', () => {
    const { apps, added } = mergeScan([], [rec('a.b', 'A'), rec('a.b', 'A')], 'android', T2);
    expect(apps).toHaveLength(1);
    expect(added).toBe(1);
  });

  it('스캔에서 사라진 앱은 삭제하지 않고 removed로 표시한다', () => {
    const before = syntheticApps();
    const { apps, removed } = mergeScan(before, [rec('com.sampleapp', '배달의민족')], 'android', T2);
    expect(apps).toHaveLength(before.length);
    expect(removed).toBe(before.length - 1);
    expect(apps.find((a) => a.packageName === 'com.coupang.mobile')!.installationStatus).toBe('removed');
    expect(apps.find((a) => a.packageName === 'com.sampleapp')!.installationStatus).toBe('device_confirmed');
  });

  it('다시 설치되면 device_confirmed로 돌아온다', () => {
    const gone = mergeScan(syntheticApps(), [], 'android', T2).apps;
    const back = mergeScan(gone, [rec('com.iloen.melon', '멜론')], 'android', T2).apps;
    expect(back.find((a) => a.packageName === 'com.iloen.melon')!.installationStatus).toBe('device_confirmed');
  });

  it('직접 등록 앱은 스캔에 영향받지 않는다', () => {
    const manual = { ...syntheticApps()[0], id: 'manual:1', packageName: null, source: 'manual' as const, installationStatus: 'unknown' as const };
    const { apps } = mergeScan([manual], [], 'android', T2);
    expect(apps).toEqual([manual]);
  });
});
