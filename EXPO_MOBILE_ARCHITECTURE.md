# Contee Expo Mobile Architecture

> Status: implementation design
> Last updated: 2026-07-16
> Target: iOS and Android application built with Expo and React Native
> Web application: keep the existing Next.js application operational throughout the migration

## 0. Instructions for the implementing agent

This document is the source of truth for the first Expo implementation. Follow these rules unless a newer product or backend decision explicitly overrides them.

1. Do not wrap the Next.js application in a WebView. Build native React Native screens.
2. Do not move the existing Next.js application into `apps/web` during the first implementation. Keep it at the repository root to minimize unrelated churn.
3. Add `apps/mobile` and `packages/*` incrementally using npm workspaces.
4. Share pure TypeScript domain code and API contracts. Do not attempt to share Radix UI, Tailwind components, Next.js routing, DOM code, or browser file APIs.
5. Do not change existing web behavior while extracting shared code. Every extraction must preserve the current web tests, lint, typecheck, and build.
6. Never store refresh tokens in AsyncStorage, Zustand persistence, React Query persistence, logs, URLs, or analytics. Native credentials belong in `expo-secure-store`.
7. Mobile OAuth requires the backend contract in section 8. Do not emulate production authentication with cookie scraping or an embedded Google login WebView.
8. Work one phase at a time. Finish the phase's checks before starting the next one.
9. When a backend dependency is unavailable, implement the typed interface and a development-only mock behind `EXPO_PUBLIC_DEV_AUTH_BYPASS=true`. Production builds must reject that flag.
10. Keep edits scoped. Do not refactor unrelated web components while creating the mobile app.

## 1. Executive decision

Build a separate Expo application in the same repository and share platform-neutral packages with the current Next.js application.

The desired repository shape is:

```text
Contee-frontend/
├── src/                         # Existing Next.js application; remains in place
├── public/
├── apps/
│   └── mobile/                  # Expo + React Native + Expo Router
├── packages/
│   ├── domain/                  # Models, DTOs, mappers, validation, pure utilities
│   ├── api-client/              # Transport factory and endpoint repositories
│   └── query/                   # Query keys/options without platform UI side effects
├── package.json                 # Existing web package + workspace root
└── EXPO_MOBILE_ARCHITECTURE.md
```

The web and native apps share data contracts and behavior, not presentation components.

### Why this decision fits the current code

- The project already uses React, TypeScript, Axios, TanStack Query, Zustand, React Hook Form, and Zod.
- `src/domains/*/models`, DTOs, and mappers are mostly suitable for platform-neutral packages.
- Web UI is coupled to Radix UI, Tailwind, `next/link`, `next/navigation`, `window`, `document`, `File`, Blob URLs, and `@dnd-kit`.
- Authentication currently depends on an HttpOnly refresh cookie and browser redirects, which cannot be treated as the native session design.
- PDF generation and download currently depend on Canvas and DOM APIs.

## 2. Goals and non-goals

### Goals

- Ship a high-quality iOS and Android application using Expo managed workflow and EAS Build.
- Preserve the current Next.js application and PWA.
- Use the same backend API and canonical domain models across platforms.
- Support Google login, team selection, conti browsing, song browsing, and mobile-first conti management.
- Establish safe token rotation, deep links, file handling, sharing, and offline-aware data fetching.
- Make future web/mobile contract changes happen in shared packages once.

### Non-goals for the first mobile release

- Pixel-identical web and native UI.
- Rendering existing Radix components in React Native.
- Running Next.js inside Expo or a WebView.
- Full offline mutation synchronization.
- Reusing browser PDF generation on native.
- Moving the entire web app under `apps/web`.
- Adding tablet-specific split panes before the phone workflows are complete.

## 3. Architecture decisions

### ADR-001: Separate platform UI

Web components remain under `src`. Native components live under `apps/mobile/src`. Shared packages must not import React DOM, React Native, Next.js, Expo, browser globals, or UI libraries.

### ADR-002: Incremental monorepo

The repository root remains the web application and becomes the npm workspace root:

```json
{
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

Workspace packages use names such as `@contee/domain`, `@contee/api-client`, and `@contee/query`. For npm compatibility, consumers reference local workspaces using `"*"`; do not assume the `workspace:*` protocol is available.

Do not force web and Expo to use the same React patch version. Generate the Expo app with the latest supported Expo template, keep its generated React/React Native versions, and let npm install compatible copies where required. Never manually upgrade React Native independently of the Expo SDK.

### ADR-003: Dependency-injected API client

The current `src/lib/api.ts` is web-specific because it imports the web Zustand store, reads `NEXT_PUBLIC_*`, and refreshes through cookies. Shared endpoint code must instead receive a configured transport.

Target interface:

```ts
export interface SessionTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthSessionAdapter {
  getAccessToken(): string | null | Promise<string | null>
  refresh(): Promise<SessionTokens | null>
  clear(): void | Promise<void>
}

export interface ApiClientOptions {
  baseUrl: string
  session: AuthSessionAdapter
  onUnavailable?: (error: unknown) => void
  log?: boolean
}

export function createApiClient(options: ApiClientOptions): AxiosInstance
```

The factory must preserve these existing behaviors:

- Add the Bearer access token only for requests under the configured API origin and `/api/` path.
- Redact authentication, cookie, password, email, and profile data from optional logs.
- Use a single in-flight refresh promise when concurrent requests return 401.
- Retry an original request at most once.
- Clear the session after a terminal refresh failure.
- Never forward credentials or authorization headers to an untrusted absolute URL.

Platform adapters:

- Web: in-memory access token plus the existing HttpOnly cookie refresh flow.
- Native: in-memory access token plus refresh token stored in SecureStore.

### ADR-004: Native authentication, not cookie emulation

Use system-browser Google OAuth with Authorization Code + PKCE. Open the authorization flow with Expo AuthSession/WebBrowser and return through an application link. Exchange the one-time code for tokens over HTTPS. See section 8.

### ADR-005: Server state and client state stay separate

- TanStack Query owns server state.
- Zustand owns the in-memory auth lifecycle and selected team ID.
- SecureStore owns native refresh credentials.
- AsyncStorage may persist non-sensitive preferences such as selected team ID.
- React Hook Form plus Zod owns form input and validation.
- Do not duplicate API entities into Zustand.

### ADR-006: PDF generation moves to the backend

The current browser implementation uses Canvas, Blob URLs, anchors, and `pdf-lib`. Native should not duplicate this rendering pipeline. Add a backend export endpoint that returns a generated PDF or a short-lived authenticated download URL. The native app saves it with Expo FileSystem and opens the system share sheet.

Until that endpoint exists, PDF export is excluded from the mobile MVP. Do not silently fall back to opening the web app.

## 4. Target package boundaries

### `@contee/domain`

Allowed dependencies: TypeScript-only libraries, Zod, and platform-neutral date utilities.

Target structure:

```text
packages/domain/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── api.ts
│   ├── auth/
│   │   ├── dto.ts
│   │   ├── mapper.ts
│   │   └── model.ts
│   ├── team/
│   ├── song/
│   ├── conti/
│   ├── dashboard/
│   └── utils/
└── tests/
```

Initial extraction candidates:

| Current source | Target | Notes |
| --- | --- | --- |
| `src/types/api.ts` | `src/api.ts` | `ApiResponse`, `PageDto` |
| `src/domains/*/models/*.ts` | matching `model.ts` | Canonical models |
| `src/domains/*/api/*.dto.ts` | matching `dto.ts` | Request/response contracts |
| `src/domains/*/api/*.mapper.ts` | matching `mapper.ts` | Remove `@/` imports |
| `src/domains/conti/utils/worship-time-core.js` | `conti/worship-time.ts` | Convert to strict TypeScript |
| pure parts of `conti-editor.js` | `conti/editor.ts` | No React, DOM, or router code |
| `src/domains/team/utils/team-permissions.js` | `team/permissions.ts` | Convert to strict TypeScript |
| `src/domains/team/utils/team-member-filters.ts` | `team/member-filters.ts` | Pure filtering |
| `src/domains/song/utils/song-form.ts` | `song/song-form.ts` | Verify platform neutrality |

`src/types/*.ts` currently re-export canonical domain files. During migration, change those re-exports to `@contee/domain` so existing web imports continue to work. Do not create a second set of models.

Package constraints:

- No `@/` aliases inside packages.
- No environment variable reads.
- No Axios instance imports.
- No React hooks.
- No `window`, `document`, `navigator`, `File`, Blob URL, Canvas, or local storage access.
- Export public APIs only from `src/index.ts`; avoid deep imports from apps.

### `@contee/api-client`

Target structure:

```text
packages/api-client/src/
├── index.ts
├── client.ts
├── errors.ts
├── safe-url.ts
├── auth.repository.ts
├── team.repository.ts
├── song.repository.ts
├── conti.repository.ts
└── dashboard.repository.ts
```

Repositories are factory-created and close over the injected Axios instance:

```ts
export function createContiRepository(client: AxiosInstance) {
  return {
    list: async (teamId: string, params: ContiSearchParams = {}) => { /* ... */ },
    get: async (contiId: string) => { /* ... */ },
    create: async (request: CreateContiRequest) => { /* ... */ },
    update: async (contiId: string, request: UpdateContiRequest) => { /* ... */ },
    publish: async (contiId: string) => { /* ... */ },
    remove: async (contiId: string) => { /* ... */ },
  }
}
```

Do not make the Axios instance a process-wide singleton inside this package. Each app creates one instance and provides its own session adapter.

File upload/download methods require a platform adapter instead of a DOM `File` type:

```ts
export interface UploadAsset {
  uri: string
  name: string
  mimeType: string
}

export interface FileTransferAdapter {
  append(form: FormData, field: string, asset: UploadAsset): void
  saveDownload(input: { bytes: ArrayBuffer; fileName: string; mimeType: string }): Promise<string>
}
```

The web adapter may convert a browser `File` into this contract. The native adapter appends React Native's `{ uri, name, type }` multipart shape internally. Keep any unavoidable platform cast inside the adapter.

### `@contee/query`

This package contains query key factories and optional query/mutation option builders. It may depend on `@tanstack/react-query` and the repository interfaces, but it must not contain:

- navigation calls;
- toasts;
- browser network checks;
- direct Zustand imports;
- confirmation dialogs;
- component-local state.

Example:

```ts
export const contiKeys = {
  all: ['contis'] as const,
  lists: () => [...contiKeys.all, 'list'] as const,
  list: (teamId: string, filters: ContiFilters) =>
    [...contiKeys.lists(), teamId, filters] as const,
  detail: (contiId: string) => [...contiKeys.all, 'detail', contiId] as const,
}
```

Apps own mutation side effects such as toast messages, route changes, and native alerts.

## 5. Mobile application structure

Create the app with the latest default Expo Router TypeScript template. Preserve the template's SDK-compatible dependency versions.

```text
apps/mobile/
├── app.config.ts
├── eas.json
├── package.json
├── tsconfig.json
├── assets/
└── src/
    ├── app/
    │   ├── _layout.tsx
    │   ├── +not-found.tsx
    │   ├── auth/
    │   │   ├── login.tsx
    │   │   └── callback.tsx
    │   └── (app)/
    │       ├── _layout.tsx
    │       ├── (tabs)/
    │       │   ├── _layout.tsx
    │       │   ├── contis/
    │       │   │   └── index.tsx
    │       │   ├── songs/
    │       │   │   └── index.tsx
    │       │   ├── team/
    │       │   │   └── index.tsx
    │       │   └── settings/
    │       │       └── index.tsx
    │       ├── contis/
    │       │   ├── [id].tsx
    │       │   ├── new.tsx
    │       │   └── [id]/edit.tsx
    │       ├── songs/
    │       │   ├── [id].tsx
    │       │   ├── new.tsx
    │       │   └── [id]/edit.tsx
    │       ├── team/
    │       │   ├── select.tsx
    │       │   ├── create.tsx
    │       │   ├── join.tsx
    │       │   └── members.tsx
    │       └── share/
    │           └── contis/[token].tsx
    ├── components/
    │   ├── ui/
    │   ├── conti/
    │   ├── song/
    │   └── team/
    ├── features/
    │   ├── auth/
    │   ├── conti/
    │   ├── song/
    │   └── team/
    ├── lib/
    │   ├── api.ts
    │   ├── query-client.ts
    │   ├── secure-session.ts
    │   ├── file-transfer.ts
    │   └── linking.ts
    ├── stores/
    │   ├── auth-store.ts
    │   └── preferences-store.ts
    └── theme/
        ├── colors.ts
        ├── spacing.ts
        ├── typography.ts
        └── index.ts
```

If the generated Expo template uses an `app/` folder at the application root, either retain that layout or configure `src/app` consistently. Do not maintain both.

## 6. Mobile UI and navigation specification

### Primary navigation

Use four bottom tabs:

1. `콘티`: default tab; conti list and filters.
2. `곡`: team song library.
3. `팀`: selected team summary and member management.
4. `설정`: account, profile, legal pages, logout, delete account.

Use Lucide React Native icons. Tab labels remain visible. Respect safe areas and dynamic type.

### Team selection

- Show the selected team in the top app bar on `콘티`, `곡`, and `팀`.
- Tapping it opens the team selection screen or bottom sheet.
- Persist only `selectedTeamId` in AsyncStorage.
- After fetching teams, use the persisted ID if it still exists; otherwise select the first team.
- If the user has no team, route to an unframed empty state with `팀 만들기` and `초대 코드로 참여` actions.
- Clear the selected ID if access to that team is revoked.

### Screen behavior

- Lists use pull-to-refresh, stable item dimensions where practical, explicit loading skeletons, empty states, and retry actions.
- Destructive actions use native confirmation dialogs.
- Long forms use keyboard-aware scrolling and keep the primary save action reachable.
- Editing screens warn before discarding unsaved changes using React Navigation/Expo Router navigation guards, not browser history interception.
- Reordering songs uses React Native Gesture Handler and Reanimated. Do not port `@dnd-kit`.
- External URLs open through the system browser after the existing safe-URL checks.
- Share actions use the native share sheet; clipboard is a secondary action.
- Errors shown to users must be actionable Korean messages. Raw backend or Axios errors are never rendered directly.

### Visual implementation

- Start with React Native `StyleSheet` and shared theme tokens. Do not add a large cross-platform UI framework in phase 1.
- Use `lucide-react-native` for familiar icons.
- Use 8px or smaller card radii and avoid nested cards.
- Use actual platform controls for switches, date/time picking, file selection, and menus.
- Minimum interactive target is 44x44 points.
- All controls require accessibility roles/labels where the visible label is insufficient.
- Verify Korean text at larger accessibility font sizes on both platforms.

## 7. State, networking, and offline behavior

### Query client defaults

Use the existing intent as the baseline:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: shouldRetry,
      refetchOnReconnect: true,
    },
  },
})
```

Native-specific behavior:

- Bridge AppState to TanStack Query's focus manager.
- Bridge the native network API to the online manager.
- Never retry 401, 403, validation failures, or non-idempotent mutations automatically.
- A terminal 401 clears the secure session and returns to login.
- Network/server outages keep the session state distinct from `unauthenticated`.

### Offline scope

MVP:

- Show cached list/detail data already held in memory.
- Show an offline banner and disable operations that require the network.
- Preserve an in-progress form draft locally only when the product flow explicitly supports recovery.

Later phase:

- Persist selected safe query caches using AsyncStorage.
- Exclude auth queries, private download URLs, file bytes, and sensitive profile data from persistence.
- Do not queue publish, delete, role changes, account deletion, or external-share toggles offline.
- Offline conti editing requires a server version/ETag and an explicit conflict UX before it can be enabled.

## 8. Required backend authentication contract

This is a blocker for production mobile login. The current web contract uses an HttpOnly refresh cookie and is retained for web. Native requires a separate token exchange while reusing the same user/session domain.

### Recommended flow

1. Mobile creates `state`, PKCE `code_verifier`, and `code_challenge`.
2. Mobile opens the backend authorization URL in the system browser.
3. Backend performs Google OAuth and binds the request to the state and PKCE challenge.
4. Backend redirects to an allowed app/universal link containing only a short-lived, one-time authorization code and state.
5. Mobile validates state and POSTs the code plus verifier to the exchange endpoint.
6. Backend returns access token, rotating refresh token, and expiry metadata.
7. Mobile stores only the refresh token in SecureStore and keeps the access token in memory.

Proposed contract, subject to backend naming conventions:

```http
GET /oauth2/authorization/google/mobile
  ?redirect_uri=https%3A%2F%2Fapp.contee.example%2Fauth%2Fcallback
  &code_challenge=...
  &code_challenge_method=S256
  &state=...
```

```http
POST /api/v1/auth/mobile/exchange
Content-Type: application/json

{
  "code": "single-use-code",
  "codeVerifier": "pkce-verifier",
  "redirectUri": "https://app.contee.example/auth/callback"
}
```

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "accessTokenExpiresIn": 900,
    "refreshTokenExpiresAt": "2026-08-15T12:00:00Z",
    "user": {}
  }
}
```

```http
POST /api/v1/auth/mobile/refresh
Content-Type: application/json

{ "refreshToken": "..." }
```

Refresh returns a new access token and a rotated refresh token. Reuse of an invalidated refresh token revokes the token family.

```http
POST /api/v1/auth/mobile/logout
Content-Type: application/json

{ "refreshToken": "..." }
```

### Security requirements

- HTTPS only outside local development.
- Exact allowlist for redirect URIs.
- One-time code lifetime at most a few minutes.
- Validate PKCE, state, issuer, audience, and nonce as applicable.
- Never put access or refresh tokens in redirect URLs.
- Rotate refresh tokens and support server-side revocation.
- Rate-limit authorization exchange and refresh endpoints.
- Redact all credentials from backend and client logs.
- Use associated/universal links for production where possible; a custom `contee://` scheme may remain a development fallback.

### Native session lifecycle

Use an explicit status union:

```ts
type AuthStatus =
  | 'bootstrapping'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable'
```

On cold start:

1. Read refresh token from SecureStore.
2. If absent, mark unauthenticated.
3. If present, call mobile refresh once.
4. Store the rotated refresh token before exposing the authenticated route tree.
5. Fetch `/api/v1/users/me` and then mark authenticated.
6. For network/5xx failure, mark unavailable and allow retry; do not erase a potentially valid refresh token.
7. For terminal 400/401 refresh failure, clear SecureStore and mark unauthenticated.

## 9. API and platform-specific gaps

| Current web behavior | Native design | Release phase |
| --- | --- | --- |
| HttpOnly refresh cookie | SecureStore rotating refresh token | Required before production auth |
| `window.location` Google login | AuthSession + system browser + app link | MVP |
| `next/navigation` | Expo Router | MVP |
| `navigator.clipboard` | Expo Clipboard | MVP |
| Web Share/clipboard fallback | React Native Share or Expo Sharing | MVP |
| Browser `File` upload | Document/Image Picker URI + multipart adapter | Phase 2 |
| Blob URL profile image | Authenticated download/cache to local URI | Phase 2 |
| `@dnd-kit` ordering | Gesture Handler + Reanimated ordering | Phase 2 |
| Canvas/DOM PDF generation | Backend PDF + FileSystem + share sheet | Phase 3/backend |
| Service worker online status | Native network state integration | MVP |
| `window.confirm` | Native Alert/confirm abstraction | MVP |
| Browser unsaved history guard | Navigation `beforeRemove`/router guard | Phase 2 |
| GA4 web page views | Native analytics provider with route masking | Phase 3 |

## 10. Environment and application configuration

Mobile environment names:

```text
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_DEV_AUTH_BYPASS=false
EXPO_PUBLIC_API_LOG=false
```

Rules:

- `EXPO_PUBLIC_*` values are public application configuration, never secrets.
- Fail fast when `EXPO_PUBLIC_API_URL` is absent or invalid.
- Local devices cannot use the development computer's `localhost`; use a reachable LAN hostname or HTTPS development endpoint.
- Disable verbose API logs in preview and production profiles.
- Fail a production build if `EXPO_PUBLIC_DEV_AUTH_BYPASS` is true.

`app.config.ts` must define separate development, preview, and production identifiers. Replace placeholders only after bundle IDs and domains are confirmed.

```ts
export default {
  expo: {
    name: 'Contee',
    slug: 'contee',
    scheme: 'contee',
    ios: {
      bundleIdentifier: 'REPLACE_WITH_CONFIRMED_IOS_BUNDLE_ID',
      associatedDomains: ['applinks:REPLACE_WITH_CONFIRMED_LINK_DOMAIN'],
    },
    android: {
      package: 'REPLACE_WITH_CONFIRMED_ANDROID_PACKAGE',
      intentFilters: [],
    },
  },
}
```

Do not guess production identifiers, Apple team IDs, Android signing details, domains, or EAS project IDs.

## 11. Implementation phases

### Phase 0: Baseline and decisions

Tasks:

- Record current successful results for `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- Confirm Node/npm versions used by CI.
- Confirm iOS bundle ID, Android application ID, production link domain, and EAS organization.
- Obtain backend agreement for section 8.
- Inventory current API endpoints against backend OpenAPI once its generation issue is fixed.

Exit criteria:

- Web baseline is green or all pre-existing failures are documented.
- Mobile identifiers and backend auth contract have owners.

### Phase 1: Workspace and shared domain

Tasks:

- Add npm workspaces without moving the Next.js app.
- Create `@contee/domain` with package-level typecheck and tests.
- Move canonical models, DTOs, mappers, and selected pure utilities.
- Update web re-exports/imports to consume the shared package.
- Configure Next `transpilePackages` only if the chosen package output requires it.
- Avoid package build-order complexity by using a clearly documented source or compiled-package strategy consistently.

Recommended package strategy:

- Build shared packages to `dist` with declarations for CI and editor clarity.
- Export only compiled `dist` files in package `exports`.
- Add a root `build:packages` script and run it before web/mobile production builds.
- During development, run package TypeScript in watch mode alongside the target app.

Exit criteria:

- No canonical model is duplicated.
- Shared packages contain no platform imports or globals.
- Existing web behavior and all baseline checks remain green.

### Phase 2: Shared API client and query contracts

Tasks:

- Implement `createApiClient` and its refresh single-flight behavior.
- Implement web and test session adapters.
- Move endpoint repositories incrementally, starting with team and read-only conti APIs.
- Extract query keys/options without toast/router/store side effects.
- Keep browser file/PDF methods in web until their adapters exist.
- Add tests for auth header scoping, refresh concurrency, one-retry limit, URL safety, mapping, and pagination.

Exit criteria:

- Web uses the injected shared client for migrated endpoints.
- Authorization is never sent to an untrusted origin.
- Concurrent 401 responses trigger one refresh request.
- Existing web checks remain green.

### Phase 3: Expo shell and read-only MVP

Tasks:

- Generate `apps/mobile` with the current Expo Router TypeScript template.
- Add theme primitives, providers, error boundary, and protected route layout.
- Implement secure session adapter and native query focus/network integration.
- Implement login/callback when backend mobile auth exists; otherwise use development bypass only.
- Implement team bootstrap/selection.
- Implement conti list, conti detail, song list, team summary, settings, logout, and external share viewing.
- Add loading, empty, unavailable, offline, and error states for every screen.

Exit criteria:

- Runs on iOS Simulator and Android Emulator.
- Cold-start session restoration behaves as section 8 specifies.
- Team switching invalidates or scopes all team-owned queries correctly.
- Core read-only screens work at small and large accessibility font sizes.
- No token appears in logs, AsyncStorage, routes, or screenshots.

### Phase 4: Editing and native files

Tasks:

- Implement create/edit/publish/delete conti flows.
- Implement unsaved-change protection.
- Implement song search, direct entry, and native reordering.
- Implement song create/edit and song-form editing.
- Add document/image picking and multipart adapters for sheet music/profile images.
- Implement safe external link opening, clipboard, and native sharing.
- Preserve role-based permissions from shared domain logic.

Exit criteria:

- OWNER/ADMIN/MEMBER/VIEWER behavior matches web and backend rules.
- Mutation success updates or invalidates the correct team-scoped cache.
- Failed upload presents recovery without losing the saved conti.
- Back navigation cannot silently discard a dirty form.

### Phase 5: Production hardening

Tasks:

- Add backend PDF export and mobile file sharing.
- Add associated/universal links and verify external conti share links.
- Add push notifications only after defining event types and user preferences.
- Add native analytics with masked route parameters and no PII.
- Add crash reporting with data redaction.
- Configure EAS development, preview, and production profiles.
- Add store privacy metadata, permission descriptions, icons, splash assets, and release checklist.
- Add persisted safe query caches only if product testing shows value.

Exit criteria:

- Preview builds install on physical iOS and Android devices.
- OAuth works after install, cold start, cancellation, and expired session.
- Deep links work from terminated, backgrounded, and foreground states.
- Store builds contain no development bypass, debug logging, or mock API adapter.

## 12. Testing and verification

### Shared packages

Required tests:

- DTO-to-model mappings, including null/optional values.
- Worship time normalization.
- Permission rules.
- Query key isolation by team and filter.
- Safe URL rules.
- API error normalization.
- 401 refresh concurrency and retry limits.

### Mobile component/integration tests

Use the Expo-compatible React Native Testing Library setup selected by the generated SDK.

Required flows:

- Auth bootstrap: no token, valid token, expired token, network outage.
- Team selection: persisted valid team, revoked team, no teams.
- Conti list: loading, empty, results, pagination/filter, retry.
- Conti detail permissions and publish state.
- Dirty form discard confirmation.
- Upload progress/error/retry.
- Logout clears query cache and SecureStore.

### Device verification matrix

Before a preview release, verify at minimum:

- Current iOS simulator plus one physical iPhone.
- Current Android emulator plus one physical Android device.
- Small phone viewport and large phone viewport.
- Korean locale and Asia/Seoul timezone.
- Light/dark system appearance if dark mode is enabled.
- Default and large accessibility text.
- Online, offline, slow network, expired access token, and server 5xx.
- OAuth cancel/retry and deep link from a terminated app.

### Root commands to provide

The implementing agent should add consistent root scripts similar to:

```json
{
  "scripts": {
    "dev:web": "next dev",
    "dev:mobile": "npm run start --workspace @contee/mobile",
    "build:packages": "npm run build --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present && tsc --noEmit",
    "test:all": "npm test && npm run test --workspaces --if-present",
    "lint:all": "npm run lint && npm run lint --workspaces --if-present"
  }
}
```

Avoid recursive script loops: a root script must not invoke itself through `--workspaces`. Use distinct names or explicit workspace lists if npm resolves the root package during workspace execution.

## 13. Observability and privacy

- Define one error normalization layer with `kind`, safe user message, HTTP status, backend code, and retryability.
- Never log request/response bodies by default.
- Redact authorization, cookie, password, token, email, profile image URL, invite code, share token, Bible/memo text, and file URLs.
- Mask dynamic IDs and share tokens in analytics route names, matching the existing web analytics intent.
- Do not send conti titles, song titles, memos, Bible verses, team names, emails, or invite codes to analytics.
- Attach a generated request correlation ID only if the backend supports it.
- Distinguish `unauthenticated` from `backend unavailable` in telemetry and UI.

## 14. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Backend retains cookie-only auth | Mobile production login blocked | Agree and implement section 8 before promising release date |
| Shared package extraction breaks web aliases | Web regression | Extract one domain at a time and keep re-export shims |
| Expo and Next React versions differ | Install/runtime issues | Preserve each framework's supported versions; do not force dedupe |
| Multipart differs between browser and React Native | Upload failures | Platform `FileTransferAdapter` and physical-device tests |
| Team ID omitted from a query key | Cross-team stale data | Central key factories and isolation tests |
| Offline draft conflicts | Data loss | No offline mutation queue until versioned conflict contract exists |
| PDF output differs by platform | User-facing inconsistency | Backend-generated PDF as one source |
| Deep links expose tokens | Credential leak | Redirect with one-time code only; never tokens |
| Development bypass reaches production | Authentication bypass | Build-time assertion and CI scan |
| Full UI sharing expands scope | Slow, fragile migration | Enforce ADR-001 in reviews |

## 15. Open decisions requiring owner input

These are intentionally not guessed by the implementation agent:

- Confirmed iOS bundle identifier.
- Confirmed Android application ID.
- Apple Developer and Google Play organization ownership.
- EAS organization/project ownership.
- Production API URL and mobile OAuth redirect domain.
- Whether external shared conti links should open the app, web, or an app-first fallback page.
- Mobile MVP edit scope: read-only first versus conti creation/editing in the first store release.
- Backend PDF endpoint ownership and response design.
- Push notification event list and opt-in policy.
- Analytics/crash provider and privacy policy updates.

None of these block workspace/domain extraction. Bundle IDs, production OAuth, deep links, store builds, and production release do depend on them.

## 16. First implementation task list

The first agent working from this document should stop after this bounded slice:

1. Run and record the web baseline commands.
2. Add npm workspace configuration.
3. Scaffold `packages/domain` only.
4. Extract `ApiResponse`, `PageDto`, auth/team/song/conti/dashboard models, DTOs, and mappers.
5. Change existing `src/types/*.ts` files into compatibility re-exports from `@contee/domain`.
6. Add mapper and pure utility tests.
7. Run web tests, lint, typecheck, and build.
8. Report exact files changed, commands run, failures, and the next smallest slice.

Do not scaffold the Expo app in the same change as the initial domain extraction unless all web baseline checks are green and the diff remains reviewable.

## 17. Reference documents

- Existing web README: `README.md`
- Backend alignment notes: `BACKEND_API_ALIGNMENT.md`
- External sharing requirements: `CONTI_SHARE_PRD.md`
- Expo monorepos: <https://docs.expo.dev/guides/monorepos/>
- Expo Router: <https://docs.expo.dev/router/introduction/>
- Expo authentication: <https://docs.expo.dev/guides/authentication/>
- Expo SecureStore: <https://docs.expo.dev/versions/latest/sdk/securestore/>

