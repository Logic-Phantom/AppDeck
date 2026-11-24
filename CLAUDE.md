# CLAUDE.md — APPDECK

- 사용자와는 **한국어**로 소통한다. 작업 후 README의 Work Log를 갱신하고 `origin main`에 푸시한다.
- 디자인 기준: `assets/reference/appdeck-design-reference.webp` (레이아웃·스타일을 그대로 따른다).

## 명령
- `npm run web` (웹 미리보기, 가상 데이터) · `npm test` · `npm run typecheck` · `npm run lint` · `npm run doctor`
- Android: `npx expo prebuild --platform android` → `npm run android` / `npm run android:debug`
- 아이콘: `node scripts/extract-reference-icons.mjs`, `npm run assets:build`

## 구조 규칙
- `src/domain`은 순수 함수(React/Expo import 금지) + Jest 테스트 필수.
- UI는 `useAppDeck()`만 사용. PackageManager/SQLite 직접 호출 금지.
- 플랫폼 차이는 `src/platform/ports.ts`의 `PlatformCapabilities`로 분기.
- 마이그레이션은 기존 버전을 수정하지 말고 새 버전 추가.

## 제품/보안 원칙
- 설치되지 않은 앱을 설치된 것처럼 보여 주지 않는다. 사용 기록 없이 "미사용"을 추정하지 않는다.
- 앱 목록·사용 기록을 네트워크로 보내지 않는다. 광고/분석 SDK 추가 금지. 앱 목록을 로그로 출력 금지.
- 다른 앱 자동 삭제·강제 종료 금지. 지원하지 않는 기능은 버튼을 숨기거나 이유를 표시.
- `.env`, keystore, 실제 기기 앱 목록을 커밋하지 않는다.
- 실행하지 않은 테스트·기기 검증을 성공으로 기록하지 않는다 (`docs/TESTING.md`).
