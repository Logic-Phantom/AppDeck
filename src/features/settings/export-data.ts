import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** 사용자가 직접 실행할 때만 백업 JSON을 만들고 공유 시트를 연다. 서버 전송 없음. */
export async function shareBackup(json: string): Promise<'shared' | 'downloaded' | 'unavailable'> {
  const name = `appdeck-backup-${new Date().toISOString().slice(0, 10)}.json`;
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return 'downloaded';
  }
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: '앱덱 데이터 내보내기' });
  return 'shared';
}
