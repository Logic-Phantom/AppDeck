import * as Linking from 'expo-linking';

import type { AppEntry } from '@/domain/apps/app.types';

import type { LaunchResult } from './ports';

/** iOS/웹: 사용자가 등록한 Universal Link 또는 URL을 연다. scheme을 무작위로 탐색하지 않는다. */
export async function openRegisteredLink(app: AppEntry): Promise<LaunchResult> {
  if (!app.launchUrl) return { opened: false, reason: 'no_link' };
  try {
    await Linking.openURL(app.launchUrl);
    return { opened: true };
  } catch {
    return { opened: false, reason: 'launch_failed' };
  }
}
