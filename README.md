# Contee Frontend

찬양팀이 콘티, 곡 라이브러리, 송폼, 공유 링크를 함께 관리하는 Contee의 Next.js 프론트엔드입니다.

## Tech Stack

- Next.js 15 / React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Axios

## Getting Started

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Environment Variables

`.env.local`에 필요한 값을 설정합니다.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_DEV_AUTH_BYPASS=false
NEXT_PUBLIC_API_LOG=false
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 API base URL |
| `NEXT_PUBLIC_USE_MOCK` | `true`면 Axios mock adapter 사용 |
| `NEXT_PUBLIC_DEV_AUTH_BYPASS` | mock 개발 환경에서 인증 우회 |
| `NEXT_PUBLIC_API_LOG` | API request/response 로그 출력 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID |


## Analytics

Google Analytics는 production 환경에서 `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있을 때만 로드됩니다.

페이지뷰는 수동 전송하며 동적 route 값은 마스킹합니다.

- `/dashboard/contis/123?mode=edit` -> `/dashboard/contis/[id]`
- `/share/contis/secret-token` -> `/share/contis/[token]`

관련 코드는 `src/components/analytics`와 `src/lib/analytics.js`에 있습니다.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
npm test         # node:test suites
```

TypeScript 타입 검사는 다음 명령으로 실행합니다.

```bash
npx tsc --noEmit
```

## Project Notes

- 인증 상태는 `src/stores/auth-store.ts`에서 관리합니다.
- 보호 라우트는 `RequireAuth`가 담당합니다.
- dashboard의 팀 데이터는 인증 완료 후에만 요청합니다.
- 개발 중 API 호출 흐름 확인이 필요하면 `NEXT_PUBLIC_API_LOG=true`를 사용합니다.
