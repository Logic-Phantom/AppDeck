import type { AppEntry, LaunchHistoryEntry } from '@/domain/apps/app.types';
import type { ParkingSession } from '@/domain/parking/parking';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppDeckSettings {
  firstRunCompleted: boolean;
  /** 설치 앱 목록 확인 고지에 동의한 시각. null이면 스캔하지 않는다. */
  inventoryDisclosureAcceptedAt: string | null;
  includeSystemApps: boolean;
  /** 사용 기록 기능 — 기본 OFF */
  usageStatsEnabled: boolean;
  usageStatsDisclosureAcceptedAt: string | null;
  theme: ThemePreference;
  lastInventoryScanAt: string | null;
}

export const DEFAULT_SETTINGS: AppDeckSettings = {
  firstRunCompleted: false,
  inventoryDisclosureAcceptedAt: null,
  includeSystemApps: false,
  usageStatsEnabled: false,
  usageStatsDisclosureAcceptedAt: null,
  theme: 'system',
  lastInventoryScanAt: null,
};

export interface PersistedState {
  apps: AppEntry[];
  launches: LaunchHistoryEntry[];
  settings: AppDeckSettings;
  parking: ParkingSession | null;
}

/** UI는 이 인터페이스만 안다. 네이티브는 SQLite, 웹 프리뷰는 localStorage 구현을 쓴다. */
export interface AppDeckRepository {
  load(): Promise<PersistedState>;
  /** 스캔 결과처럼 여러 앱을 한 트랜잭션으로 저장 */
  saveApps(apps: readonly AppEntry[]): Promise<void>;
  saveApp(app: AppEntry): Promise<void>;
  deleteApp(id: string): Promise<void>;
  addLaunch(entry: LaunchHistoryEntry): Promise<void>;
  saveSettings(settings: AppDeckSettings): Promise<void>;
  saveParking(session: ParkingSession | null): Promise<void>;
  /** 앱덱 데이터 전체 삭제 (앱 목록·사용자 설정·실행 기록·주차 메모) */
  clearAll(): Promise<void>;
}

export const MAX_LAUNCH_HISTORY = 100;
