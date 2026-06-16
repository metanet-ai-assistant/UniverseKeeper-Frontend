# UniverseKeeper Frontend

AI 창작 보조 서비스 **UniverseKeeper (UVK)**의 Vue 3 프론트엔드 프로젝트입니다.

현재는 **UI 우선 프로토타이핑 단계**입니다. 백엔드 API, 인증, AI 분석 응답, GraphDB, RAG 명세는 아직 확정되지 않았으므로 Mock 데이터와 교체 가능한 Repository 경계를 사용해 화면 구조를 먼저 구현합니다.

이 프로젝트는 로컬 실행을 기준으로 관리하며, 배포 설정은 포함하지 않습니다.

## 기술 스택

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Vitest
- Playwright
- ESLint / Oxlint
- Prettier

Vue 컴포넌트는 Composition API와 `<script setup lang="ts">` 형식을 사용합니다.

## 시작하기

### 요구 사항

- Node.js `^20.19.0` 또는 `>=22.12.0`
- npm

### 설치

```sh
npm install
```

### 개발 서버 실행

```sh
npm run dev
```

### 프로덕션 빌드

```sh
npm run build
```

### 빌드 결과 미리보기

```sh
npm run preview
```

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버를 실행합니다. |
| `npm run build` | 타입 체크 후 프로덕션 빌드를 생성합니다. |
| `npm run build-only` | Vite 빌드만 실행합니다. |
| `npm run preview` | 빌드 결과를 로컬에서 미리 봅니다. |
| `npm run type-check` | `vue-tsc` 기반 타입 체크를 실행합니다. |
| `npm run lint` | Oxlint와 ESLint를 실행합니다. |
| `npm run format` | `src/`를 Prettier로 정리합니다. |
| `npm run test:unit` | Vitest 단위 테스트를 실행합니다. |
| `npm run test:e2e` | Playwright E2E 테스트를 실행합니다. |

Playwright 브라우저가 설치되어 있지 않다면 최초 1회 실행합니다.

```sh
npx playwright install
```

## 프로젝트 구조

현재 저장소는 Vue 기본 구조를 기반으로 시작하며, 기능이 추가될 때 필요한 폴더만 단계적으로 확장합니다.

```text
project/
├─ e2e/
├─ public/
├─ src/
│  ├─ __tests__/
│  ├─ assets/
│  ├─ router/
│  ├─ stores/
│  ├─ App.vue
│  └─ main.ts
├─ env.d.ts
├─ eslint.config.ts
├─ index.html
├─ package.json
├─ playwright.config.ts
├─ vite.config.ts
└─ vitest.config.ts
```

목표 구조는 기능 단위 확장을 기준으로 합니다.

```text
src/
├─ api/
├─ assets/
├─ components/
│  └─ common/
├─ composables/
├─ features/
│  ├─ auth/
│  ├─ workspace/
│  ├─ settings/
│  ├─ episodes/
│  └─ reports/
├─ layouts/
├─ mocks/
├─ router/
├─ stores/
├─ styles/
├─ types/
├─ utils/
├─ App.vue
└─ main.ts
```

## 디자인 기준

- Figma 파일: `https://www.figma.com/design/9Pf4WHO20J9onkiospS33H/메타넷-파일럿-3차`
- 기준 페이지: `세계관 보안관 MVP`
- 기준 모바일 프레임: `402 × 874`

UI 구현 전에는 대상 화면, Design System 컴포넌트, 색상, 타이포그래피, Foundation 순서로 확인합니다. 360px~430px 모바일 폭에서 깨지지 않는 화면을 우선합니다.

## 에셋 규칙

브랜드 에셋은 아래 경로와 파일명을 유지합니다.

```text
src/assets/images/brand/
├─ Logo1.svg
├─ Logo2.svg
└─ splashImg.png
```

- `Logo1.svg`: 로그인 및 인증 화면 중앙 로고
- `Logo2.svg`: 앱 헤더 상단 로고
- `splashImg.png`: 스플래시 화면 메인 이미지

컴포넌트에서 사용하는 로고와 이미지는 `src/assets`에서 import합니다. `public`에는 import가 필요 없는 정적 파일만 둡니다.

## 라우팅 계획

권장 라우트는 다음과 같습니다.

```text
/splash
/login
/join
/findpw
/workspaces
/workspaces/new
/workspaces/:workspaceId
/workspaces/:workspaceId/settings
/workspaces/:workspaceId/settings/review
/workspaces/:workspaceId/episodes/new
/workspaces/:workspaceId/reports
/workspaces/:workspaceId/reports/:reportId
```

백엔드 인증 명세가 확정되기 전에는 Mock 인증 Guard만 사용하며 Token Refresh를 구현하지 않습니다.

## 구현 원칙

- 도메인 전용 컴포넌트는 해당 `features` 내부에 둡니다.
- 공통 UI만 `components/common`에 둡니다.
- Mock 데이터는 `.vue` 파일에 직접 작성하지 않습니다.
- HTTP 요청 URL은 컴포넌트에 직접 작성하지 않습니다.
- 단일 화면 임시 상태는 Pinia에 넣지 않습니다.
- 외부 데이터는 검증 전 `unknown`으로 다룹니다.
- `any` 사용을 피하고 API 타입과 View Model을 분리합니다.
- 확정되지 않은 백엔드 Endpoint는 추측하지 않습니다.

## 테스트

- Vitest: Store, Utility, Composable 테스트
- Playwright: 로그인, 작품 목록, 작품 상세, 리포트 상세 검토, PR용 스크린샷

Playwright 기준 viewport는 `402 × 874`입니다.

```ts
await page.setViewportSize({ width: 402, height: 874 })
```

## Git 규칙

Conventional Commits를 사용합니다.

```text
docs: initialize project README
chore: remove unused Vue example files
style: add Pretendard global font
feat(auth): implement login UI
feat(workspace): implement workspace list
test(auth): add login e2e test
```

PR은 기능 단위로 생성하고, UI PR에는 `402 × 874` 기준 스크린샷을 포함합니다.
