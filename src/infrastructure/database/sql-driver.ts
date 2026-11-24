export type SqlValue = string | number | null;

/** expo-sqlite를 감싼 최소 드라이버. 테스트에서 대체할 수 있도록 분리한다. */
export interface SqlDriver {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlValue[]): Promise<unknown>;
  getAllAsync<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
