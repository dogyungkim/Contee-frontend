# AUTH DOMAIN KNOWLEDGE

## OVERVIEW

OAuth entry, cookie-backed recovery, in-memory access tokens, guards, and account/profile flows.

## WHERE TO LOOK

| Concern                | Path                                                            | Detail                                                           |
| ---------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Auth endpoints         | `api/auth.api.ts`                                               | Login URL, refresh, current user, logout, deletion, image upload |
| Wire/model conversion  | `api/auth.dto.ts`, `api/auth.mapper.ts`                         | `UserDto` and `AuthResponseDto` mapping                          |
| Query and mutations    | `hooks/use-auth-query.ts`                                       | `authKeys`, recovery, current user, cache cleanup                |
| Session orchestration  | `hooks/use-auth.ts`                                             | Initial recovery, login/logout facade, redirects                 |
| OAuth callback         | `hooks/use-auth-callback.ts`                                    | Callback query parameters and delayed conti redirect             |
| Protected shell        | `components/require-auth.tsx`                                   | Loading, unavailable, redirect, and render states                |
| Profile images         | `hooks/use-profile-image-src.ts`, `components/profile-card.tsx` | Authenticated blob load and upload preview lifecycle             |
| Canonical client state | `src/stores/auth-store.ts`                                      | `AuthStatus`, token/user transitions, `sessionVersion`           |
| 401 recovery           | `src/lib/api.ts`                                                | Deduplicated refresh and original-request replay                 |

## CONVENTIONS

- Preserve the four-state session model: `checking`, `authenticated`,
  `unauthenticated`, and `unavailable` have different UI outcomes.
- `refreshToken()` relies on the refresh cookie and may return `null`; `getMe()`
  requires an access token and supplies its bearer header explicitly.
- Key current-user queries by `sessionVersion`. Token/reset transitions increment it
  so stale users do not survive a session change.
- Logout clears the auth store and entire QueryClient even when the server logout fails.
- Profile upload success updates both Zustand user state and every
  `authKeys.currentUser()` cache entry.
- Keep `index.ts` narrow. Callback handling, destructive mutations, profile internals,
  and development bypass constants are intentionally not public exports.

## ANTI-PATTERNS

- Do not add another refresh queue; `src/lib/api.ts` already serializes concurrent 401 recovery.
- Do not collapse network/5xx recovery failures into unauthenticated; guards render
  the `unavailable` state rather than silently treating an outage as logout.
- Do not redirect until session checking finishes. `RequireAuth` sends confirmed
  unauthenticated users to `/`, while callback success goes to `/dashboard/contis`.
- Do not weaken the development bypass triple gate: development mode plus
  `NEXT_PUBLIC_USE_MOCK=true` plus `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`.
- Do not skip blob URL revocation or abort cleanup in profile-image preview/load paths.
- Do not log access tokens, cookies, email, or profile-image URLs outside the
  redacted diagnostics already implemented by `src/lib/api.ts`.

## NOTES

- Access tokens live only in Zustand memory; refresh authority is the credentialed cookie.
- Profile files are limited in the component to non-empty PNG/JPEG images up to 5 MB.
