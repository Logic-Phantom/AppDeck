import type { AppEntry, DeviceAppRecord } from '@/domain/apps/app.types';
import type { UsageSummary } from '@/domain/cleanup/cleanup-rules';

export interface PlatformCapabilities {
  platform: 'android' | 'ios' | 'web';
  /** 기기 설치 앱 목록을 OS에서 읽을 수 있는지 */
  canEnumerateInstalledApps: boolean;
  /** 사용 기록(UsageStats) 기능을 제공할 수 있는지 (권한 허용 여부와 별개) */
  canReadUsageStats: boolean;
  canOpenAppSettings: boolean;
  /** Android 네이티브 모듈이 빌드에 포함됐는지 (Expo Go/웹이면 false) */
  nativeModuleAvailable: boolean;
  /** 웹 프리뷰용 가상 데이터 */
  isDemo: boolean;
  limitationNote: string;
}

export type LaunchFailureReason =
  | 'not_installed'
  | 'no_launch_intent'
  | 'disabled'
  | 'permission_denied'
  | 'launch_failed'
  | 'no_link'
  | 'unsupported';

export interface LaunchResult {
  opened: boolean;
  reason?: LaunchFailureReason;
}

export interface AppCatalogPort {
  scan(includeSystemApps: boolean): Promise<DeviceAppRecord[]>;
  clearIconCache(): Promise<void>;
}

export interface AppLaunchPort {
  launch(app: AppEntry): Promise<LaunchResult>;
  openAppSettings(app: AppEntry): Promise<LaunchResult>;
}

export interface UsageStatsPort {
  getStatus(): Promise<'granted' | 'denied' | 'unsupported'>;
  openSettings(): Promise<void>;
  getSummary(fromMs: number, toMs: number): Promise<UsageSummary[]>;
}

export interface PlatformServices {
  capabilities: PlatformCapabilities;
  catalog: AppCatalogPort;
  launcher: AppLaunchPort;
  usage: UsageStatsPort;
}

export const LAUNCH_FAILURE_MESSAGE: Record<LaunchFailureReason, string> = {
  not_installed: '이 앱이 기기에서 삭제된 것 같아요. 목록을 새로고침해 주세요.',
  no_launch_intent: '이 앱은 바로 실행할 수 있는 화면이 없어요.',
  disabled: '이 앱은 기기에서 사용 중지 상태예요.',
  permission_denied: '시스템 제한으로 앱을 열 수 없어요.',
  launch_failed: '앱을 여는 중 문제가 생겼어요.',
  no_link: '등록된 실행 링크가 없어요. 앱 정보에서 링크를 추가해 주세요.',
  unsupported: '이 환경(웹 미리보기)에서는 다른 앱을 실행할 수 없어요.',
};
