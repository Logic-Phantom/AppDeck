/**
 * 테스트 전용 가상 데이터. 실제 기기에서 수집한 앱 목록이 아니다.
 */
import type { AppEntry, DeviceAppRecord } from '@/domain/apps/app.types';
import { mergeScan } from '@/domain/apps/inventory-merge';

export function rec(packageName: string, displayName: string, extra: Partial<DeviceAppRecord> = {}): DeviceAppRecord {
  return { packageName, displayName, isSystemApp: false, hasLaunchIntent: true, versionCode: '1', ...extra };
}

export const SYNTHETIC_RECORDS: DeviceAppRecord[] = [
  rec('com.sampleapp', '배달의민족'),
  rec('com.coupang.mobile.eats', '쿠팡이츠'),
  rec('com.coupang.mobile', '쿠팡'),
  rec('com.nhn.android.nmap', '네이버 지도'),
  rec('com.netflix.mediaclient', '넷플릭스'),
  rec('com.google.android.youtube', 'YouTube'),
  rec('com.iloen.melon', '멜론'),
  rec('com.cgv.android.movieapp', 'CGV'),
  rec('com.example.unknownthing', '알수없는앱'),
];

export function syntheticApps(): AppEntry[] {
  return mergeScan([], SYNTHETIC_RECORDS, 'android', '2026-11-24T00:00:00.000Z').apps;
}
