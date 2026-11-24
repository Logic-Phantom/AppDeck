export interface Migration {
  version: number;
  sql: string;
}

/** 배포된 마이그레이션은 수정하지 않고 새 버전을 추가한다. */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    sql: `
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      package_name TEXT,
      display_name TEXT NOT NULL,
      version_name TEXT,
      version_code TEXT,
      first_install_time INTEGER,
      last_update_time INTEGER,
      is_system_app INTEGER NOT NULL DEFAULT 0,
      has_launch_intent INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL,
      installation_status TEXT NOT NULL DEFAULT 'unknown',
      platform_category INTEGER,
      suggested_category_id TEXT,
      suggestion_confidence TEXT,
      user_category_id TEXT,
      icon_cache_uri TEXT,
      accent_color TEXT,
      launch_url TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      favorite_order INTEGER NOT NULL DEFAULT 0,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      is_cleanup_candidate INTEGER NOT NULL DEFAULT 0,
      cleanup_reason TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      last_scanned_at TEXT,
      last_opened_from_appdeck_at TEXT,
      appdeck_launch_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_platform_package ON apps(platform, package_name) WHERE package_name IS NOT NULL;

    CREATE TABLE IF NOT EXISTS app_aliases (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      normalized_alias TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_aliases_app ON app_aliases(app_id);

    CREATE TABLE IF NOT EXISTS app_launch_history (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      launched_at TEXT NOT NULL,
      launch_source TEXT NOT NULL DEFAULT 'appdeck',
      result TEXT NOT NULL,
      reason TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_launch_time ON app_launch_history(launched_at);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parking_sessions (
      id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    `,
  },
];
