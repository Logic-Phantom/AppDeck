import { createSqliteRepository } from '../database/sqlite-repository';
import type { AppDeckRepository } from './repository';

let repo: AppDeckRepository | null = null;

/** Android/iOS: 기기 로컬 SQLite */
export function getRepository(): AppDeckRepository {
  if (!repo) repo = createSqliteRepository();
  return repo;
}

export * from './repository';
