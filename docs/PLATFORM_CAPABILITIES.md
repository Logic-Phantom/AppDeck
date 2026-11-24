# 플랫폼별 지원 범위

> 작성일 2026-11-24. 아래 정책·API 내용은 슈퍼프롬프트에 정리된 조사 내용을 기준으로 했으며,
> **이번 작업에서 공식 문서를 다시 열어 확인하지는 않았다.** 출시 전 아래 링크의 최신 내용을 재확인해야 한다.

| 기능 | Android (Development Build) | Android (Expo Go) | iOS | Web 미리보기 |
|---|---|---|---|---|
| 설치 앱 목록 자동 조회 | ✅ PackageManager (런처 앱) | ❌ 네이티브 모듈 없음 | ❌ 공개 API 없음 | 가상 데이터 |
| 앱 아이콘 | OS 원본(캐시 PNG) | — | 모노그램 | 모노그램 |
| 앱 실행 | ✅ `getLaunchIntentForPackage` | ❌ | 등록한 URL/Universal Link | ❌ (안내 표시) |
| 시스템 앱 정보 열기 | ✅ `ACTION_APPLICATION_DETAILS_SETTINGS` | ❌ | ❌ | ❌ |
| 사용 기록(선택) | ✅ `UsageStatsManager` (기본 OFF) | ❌ | ❌ (Family Controls 미사용) | ❌ |
| 수동 등록 | ✅ | ✅ | ✅ (기본 경로) | ✅ |
| 로컬 저장 | SQLite | SQLite | SQLite | localStorage |

## 참고 문서 (재확인 필요)
- https://developer.android.com/training/package-visibility
- https://support.google.com/googleplay/android-developer/answer/10158779
- https://developer.android.com/reference/android/app/usage/UsageStatsManager
- https://developer.apple.com/documentation/uikit/uiapplication/canopenurl(_:)
- https://docs.expo.dev/modules/overview/
