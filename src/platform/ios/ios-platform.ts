import { openRegisteredLink } from '../link-launcher';
import type { PlatformServices } from '../ports';

/**
 * iOS: 일반 앱이 설치 앱 전체를 열거하는 공개 API는 없다.
 * → 수동 앱 보관함 + 사용자가 등록한 링크 실행만 제공한다. Screen Time(Family Controls)은 사용하지 않는다.
 */
export function createIosPlatform(): PlatformServices {
  return {
    capabilities: {
      platform: 'ios',
      canEnumerateInstalledApps: false,
      canReadUsageStats: false,
      canOpenAppSettings: false,
      nativeModuleAvailable: false,
      isDemo: false,
      limitationNote: 'iPhone은 설치된 앱 목록을 다른 앱이 읽을 수 없어요. 자주 쓰는 앱을 직접 등록해 주세요.',
    },
    catalog: {
      async scan() {
        return [];
      },
      async clearIconCache() {},
    },
    launcher: {
      launch: openRegisteredLink,
      async openAppSettings() {
        return { opened: false, reason: 'unsupported' };
      },
    },
    usage: {
      async getStatus() {
        return 'unsupported';
      },
      async openSettings() {},
      async getSummary() {
        return [];
      },
    },
  };
}
