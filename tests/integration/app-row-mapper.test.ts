import { APP_COLUMNS, appToParams, rowToApp, type AppRow } from '@/infrastructure/database/app-row-mapper';
import { MIGRATIONS } from '@/infrastructure/database/migrations';

import { syntheticApps } from '../fixtures/synthetic-apps';

describe('SQLite 매핑', () => {
  it('AppEntry ↔ row 왕복 시 값이 보존된다', () => {
    const app = { ...syntheticApps()[0], isFavorite: true, userCategoryId: 'shopping' as const, aliases: ['배민'], cleanupReason: 'manual' as const, isCleanupCandidate: true };
    const params = appToParams(app);
    expect(params).toHaveLength(APP_COLUMNS.length);
    const row = Object.fromEntries(APP_COLUMNS.map((col, i) => [col, params[i]])) as unknown as AppRow;
    expect(rowToApp(row, app.aliases)).toEqual(app);
  });

  it('잘못된 카테고리 값은 안전하게 대체한다', () => {
    const params = appToParams(syntheticApps()[0]);
    const row = Object.fromEntries(APP_COLUMNS.map((col, i) => [col, params[i]])) as unknown as AppRow;
    const app = rowToApp({ ...row, suggested_category_id: 'nope', user_category_id: 'bad' }, []);
    expect(app.suggestedCategoryId).toBe('other');
    expect(app.userCategoryId).toBeNull();
  });

  it('마이그레이션 버전은 1부터 연속이며 apps 컬럼을 모두 만든다', () => {
    MIGRATIONS.forEach((m, i) => expect(m.version).toBe(i + 1));
    for (const col of APP_COLUMNS) expect(MIGRATIONS[0].sql).toContain(`${col} `);
  });
});
