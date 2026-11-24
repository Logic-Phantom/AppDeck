import { AppDeckDeviceApps } from 'appdeck-device-apps';

import type { LaunchFailureReason, PlatformServices } from '../ports';

function toReason(reason: string | undefined): LaunchFailureReason {
  switch (reason) {
    case 'not_installed':
    case 'no_launch_intent':
    case 'disabled':
    case 'permission_denied':
      return reason;
    default:
      return 'launch_failed';
  }
}

/** Android: Kotlin Expo Module(PackageManager) 어댑터. 모듈이 없으면(Expo Go) 기능을 끈다. */
export function createAndroidPlatform(): PlatformServices {
  const native = AppDeckDeviceApps;
  const available = native != null;
  return {
    capabilities: {
      platform: 'android',
      canEnumerateInstalledApps: available,
      canReadUsageStats: available,
      canOpenAppSettings: available,
      nativeModuleAvailable: available,
      isDemo: false,
      limitationNote: available
        ? '기기에서 실행 가능한 앱 목록을 확인해요. 목록은 기기 밖으로 나가지 않아요.'
        : '이 빌드에는 앱 목록 모듈이 없어요(Expo Go). Development Build에서 실행해 주세요.',
    },
    catalog: {
      async scan(includeSystemApps) {
        if (!native) throw new Error('native_module_unavailable');
        return native.listLaunchableApps(includeSystemApps);
      },
      async clearIconCache() {
        await native?.clearIconCache();
      },
    },
    launcher: {
      async launch(app) {
        if (!native || !app.packageName) return { opened: false, reason: 'unsupported' };
        const r = await native.launchApp(app.packageName);
        return r.opened ? { opened: true } : { opened: false, reason: toReason(r.reason) };
      },
      async openAppSettings(app) {
        if (!native || !app.packageName) return { opened: false, reason: 'unsupported' };
        const r = await native.openAppSettings(app.packageName);
        return r.opened ? { opened: true } : { opened: false, reason: 'launch_failed' };
      },
    },
    usage: {
      async getStatus() {
        if (!native) return 'unsupported';
        return native.getUsageAccessStatus();
      },
      async openSettings() {
        await native?.openUsageAccessSettings();
      },
      async getSummary(fromMs, toMs) {
        if (!native) return [];
        const rows = await native.getUsageSummary(fromMs, toMs);
        return rows.map((r) => ({ packageName: r.packageName, lastTimeUsed: r.lastTimeUsed }));
      },
    },
  };
}
