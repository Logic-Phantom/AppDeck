import {
  DEFAULT_SETTINGS,
  MAX_LAUNCH_HISTORY,
  type AppDeckRepository,
  type PersistedState,
} from './repository';

const KEY = 'appdeck.web-preview.v1';

function empty(): PersistedState {
  return { apps: [], launches: [], settings: DEFAULT_SETTINGS, parking: null };
}

/**
 * 웹 프리뷰용 저장소. 브라우저 localStorage에만 저장한다(서버 전송 없음).
 * localStorage가 없는 환경(테스트)에서는 메모리에만 보관한다.
 */
export function createWebRepository(): AppDeckRepository {
  let state: PersistedState | null = null;
  const storage: Storage | null = typeof localStorage === 'undefined' ? null : localStorage;

  const read = (): PersistedState => {
    if (state) return state;
    try {
      const raw = storage?.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as PersistedState) : empty();
      state = { ...empty(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
    } catch {
      state = empty();
    }
    return state;
  };
  const write = (next: PersistedState) => {
    state = next;
    try {
      storage?.setItem(KEY, JSON.stringify(next));
    } catch {
      // 저장 공간 부족 등 — 메모리 상태는 유지
    }
  };

  return {
    async load() {
      return read();
    },
    async saveApps(apps) {
      const s = read();
      const map = new Map(s.apps.map((a) => [a.id, a]));
      for (const a of apps) map.set(a.id, a);
      write({ ...s, apps: [...map.values()] });
    },
    async saveApp(app) {
      const s = read();
      const exists = s.apps.some((a) => a.id === app.id);
      write({ ...s, apps: exists ? s.apps.map((a) => (a.id === app.id ? app : a)) : [...s.apps, app] });
    },
    async deleteApp(id) {
      const s = read();
      write({ ...s, apps: s.apps.filter((a) => a.id !== id), launches: s.launches.filter((l) => l.appId !== id) });
    },
    async addLaunch(entry) {
      const s = read();
      write({ ...s, launches: [entry, ...s.launches].slice(0, MAX_LAUNCH_HISTORY) });
    },
    async saveSettings(settings) {
      write({ ...read(), settings });
    },
    async saveParking(parking) {
      write({ ...read(), parking });
    },
    async clearAll() {
      state = empty();
      try {
        storage?.removeItem(KEY);
      } catch {
        // noop
      }
    },
  };
}
