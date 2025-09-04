## Contee 프론트엔드 프로젝트 킥오프 플랜

목표: Next.js 14 + React 18 기반 PWA로 Contee 프론트엔드를 신속·견고하게 시작하고, MVP 핵심 플로우(콘티 생성/편집/히스토리)를 1주 내 가동한다.

---

### 0) 빠른 시작(Quickstart)

```bash
# Node 20+ 권장
nvm use 20 || nvm install 20

# 새 프로젝트 생성 (이미 프로젝트가 있다면 이 섹션은 건너뛰기)
npx create-next-app@latest frontend --ts --eslint --tailwind --app --src-dir --import-alias '@/*'

cd frontend

# 필수 라이브러리 설치
npm i zustand axios zod react-hook-form @hookform/resolvers lucide-react clsx tailwind-merge

# shadcn/ui 초기화 및 기본 컴포넌트 추가
npx shadcn@latest init -y
npx shadcn@latest add button input label textarea form dialog dropdown-menu select sheet tooltip

# 개발 서버 실행
npm run dev
```

---

### 1) 작업 우선순위(High-level)

- [x] 프로젝트 베이스 세팅(코어 의존성, TS/ESLint, Tailwind, shadcn/ui)
- [x] PWA 기반(Manifest, Service Worker, 아이콘) 구성
- [x] 폴더 구조 및 라우팅 스켈레톤(App Router) 정리
- [x] 공통 라이브러리(`apiClient`, 에러 처리, 유틸) 구축
- [x] 기본 레이아웃/내비게이션/글로벌 스타일 구축
- [ ] 인증 스캐폴드(로그인/회원가입 화면, 상태 관리)
- [ ] 도메인: 콘티/곡 타입·스토어·훅·페이지 뼈대
- [ ] 폼과 검증(React Hook Form + Zod) 통합
- [ ] 에러 바운더리/로딩 상태/a11y 기본 규칙 적용
- [ ] 테스트(단위/컴포넌트) 및 품질 도구(Husky, lint-staged)
- [ ] 성능/번들 최적화 설정(동적 임포트, 분석기)

---

### 2) Day 0 — 리포/도구 체인 준비

- [x] Node 20+, pnpm 또는 npm 결정(본 문서는 npm 기준)
- [x] `.nvmrc` 작성: `20`
- [x] Next.js 14+ TypeScript 프로젝트 생성 또는 기존 프로젝트 점검
- [x] `@/*` 절대 경로 설정 확인(`tsconfig.json` `paths`)
- [x] ESLint/Prettier 규칙 검토, `strict: true` 유지
- [x] Husky + lint-staged 구성(커밋 전 린트/포맷 자동화)

참고 명령:

```bash
npm i -D husky lint-staged prettier
npx husky init
echo '"*.{ts,tsx,js,css,md}": "eslint --fix --max-warnings=0 && prettier --write"' > lint-staged.config.json
```

---

### 3) Day 1 — UI 베이스 + 레이아웃 + Tailwind/shadcn

- [x] Tailwind content 경로에 `src/**`, `app/**`, `components/**` 포함
- [x] `globals.css`에 shadcn CSS 변수와 다크 테마 루트 변수 선언
- [x] `components.json`(shadcn registry) 커밋 소스 유지
- [x] 기본 레이아웃(`layout.tsx`)과 헤더/사이드바/푸터 뼈대 구성
- [x] `@/components/ui/*` 래핑 컴포넌트 사용 원칙 적용

체크:

- [x] 모바일/태블릿/데스크톱 반응형 그리드/내비
- [x] `lucide-react` 아이콘 개별 임포트

---

### 4) Day 2 — PWA 구성

- [x] `public/manifest.json` 작성(이름/아이콘/테마 컬러)
- [x] `public/sw.js` 작성 및 등록(기본 캐싱 전략)
- [ ] `public/icons/*` 아이콘 준비(192, 512 등)
- [x] Next.js에서 서비스워커 등록 로직 추가(클라이언트 측)
- [ ] 오프라인 동작 스모크 테스트

예시 파일(간단 캐싱): `public/sw.js`

```js
const CACHE_NAME = 'contee-v1'
const urlsToCache = ['/', '/manifest.json']
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})
```

---

### 5) Day 3 — 공통 라이브러리/유틸

- [x] `@/lib/api.ts`: Axios 인스턴스, 인터셉터(401/5xx 처리), 타임아웃
- [x] `@/lib/auth.ts`: 토큰 보관/조회/삭제 유틸
- [x] `@/lib/utils.ts`: 공통 유틸, 클래스 머지 등
- [x] `@/constants/*`: 라우트/엔드포인트/UI 상수

가이드:

- 401 → 로그아웃 및 `/login` 리다이렉션
- 500+ → 토스트 에러 알림

---

### 6) Day 4 — 인증 스캐폴드

- [ ] 라우팅 그룹 `app/(auth)/login`, `app/(auth)/register`
- [ ] `@/stores/auth-store.ts`(Zustand)와 `@/hooks/use-auth.ts`
- [ ] 로그인 폼(React Hook Form + Zod), 제출 시 토큰 저장
- [ ] 보호 라우트 가드(서버/클라이언트 조합) 설계

폼 구성 체크:

- [ ] 로딩/디세이블 상태
- [ ] 접근성(라벨, aria-\*)
- [ ] 에러 메시지

---

### 7) Day 5 — 도메인(콘티/곡) 뼈대

- [ ] 타입: `@/types/{conti.ts,song.ts,api.ts}`
- [ ] 스토어: `@/stores/{conti-store.ts,ui-store.ts}`
- [ ] 훅: `@/hooks/{use-conti.ts,use-songs.ts}`
- [ ] 페이지: `app/(dashboard)/contis/page.tsx`, `[id]/page.tsx`, `create/page.tsx`
- [ ] 기능 컴포넌트: `@/components/features/{conti,song}/*`

기능 목표:

- [ ] 콘티 목록/상세/생성 플로우가 UI 상 동작
- [ ] 드래그&드롭(순서 변경) 후 저장(2차 스프린트에 실제 연동)

---

### 8) Day 6 — 폼·검증 통합

- [ ] Zod 스키마(`@/lib/validations.ts`) 정의: `createContiSchema`
- [ ] React Hook Form + zodResolver 적용
- [ ] 낙관적 업데이트/토스트 알림 기본 적용

---

### 9) Day 7 — 안정화: 에러/로딩/a11y/테스트

- [ ] ErrorBoundary 컴포넌트 적용(페이지 래핑)
- [ ] 로딩 스피너/스켈레톤 컴포넌트
- [ ] WCAG 2.1 AA 체크(포커스, 대비, 키보드 네비)
- [ ] 테스트 베이스: Jest + RTL, 간단 컴포넌트/훅 테스트

설치 예:

```bash
npm i -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest jest-environment-jsdom
```

---

### 10) 성능/번들 최적화

- [ ] 큰 컴포넌트 `dynamic()` 분리, `React.memo`, `useMemo`, `useCallback`
- [ ] 이미지 `next/image` 적용
- [ ] 번들 분석기 도입(옵션)

---

### 11) CI/CD(옵션)

- [ ] GitHub Actions로 린트/빌드/테스트 파이프라인
- [ ] 프리뷰 배포(Vercel 등)

---

### 완료 기준(Definition of Done)

- [ ] `npm run dev`로 대시보드 스켈레톤과 로그인 화면 접근 가능
- [ ] 기본 PWA(매니페스트/서비스워커) 등록 및 설치 가능
- [ ] 콘티 생성 폼이 제출·검증·알림까지 동작(목업 API 또는 실제 API)
- [ ] 에러 바운더리/로딩 상태/a11y 준수
- [ ] 최소 3개 테스트(컴포넌트 2, 훅 1) 통과

---

### 커맨드 치트시트

```bash
# 개발
npm run dev

# 빌드/스타트
npm run build && npm start

# 린트/포맷
npm run lint
npx prettier --write .

# 테스트 (설정 후)
npm test
```

---

### 리스크 & 메모

- [ ] 태블릿/모바일 반응형 우선 검증
- [ ] API 미확정 시 목업/페이크 서비스로 먼저 UI 진행
- [ ] 서비스워커 캐시 무효화 정책 점검(버전 태그)

---

### 참고: 권장 디렉터리 스켈레톤

```
src/
  app/
    (auth)/{login,register}/page.tsx
    (dashboard)/{contis,songs,settings}/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/*
    features/{auth,conti,song,user}/*
    layout/{header.tsx,sidebar.tsx,footer.tsx}
  lib/{api.ts,auth.ts,utils.ts,validations.ts}
  hooks/{use-auth.ts,use-conti.ts,use-songs.ts}
  stores/{auth-store.ts,conti-store.ts,ui-store.ts}
  types/{auth.ts,conti.ts,song.ts,api.ts}
  constants/{routes.ts,api-endpoints.ts,ui-constants.ts}
public/
  icons/*
  manifest.json
  sw.js
```
