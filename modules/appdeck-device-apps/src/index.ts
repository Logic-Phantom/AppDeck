import { requireOptionalNativeModule } from 'expo-modules-core';

/** 네이티브 ↔ JS 계약. Android(Kotlin)만 구현되어 있다. iOS에는 전체 앱 열거 공개 API가 없다. */
export interface NativeDeviceAppRecord {
  packageName: string;
  displayName: string;
  versionName?: string | null;
  versionCode?: string | null;
  firstInstallTime?: number | null;
  lastUpdateTime?: number | null;
  isSystemApp: boolean;
  hasLaunchIntent: boolean;
  iconCacheUri?: string | null;
  platformCategory?: number | null;
}

export interface NativeUsageRecord {
  packageName: string;
  lastTimeUsed: number | null;
  totalTimeInForegroundMs: number | null;
}

export interface NativeLaunchResult {
  opened: boolean;
  reason?: 'not_installed' | 'no_launch_intent' | 'disabled' | 'permission_denied' | 'launch_failed' | 'settings_unavailable';
}

export interface AppDeckDeviceAppsNative {
  getCapabilities(): Promise<{
    platform: 'android';
    canEnumerateInstalledApps: boolean;
    canReadUsageStats: boolean;
    requiresBroadPackageVisibility: boolean;
    sdkInt: number;
  }>;
  listLaunchableApps(includeSystemApps: boolean): Promise<NativeDeviceAppRecord[]>;
  launchApp(packageName: string): Promise<NativeLaunchResult>;
  openAppSettings(packageName: string): Promise<NativeLaunchResult>;
  getUsageAccessStatus(): Promise<'granted' | 'denied'>;
  openUsageAccessSettings(): Promise<void>;
  getUsageSummary(fromMs: number, toMs: number): Promise<NativeUsageRecord[]>;
  clearIconCache(): Promise<boolean>;
}

/** Development Build(Android)에서만 존재한다. Expo Go·웹·iOS에서는 null. */
export const AppDeckDeviceApps = requireOptionalNativeModule<AppDeckDeviceAppsNative>('AppDeckDeviceApps');
