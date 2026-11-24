import * as SQLite from 'expo-sqlite';

import type { LaunchHistoryEntry } from '@/domain/apps/app.types';
import type { ParkingSession } from '@/domain/parking/parking';
import { normalizeText } from '@/domain/search/query-normalizer';
import { createId } from '@/shared/ids';

import {
  DEFAULT_SETTINGS,
  MAX_LAUNCH_HISTORY,
  type AppDeckRepository,
  type AppDeckSettings,
} from '../storage/repository';
import { APP_COLUMNS, appToParams, rowToApp, type AppRow } from './app-row-mapper';
import { MIGRATIONS } from './migrations';
import type { SqlDriver } from './sql-driver';

const DATABASE_NAME = 'appdeck.db';
const SETTINGS_KEY = 'settings';
const UPSERT_APP = `INSERT OR REPLACE INTO apps (${APP_COLUMNS.join(', ')}) VALUES (${APP_COLUMNS.map(() => '?').join(', ')})`;

async function runMigrations(db: SqlDriver): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;
  for (const m of MIGRATIONS) {
    if (m.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(m.sql);
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
    });
    current = m.version;
  }
}

let opening: Promise<SqlDriver> | null = null;

function openDatabase(): Promise<SqlDriver> {
  if (!opening) {
    opening = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      const driver: SqlDriver = {
        execAsync: (sql) => db.execAsync(sql),
        runAsync: (sql, params = []) => db.runAsync(sql, params),
        getAllAsync: <T,>(sql: string, params: (string | number | null)[] = []) => db.getAllAsync<T>(sql, params),
        getFirstAsync: <T,>(sql: string, params: (string | number | null)[] = []) => db.getFirstAsync<T>(sql, params),
        withTransactionAsync: (task) => db.withTransactionAsync(task),
      };
      await runMigrations(driver);
      return driver;
    })().catch((error) => {
      opening = null;
      throw error;
    });
  }
  return opening;
}

async function writeAliases(db: SqlDriver, appId: string, aliases: readonly string[], now: string) {
  await db.runAsync('DELETE FROM app_aliases WHERE app_id = ?', [appId]);
  for (const alias of aliases) {
    await db.runAsync('INSERT INTO app_aliases (id, app_id, alias, normalized_alias, created_at) VALUES (?, ?, ?, ?, ?)', [
      createId(),
      appId,
      alias,
      normalizeText(alias),
      now,
    ]);
  }
}

export function createSqliteRepository(): AppDeckRepository {
  return {
    async load() {
      const db = await openDatabase();
      const rows = await db.getAllAsync<AppRow>('SELECT * FROM apps ORDER BY display_name');
      const aliasRows = await db.getAllAsync<{ app_id: string; alias: string }>('SELECT app_id, alias FROM app_aliases');
      const aliasMap = new Map<string, string[]>();
      for (const r of aliasRows) aliasMap.set(r.app_id, [...(aliasMap.get(r.app_id) ?? []), r.alias]);
      const launches = await db.getAllAsync<{ id: string; app_id: string; launched_at: string; result: string; reason: string | null }>(
        'SELECT * FROM app_launch_history ORDER BY launched_at DESC LIMIT ?',
        [MAX_LAUNCH_HISTORY],
      );
      const settingsRow = await db.getFirstAsync<{ value_json: string }>('SELECT value_json FROM app_settings WHERE key = ?', [SETTINGS_KEY]);
      const parkingRow = await db.getFirstAsync<{ payload_json: string }>('SELECT payload_json FROM parking_sessions ORDER BY updated_at DESC LIMIT 1');
      let settings: AppDeckSettings = DEFAULT_SETTINGS;
      try {
        if (settingsRow) settings = { ...DEFAULT_SETTINGS, ...(JSON.parse(settingsRow.value_json) as Partial<AppDeckSettings>) };
      } catch {
        settings = DEFAULT_SETTINGS;
      }
      let parking: ParkingSession | null = null;
      try {
        parking = parkingRow ? (JSON.parse(parkingRow.payload_json) as ParkingSession) : null;
      } catch {
        parking = null;
      }
      return {
        apps: rows.map((r) => rowToApp(r, aliasMap.get(r.id) ?? [])),
        launches: launches.map<LaunchHistoryEntry>((l) => ({
          id: l.id,
          appId: l.app_id,
          launchedAt: l.launched_at,
          result: l.result === 'opened' ? 'opened' : 'failed',
          reason: l.reason,
        })),
        settings,
        parking,
      };
    },
    async saveApps(apps) {
      const db = await openDatabase();
      const now = new Date().toISOString();
      await db.withTransactionAsync(async () => {
        for (const app of apps) {
          await db.runAsync(UPSERT_APP, appToParams(app));
          await writeAliases(db, app.id, app.aliases, now);
        }
      });
    },
    async saveApp(app) {
      const db = await openDatabase();
      await db.withTransactionAsync(async () => {
        await db.runAsync(UPSERT_APP, appToParams(app));
        await writeAliases(db, app.id, app.aliases, new Date().toISOString());
      });
    },
    async deleteApp(id) {
      const db = await openDatabase();
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM app_aliases WHERE app_id = ?', [id]);
        await db.runAsync('DELETE FROM app_launch_history WHERE app_id = ?', [id]);
        await db.runAsync('DELETE FROM apps WHERE id = ?', [id]);
      });
    },
    async addLaunch(entry) {
      const db = await openDatabase();
      await db.runAsync(
        'INSERT INTO app_launch_history (id, app_id, launched_at, launch_source, result, reason) VALUES (?, ?, ?, ?, ?, ?)',
        [entry.id, entry.appId, entry.launchedAt, 'appdeck', entry.result, entry.reason],
      );
      await db.runAsync(
        'DELETE FROM app_launch_history WHERE id NOT IN (SELECT id FROM app_launch_history ORDER BY launched_at DESC LIMIT ?)',
        [MAX_LAUNCH_HISTORY],
      );
    },
    async saveSettings(settings) {
      const db = await openDatabase();
      await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)', [
        SETTINGS_KEY,
        JSON.stringify(settings),
        new Date().toISOString(),
      ]);
    },
    async saveParking(session) {
      const db = await openDatabase();
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM parking_sessions');
        if (session) {
          await db.runAsync('INSERT INTO parking_sessions (id, payload_json, updated_at) VALUES (?, ?, ?)', [
            session.id,
            JSON.stringify(session),
            new Date().toISOString(),
          ]);
        }
      });
    },
    async clearAll() {
      const db = await openDatabase();
      await db.withTransactionAsync(async () => {
        await db.execAsync(
          'DELETE FROM app_aliases; DELETE FROM app_launch_history; DELETE FROM apps; DELETE FROM app_settings; DELETE FROM parking_sessions;',
        );
      });
    },
  };
}
