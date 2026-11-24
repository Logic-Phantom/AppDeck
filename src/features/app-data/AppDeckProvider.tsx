import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { AppEntry, CleanupReason, LaunchHistoryEntry } from '@/domain/apps/app.types';
import { isVisible } from '@/domain/apps/app.types';
import { mergeScan } from '@/domain/apps/inventory-merge';
import { classifyApp } from '@/domain/categories/category-classifier';
import type { AppCategoryId } from '@/domain/categories/category.types';
import type { ParkingSession } from '@/domain/parking/parking';
import {
  DEFAULT_SETTINGS,
  getRepository,
  type AppDeckSettings,
  type PersistedState,
} from '@/infrastructure/storage';
import { getPlatformServices } from '@/platform';
import { LAUNCH_FAILURE_MESSAGE, type LaunchResult, type PlatformCapabilities } from '@/platform/ports';
import { DEMO_CLEANUP, DEMO_FAVORITES } from '@/platform/web/demo-apps';
import { createId } from '@/shared/ids';

export interface ManualAppInput {
  displayName: string;
  categoryId: AppCategoryId;
  launchUrl: string | null;
  aliases: string[];
}

interface AppDeckContextValue {
  ready: boolean;
  loadError: string | null;
  capabilities: PlatformCapabilities;
  settings: AppDeckSettings;
  /** 숨김·삭제·시스템 앱(옵션)을 제외한 화면 표시용 목록 */
  visibleApps: AppEntry[];
  allApps: AppEntry[];
  launches: LaunchHistoryEntry[];
  parking: ParkingSession | null;
  scanning: boolean;
  scanError: string | null;
  toast: string | null;
  showToast(message: string): void;
  getApp(id: string): AppEntry | undefined;
  acceptInventoryDisclosure(): Promise<void>;
  completeFirstRun(): Promise<void>;
  refreshInventory(): Promise<void>;
  launchApp(app: AppEntry): Promise<LaunchResult>;
  openAppSettings(app: AppEntry): Promise<void>;
  updateApp(id: string, patch: Partial<AppEntry>): Promise<void>;
  toggleFavorite(id: string): Promise<void>;
  setCategory(id: string, categoryId: AppCategoryId | null): Promise<void>;
  setCleanupCandidate(ids: string[], value: boolean, reason?: CleanupReason): Promise<void>;
  addManualApp(input: ManualAppInput): Promise<AppEntry>;
  deleteApp(id: string): Promise<void>;
  updateSettings(patch: Partial<AppDeckSettings>): Promise<void>;
  saveParking(session: ParkingSession | null): Promise<void>;
  clearIconCache(): Promise<void>;
  clearAllData(): Promise<void>;
  exportData(): string;
}

const Ctx = createContext<AppDeckContextValue | null>(null);

export function AppDeckProvider({ children }: { children: ReactNode }) {
  const platform = useMemo(() => getPlatformServices(), []);
  const repo = useMemo(() => getRepository(), []);
  const [state, setState] = useState<PersistedState>({ apps: [], launches: [], settings: DEFAULT_SETTINGS, parking: null });
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scanInFlight = useRef<Promise<void> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: PersistedState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const refreshInventory = useCallback(async () => {
    const s = stateRef.current;
    if (!platform.capabilities.canEnumerateInstalledApps || !s.settings.inventoryDisclosureAcceptedAt) return;
    if (scanInFlight.current) return scanInFlight.current; // 중복 스캔 방지
    const run = (async () => {
      setScanning(true);
      setScanError(null);
      try {
        const records = await platform.catalog.scan(s.settings.includeSystemApps);
        const now = new Date().toISOString();
        const before = stateRef.current;
        const merged = mergeScan(before.apps, records, platform.capabilities.platform, now);
        let apps = merged.apps;
        // 웹 데모 첫 시드: 레퍼런스 화면과 같은 즐겨찾기/정리 후보 예시 (실행 기록은 만들지 않음)
        if (platform.capabilities.isDemo && before.apps.length === 0) {
          apps = apps.map((a) => {
            const fav = DEMO_FAVORITES.indexOf(a.packageName ?? '');
            return {
              ...a,
              isFavorite: fav >= 0,
              favoriteOrder: fav >= 0 ? fav : 0,
              isCleanupCandidate: DEMO_CLEANUP.includes(a.packageName ?? ''),
              cleanupReason: DEMO_CLEANUP.includes(a.packageName ?? '') ? 'manual' : null,
            };
          });
        }
        const settings = { ...before.settings, lastInventoryScanAt: now };
        await repo.saveApps(apps);
        await repo.saveSettings(settings);
        commit({ ...stateRef.current, apps, settings });
      } catch {
        // 이전 목록은 그대로 유지한다
        setScanError('앱 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        setScanning(false);
        scanInFlight.current = null;
      }
    })();
    scanInFlight.current = run;
    return run;
  }, [platform, repo, commit]);

  useEffect(() => {
    let alive = true;
    repo
      .load()
      .then((loaded) => {
        if (!alive) return;
        commit(loaded);
        setReady(true);
        if (loaded.settings.inventoryDisclosureAcceptedAt) void refreshInventory();
      })
      .catch(() => {
        if (!alive) return;
        setLoadError('저장된 데이터를 여는 중 문제가 생겼어요. 설정에서 앱 데이터를 초기화할 수 있어요.');
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [repo, commit, refreshInventory]);

  const saveApp = useCallback(
    async (app: AppEntry) => {
      const s = stateRef.current;
      const exists = s.apps.some((a) => a.id === app.id);
      commit({ ...s, apps: exists ? s.apps.map((a) => (a.id === app.id ? app : a)) : [...s.apps, app] });
      await repo.saveApp(app);
    },
    [repo, commit],
  );

  const updateApp = useCallback(
    async (id: string, patch: Partial<AppEntry>) => {
      const app = stateRef.current.apps.find((a) => a.id === id);
      if (!app) return;
      await saveApp({ ...app, ...patch, id, updatedAt: new Date().toISOString() });
    },
    [saveApp],
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppDeckSettings>) => {
      const settings = { ...stateRef.current.settings, ...patch };
      commit({ ...stateRef.current, settings });
      await repo.saveSettings(settings);
    },
    [repo, commit],
  );

  const value = useMemo<AppDeckContextValue>(() => {
    const visibleApps = state.apps
      .filter((a) => isVisible(a, state.settings.includeSystemApps))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'ko'));
    return {
      ready,
      loadError,
      capabilities: platform.capabilities,
      settings: state.settings,
      visibleApps,
      allApps: state.apps,
      launches: state.launches,
      parking: state.parking,
      scanning,
      scanError,
      toast,
      showToast,
      getApp: (id) => state.apps.find((a) => a.id === id),
      async acceptInventoryDisclosure() {
        await updateSettings({ inventoryDisclosureAcceptedAt: new Date().toISOString() });
        await refreshInventory();
      },
      async completeFirstRun() {
        await updateSettings({ firstRunCompleted: true });
      },
      refreshInventory,
      async launchApp(app) {
        const result = await platform.launcher.launch(app);
        const now = new Date().toISOString();
        const entry: LaunchHistoryEntry = {
          id: createId(),
          appId: app.id,
          launchedAt: now,
          result: result.opened ? 'opened' : 'failed',
          reason: result.reason ?? null,
        };
        // 웹 미리보기는 실행 자체가 불가능하므로 기록하지 않는다
        if (result.reason !== 'unsupported') {
          commit({ ...stateRef.current, launches: [entry, ...stateRef.current.launches].slice(0, 100) });
          await repo.addLaunch(entry);
        }
        if (result.opened) {
          await updateApp(app.id, {
            lastOpenedFromAppDeckAt: now,
            appDeckLaunchCount: app.appDeckLaunchCount + 1,
            installationStatus: app.source === 'manual' ? 'open_confirmed' : app.installationStatus,
          });
        } else {
          showToast(LAUNCH_FAILURE_MESSAGE[result.reason ?? 'launch_failed']);
          if (result.reason === 'not_installed') await updateApp(app.id, { installationStatus: 'removed' });
        }
        return result;
      },
      async openAppSettings(app) {
        const r = await platform.launcher.openAppSettings(app);
        if (!r.opened) showToast('이 기기에서는 앱 정보 화면을 열 수 없어요.');
      },
      updateApp,
      async toggleFavorite(id) {
        const app = stateRef.current.apps.find((a) => a.id === id);
        if (!app) return;
        const maxOrder = Math.max(0, ...stateRef.current.apps.filter((a) => a.isFavorite).map((a) => a.favoriteOrder));
        await updateApp(id, { isFavorite: !app.isFavorite, favoriteOrder: app.isFavorite ? 0 : maxOrder + 1 });
      },
      async setCategory(id, categoryId) {
        await updateApp(id, { userCategoryId: categoryId });
      },
      async setCleanupCandidate(ids, value, reason = 'manual') {
        const now = new Date().toISOString();
        const changed = stateRef.current.apps
          .filter((a) => ids.includes(a.id))
          .map((a) => ({ ...a, isCleanupCandidate: value, cleanupReason: value ? reason : null, updatedAt: now }));
        const map = new Map(changed.map((a) => [a.id, a]));
        commit({ ...stateRef.current, apps: stateRef.current.apps.map((a) => map.get(a.id) ?? a) });
        await repo.saveApps(changed);
      },
      async addManualApp(input) {
        const now = new Date().toISOString();
        const suggestion = classifyApp({ displayName: input.displayName, userCategoryId: input.categoryId });
        const app: AppEntry = {
          id: `manual:${createId()}`,
          platform: platform.capabilities.platform,
          packageName: null,
          displayName: input.displayName.trim(),
          versionName: null,
          versionCode: null,
          firstInstallTime: null,
          lastUpdateTime: null,
          isSystemApp: false,
          hasLaunchIntent: false,
          source: 'manual',
          installationStatus: 'unknown',
          platformCategory: null,
          suggestedCategoryId: suggestion.categoryId,
          suggestionConfidence: 'high',
          userCategoryId: input.categoryId,
          iconUri: null,
          accentColor: null,
          launchUrl: input.launchUrl,
          aliases: input.aliases,
          isFavorite: false,
          favoriteOrder: 0,
          isHidden: false,
          isCleanupCandidate: false,
          cleanupReason: null,
          lastScannedAt: null,
          lastOpenedFromAppDeckAt: null,
          appDeckLaunchCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        await saveApp(app);
        return app;
      },
      async deleteApp(id) {
        const s = stateRef.current;
        commit({ ...s, apps: s.apps.filter((a) => a.id !== id), launches: s.launches.filter((l) => l.appId !== id) });
        await repo.deleteApp(id);
      },
      updateSettings,
      async saveParking(session) {
        commit({ ...stateRef.current, parking: session });
        await repo.saveParking(session);
      },
      async clearIconCache() {
        await platform.catalog.clearIconCache();
        showToast('아이콘 캐시를 삭제했어요. 다음 새로고침 때 다시 만들어요.');
      },
      async clearAllData() {
        await repo.clearAll();
        await platform.catalog.clearIconCache();
        commit({ apps: [], launches: [], settings: DEFAULT_SETTINGS, parking: null });
      },
      exportData() {
        const s = stateRef.current;
        return JSON.stringify(
          {
            format: 'appdeck-backup',
            version: 1,
            exportedAt: new Date().toISOString(),
            note: '설치 앱 목록이 포함된 민감한 파일입니다. 공유에 주의하세요.',
            apps: s.apps,
            launches: s.launches,
            settings: s.settings,
          },
          null,
          2,
        );
      },
    };
  }, [state, ready, loadError, platform, scanning, scanError, toast, showToast, refreshInventory, updateApp, updateSettings, saveApp, repo, commit]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppDeck(): AppDeckContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppDeckProvider가 필요합니다');
  return v;
}
