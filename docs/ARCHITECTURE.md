# 아키텍처

APPDECK은 기존 프로젝트(구도픽·MoodMix·CutPick)의 **Expo SDK 58 + Expo Router(`src/app`) + 계층 분리** 패턴을 이어받고,
점심합의·AutoMate Desk의 **포트/어댑터(platform)·순수 도메인** 경계를 더해 구성했다.

```text
src/
├─ app/                 Expo Router 화면 (UI만, 비즈니스 로직 없음)
│  ├─ (tabs)/           홈 · 검색(앱 보관함) · 즐겨찾기 · 설정  ← 레퍼런스 하단 4탭
│  ├─ results.tsx       목적/카테고리 검색 결과 (전체 / 배달앱 / 음식점 탭)
│  ├─ cleanup.tsx       앱 정리 (링 차트 + 정리 후보)
│  ├─ cleanup-done.tsx  정리 완료
│  ├─ parking*.tsx      주차 위치 메모
│  ├─ app/[id].tsx      앱 상세 (분류·별칭·즐겨찾기·숨김·정리 후보)
│  ├─ add-app.tsx       수동 등록 (iOS 기본 경로)
│  └─ onboarding / privacy / settings-apps / usage-access
├─ components/          화면 공통 UI (Screen, BottomTabBar, AppIcon, AppListRow …)
├─ design-system/       토큰(라이트/다크), SVG 아이콘, 브랜드 마크, 추출 아이콘
├─ domain/              순수 함수 — React/Expo 의존 없음, Jest로 검증
│  ├─ apps/             AppEntry 모델, 스캔 병합(mergeScan)
│  ├─ categories/       카탈로그, 로컬 분류 규칙, 분류기
│  ├─ search/           정규화(초성), 목적 매처, 검색 엔진
│  ├─ cleanup/          정리 비율, 사용 기록 기반 미사용(정보 없음 분리)
│  └─ parking/          경과 시간·일시정지·요금 계산
├─ features/            상태 조립 (AppDeckProvider), 온보딩, 내보내기
├─ infrastructure/      저장소 — 네이티브: expo-sqlite / 웹: localStorage
├─ platform/            포트(ports.ts) + 어댑터 android / ios / web
└─ shared/              id 등 유틸
modules/appdeck-device-apps/   Kotlin Expo Module (PackageManager, UsageStats)
```

## 데이터 흐름

```text
사용자 동의/새로고침 → AppDeckProvider.refreshInventory (중복 스캔 방지)
  → PlatformServices.catalog.scan()            (Android: Kotlin 모듈 / Web: 데모 / iOS: 빈 목록)
  → mergeScan(existing, records)               (순수 함수: 사용자 데이터 보존, 사라진 앱 removed)
  → AppDeckRepository.saveApps()               (SQLite 트랜잭션)
  → 화면 갱신
```

## 경계 규칙

- UI는 `useAppDeck()`만 사용한다. PackageManager·SQLite를 직접 호출하지 않는다.
- `domain/`은 React·Expo를 import하지 않는다.
- 플랫폼 차이는 `PlatformCapabilities`로만 분기한다. 지원하지 않는 기능은 버튼을 숨기거나 이유를 표시한다.
- 저장소 진입점은 `index.ts`(네이티브) / `index.web.ts`(웹)로 분리해 웹 번들에 SQLite(wasm)를 넣지 않는다.

## 기존 프로젝트 대비 변경/개선점

| 항목 | 기존 | APPDECK |
|---|---|---|
| 네이티브 모듈 | 구도픽: Nitro Modules(C++ 브리지) | 앱 목록 조회는 동기 고성능이 필요 없으므로 **Expo Modules API(Kotlin만)** 로 단순화 |
| 플랫폼 분기 | 화면 내 `Platform.OS` 분기 | `platform/ports.ts` + 어댑터, capability 객체로 통일 |
| 웹 프리뷰 | 일부 프로젝트는 미지원 | 데모 어댑터 + localStorage 저장소, 화면에 "가상 데이터" 배지 상시 표시 |
| 스캔 동기화 | — | `mergeScan` 순수 함수로 분리해 사용자 데이터 보존을 테스트로 보장 |
