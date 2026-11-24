import { Platform } from 'react-native';

import { createAndroidPlatform } from './android/android-platform';
import { createIosPlatform } from './ios/ios-platform';
import type { PlatformServices } from './ports';
import { createWebPlatform } from './web/web-platform';

let services: PlatformServices | null = null;

export function getPlatformServices(): PlatformServices {
  if (!services) {
    services =
      Platform.OS === 'android' ? createAndroidPlatform() : Platform.OS === 'ios' ? createIosPlatform() : createWebPlatform();
  }
  return services;
}

export type { PlatformServices } from './ports';
