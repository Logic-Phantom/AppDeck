# 테스트 기록

## 2026-11-24 — Windows 11, Node 26.13.1, Expo SDK 58.0.26

| 항목 | 명령 | 결과 |
|---|---|---|
| 타입 검사 | `npx tsc --noEmit` | ✅ 오류 0 |
| 린트 | `npx expo lint` | ✅ 오류 0 |
| Expo 진단 | `npx expo-doctor` | ✅ 20/20 |
| 단위/통합 테스트 | `npx jest` | ✅ 6개 스위트, 45개 테스트 통과 |
| 웹 미리보기 | `npx expo start --web` + 내장 브라우저(390×780) | ✅ 인트로·온보딩·홈·목적 검색·검색 탭·즐겨찾기·앱 정리·정리 완료·주차 위치(입력→표시)·설정 화면 렌더링 확인 |

### 테스트 범위
- 분류기: 사용자 분류 우선, 패키지 규칙 최장 일치(쿠팡/쿠팡이츠/쿠팡플레이), 이름 키워드, 플랫폼 힌트, fallback
- 검색: 목적 매칭 10종, 설치 앱만 반환, 정확 이름 우선, 초성, 별칭, 패키지명 옵션, 결정성
- 스캔 병합: 사용자 데이터 보존, 중복 방지, 제거 앱 removed 처리, 재설치 복구, 수동 앱 보존
- 정리: 비율 계산, 사용 기록 0/없음을 미사용으로 보지 않음
- 주차: 경과 시간 포맷, 일시정지 제외, 요금 올림 계산
- SQLite 매핑: 왕복 보존, 잘못된 값 방어, 마이그레이션 컬럼

## 2026-11-24 — Android 빌드

| 항목 | 결과 |
|---|---|
| EAS Build `preview` (Android APK) | ✅ 성공 — 빌드 ID `62bf7b2f-950f-4e2f-a456-b012529c979c`, Kotlin 모듈 포함 컴파일 통과 |
| APK 매니페스트 확인 (`aapt2 dump badging`) | ✅ `app.appdeck.mobile` v0.1.0(1), 라벨 "앱덱", compileSdk 37, 권한 `QUERY_ALL_PACKAGES`·`PACKAGE_USAGE_STATS`·`INTERNET`·`VIBRATE`·`ACCESS_NETWORK_STATE` |
| 로컬 Windows Gradle 빌드 | ❌ 실패 — ① 한글 경로("바탕 화면")를 Gradle이 깨뜨림 → ASCII 경로 복제로 우회, ② CMake/Ninja 객체 경로가 260자 제한 초과(`react-native-safe-area-context` codegen, 269자). Windows `LongPathsEnabled=0` 환경에서는 해결 불가 → EAS 클라우드 빌드 사용 |

> `INTERNET`·`ACCESS_NETWORK_STATE`는 Expo/React Native 기본 의존성이 추가한다. 앱 코드는 네트워크 요청을 하지 않는다(릴리스에서 제거 여부는 후속 검토).

## 미검증 (실행하지 않음)
- ❌ **Android 실기기 동작**: APK는 만들었지만 기기 설치·실행 검증은 사용자가 따로 진행한다. 설치 앱 조회·아이콘 캐시·앱 실행·UsageStats는 **미검증**.
- ❌ iOS 시뮬레이터/실기기
- ❌ 다크 모드 실기기 확인, TalkBack/VoiceOver
- ❌ 수백 개 앱 성능 측정

## Android 검증 절차 (다음 단계)
1. JDK 17, Android SDK(API 36) 설치
2. `npx expo prebuild --platform android`
3. `npm run android:debug` 또는 `npx expo run:android`
4. 확인 항목: 온보딩 동의 전 스캔 없음 → 동의 후 목록 일치 → 아이콘 표시 → "열기"로 실행 → 앱 삭제 후 새로고침 시 숨김 → 시스템 앱 토글 → 사용 기록 ON/권한 허용/거부
