import type { PlatformServices } from '../ports';
import { DEMO_DEVICE_APPS } from './demo-apps';

/**
 * 웹 프리뷰 전용. 화면 확인을 위해 "가상 데이터"를 보여 주며, 화면 상단에 데모 배지를 표시한다.
 * 실제 설치 앱이 아니며 실행도 하지 않는다.
 */
export function createWebPlatform(): PlatformServices {
  return {
    capabilities: {
      platform: 'web',
      canEnumerateInstalledApps: true,
      canReadUsageStats: false,
      canOpenAppSettings: false,
      nativeModuleAvailable: false,
      isDemo: true,
      limitationNote: '웹 미리보기는 화면 확인용 가상 앱 목록을 보여 줘요. 실제 앱 실행은 Android 앱에서 동작해요.',
    },
    catalog: {
      async scan() {
        return DEMO_DEVICE_APPS.map(({ accentColor: _accent, monogram: _mono, ...rec }) => rec);
      },
      async clearIconCache() {},
    },
    launcher: {
      async launch() {
        return { opened: false, reason: 'unsupported' };
      },
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
