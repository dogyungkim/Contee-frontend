# Frontend API security-contract gate review

- recommendation: **REJECT**
- securityVerdict: **FAIL**
- highestSeverity: **HIGH**
- confidence: **HIGH**
- reviewMode: Read-only current-state security review
- reviewedCommit: `420f347c50dc5a2ccdd006ceb3be77d7e339c818`
- reviewedBranch: `feat/expo`
- sourceChangesMade: None
- reportFallbackReason: `omo ulw-loop status --json` could not run because `omo` is not on `PATH`; `.omo/ulw-loop/bootstrap-notepad.md:1-11` confirms that no usable ulw-loop CLI exists. This report therefore uses the required `.omo/evidence/<goal>-gate-review.md` fallback.

## originalIntent

Security-review `.codex/API.md` and the frontend API clients against the backend's Bearer-token, web/mobile refresh, OAuth, public-share token, and protected file-stream contracts. Determine whether the sparse frontend guidance creates meaningful risk and identify related security defects in the observed code without editing product files.

## desiredOutcome

A frontend API rule and client boundary that keep Bearer credentials on the configured trusted backend only; preserve the web HttpOnly-cookie and mobile rotating-refresh-token split; implement web/mobile OAuth without putting tokens in redirects; treat public-share tokens as credentials; distinguish authenticated and token-public file streams; and preserve `no-store`/`nosniff` semantics. The deliverable is an evidence-backed PASS/FAIL security verdict containing only security findings.

## successCriteria

- `AUTH-BEARER-TRUST`: Bearer access tokens are sent only to the configured trusted API origin and are not exposed to caller-controlled origins.
- `AUTH-PLATFORM-CONTRACT`: Frontend guidance explicitly preserves web HttpOnly-cookie refresh, mobile body-carried rotating refresh tokens, and the distinct web/mobile OAuth flows.
- `SHARE-TOKEN-CONFIDENTIALITY`: Public-share tokens are treated as access credentials and are not emitted into logs/telemetry; public endpoints do not unnecessarily expand credential exposure.
- `FILE-STREAM-CONTRACT`: Frontend guidance distinguishes authenticated and public-token file streams, their non-JSON body, and the backend's `Cache-Control: no-store` and `X-Content-Type-Options: nosniff` controls.

## userOutcomeReview

The current mobile implementation correctly generates and verifies OAuth state/PKCE, sends mobile refresh tokens in JSON, persists each rotated token pair, and disables cookies on its shared API client. The web adapter correctly refreshes from an HttpOnly cookie with `withCredentials: true` and no refresh token in JavaScript. Those controls do not make the overall API boundary safe: the shared interceptor can send a Bearer token to a per-request untrusted `baseURL`, and API logging exposes public-share capability tokens in full URLs. The three-line `.codex/API.md` neither records these security invariants nor points to the backend document at its actual repository-relative path, making the omission a meaningful future-work risk rather than a harmless summary.

## blockers

1. **[HIGH] Bearer access token can be sent to an untrusted per-request origin**
   - violatedCriterion: `AUTH-BEARER-TRUST`
   - observation: `isApiRequest` accepts every root-relative `/api/...` URL without checking the request config's effective `baseURL`. `createApiClient` then attaches `Authorization: Bearer ...`. A synthetic request using `url=/api/v1/users/me` and `baseURL=https://untrusted.example` delivered `Bearer synthetic-access` to the adapter for that untrusted origin.
   - impact: Any future caller that lets untrusted data influence Axios `baseURL` can exfiltrate the user's access token and expose the authenticated account.
   - remediation: Resolve the final request URL against the effective request `baseURL`, then require its origin to equal the configured trusted API origin before attaching either Authorization or credentials. Add an end-to-end interceptor test for a root-relative `/api` URL with a malicious `baseURL` override.
   - evidencePointer: `packages/api-client/src/client.ts:124-150`; `packages/api-client/src/safe-url.ts:23-42`; direct synthetic adapter reproduction recorded under `verificationEvidence`.

2. **[MEDIUM] Public-share capability tokens are logged verbatim, and public requests use the authenticated client**
   - violatedCriterion: `SHARE-TOKEN-CONFIDENTIALITY`
   - observation: The shared-conti repository places the capability token in the path. `getRequestUrl` concatenates the full path, and request/response/error logs emit it without URL redaction. The same shared client attaches an access token to all trusted `/api/...` requests, including backend endpoints documented as token-public and Auth-unnecessary.
   - impact: Enabled API logging or a custom log sink exposes a reusable share credential granting read access to the published conti and its sheet-music files. Sending account Bearer credentials to a capability-only endpoint also unnecessarily widens credential handling and can correlate nominally public access with an account.
   - remediation: Redact capability-bearing path segments before every log sink; test the emitted log payload rather than only the object-redaction helper. Route public-share reads/downloads through a credential-free client, or explicitly suppress Authorization for the public-share prefix.
   - evidencePointer: `packages/api-client/src/conti-read.repository.ts:37-40`; `packages/api-client/src/safe-url.ts:7-8`; `packages/api-client/src/client.ts:127-140,163-183`; `../Contee-backend/docs/api.md:1673-1678,1716-1729`; direct synthetic log reproduction recorded under `verificationEvidence`.

3. **[MEDIUM] Frontend API guidance omits every security-critical platform/share/file rule and points to a non-resolving relative path**
   - violatedCriterion: `AUTH-PLATFORM-CONTRACT`, `SHARE-TOKEN-CONFIDENTIALITY`, `FILE-STREAM-CONTRACT`
   - observation: `.codex/API.md` contains only three lines and none of `Bearer`, `HttpOnly`, `cookie`, `refresh`, `rotation`, `OAuth`, `PKCE`, `state`, `share`, `token`, `no-store`, `nosniff`, or file-stream guidance. Its `backend/docs/api.md` path does not exist from the frontend repository; the actual supplied contract is `../Contee-backend/docs/api.md`.
   - impact: Future API work can plausibly store web refresh tokens in JavaScript, fail to persist mobile rotation, put OAuth tokens in redirects, log capability tokens, parse binary streams as JSON, or introduce caching/content-sniffing proxies without violating the local rule developers and agents are told to follow.
   - remediation: Make the actual backend path explicit and summarize the security invariants as mandatory rules: trusted-origin Bearer scoping; web cookie-only refresh with credentials and no body; mobile secure storage/body refresh with atomic persistence of every rotated token; web refresh-after-callback; mobile PKCE S256/state/single-use exchange with no tokens in URLs; capability-token redaction and credential-free public calls; binary stream handling with authenticated-versus-public authorization and preservation of `no-store`/`nosniff` when proxying.
   - evidencePointer: `.codex/API.md:1-3`; `../Contee-backend/docs/api.md:19-30,109-172,232-346,1603-1612,1671-1732`; `../Contee-backend/src/main/java/com/contee/conti/controller/SharedContiController.java:40-55`.

## verifiedSecurityControls

- Web refresh conforms to the cookie contract: `src/lib/api.ts:10-28` sends an empty body with `withCredentials: true` and only stores the returned access token.
- Bearer injection is single-flight on 401 refresh and strips credentials for ordinary untrusted absolute URLs: `packages/api-client/src/client.ts:86-121,124-160,191-210`. The baseURL-override case above remains unsafe.
- Mobile exchange/refresh/logout send refresh credentials in JSON rather than cookies: `apps/mobile/src/lib/mobile-auth-api.ts:101-171`; `apps/mobile/src/lib/api.ts:21-27` disables cookies.
- Rotated mobile refresh tokens are persisted by the session adapter at `apps/mobile/src/lib/secure-session-core.ts:141-157`; the relevant test passed.
- Mobile OAuth uses random state, PKCE S256, callback-state comparison, and a code/verifier exchange: `apps/mobile/src/lib/mobile-auth-core.ts:57-101,125-133,209-211`; `apps/mobile/src/lib/mobile-auth.ts:70-110`. The RFC 7636 known-answer test passed.
- Authenticated sheet-music downloads validate API URLs and request binary `arraybuffer`: `src/domains/conti/api/conti.api.ts:75-87`. The backend applies `no-store` and `nosniff` to both authenticated and public streams at `../Contee-backend/src/main/java/com/contee/conti/controller/ContiController.java:167-183` and `SharedContiController.java:40-55`.

## verificationEvidence

- `npm run test:mobile`: **PASS**, 35/35. This includes OAuth URL/state, RFC 7636 S256, secure-session rotation, and token-safe error tests.
- `node --test packages/api-client/tests/*.test.mjs`: **PASS**, 10/10.
- Synthetic adapter reproduction against the built shared client: **FAIL as expected for the security probes**.
  - Logged URLs contained `https://api.contee.test/api/v1/share/contis/synthetic-share-token` on both request and response.
  - A request with root-relative `/api/v1/users/me` and per-request `baseURL=https://untrusted.example` carried `Authorization: Bearer synthetic-access`.
- `git diff` for all user-listed files: empty. This is a current-state audit, not validation of an executor's patch.

## directSkillPerspectiveChecks

### remove-ai-slops / overfit pass

- No changed-code diff or deletion was supplied, so there are no deletion-only or requested-removal tests to approve.
- No prompt/prose assertion, deletion-only test, or useless production extraction was found in the scoped API-client tests.
- `packages/api-client/tests/client.test.mjs:87-128` checks trusted absolute URLs and untrusted absolute request URLs but omits the effective-`baseURL` override that reproduces the Bearer leak.
- `packages/api-client/tests/client.test.mjs:218-250` tests `redactSensitive` in isolation, not the actual log payload. It therefore gives false confidence for capability tokens embedded in URLs, which bypass that helper entirely.
- `packages/api-client/tests/repositories.test.mjs:201-216` confirms the share token is put into the path but does not combine that repository behavior with logging or credential-injection assertions.

### programming pass

- Boundary/auth review covered origin resolution, credential injection, refresh concurrency, platform-specific token transport, error swallowing, untrusted response parsing, custom crypto, and binary download handling.
- The custom PKCE SHA-256 implementation is security-sensitive maintenance code, but the RFC 7636 known-answer test passes; no current cryptographic defect was reproduced, so it is not a blocker.
- No separate non-security style, architecture-taste, or hypothetical hardening finding is included.

## codeReviewReportCoverage

No executor code-review report was supplied or found in `.omo/evidence`. The existing evidence directory contains unrelated mobile UI audits only. Therefore no external report demonstrates the required programming or remove-ai-slops security perspective. The direct pass above independently establishes the blocking failures; missing report coverage is not itself an additional blocker.

## checkedArtifactPaths

- `.codex/API.md`
- `../Contee-backend/docs/api.md`
- `../Contee-backend/src/main/java/com/contee/conti/controller/ContiController.java`
- `../Contee-backend/src/main/java/com/contee/conti/controller/SharedContiController.java`
- `src/lib/api.ts`
- `packages/api-client/src/client.ts`
- `packages/api-client/src/safe-url.ts`
- `packages/api-client/src/redaction.ts`
- `packages/api-client/src/conti-read.repository.ts`
- `packages/api-client/tests/client.test.mjs`
- `packages/api-client/tests/repositories.test.mjs`
- `src/domains/conti/api/conti.api.ts`
- `src/lib/safe-url.ts`
- `apps/mobile/src/lib/mobile-auth-api.ts`
- `apps/mobile/src/lib/mobile-auth-core.ts`
- `apps/mobile/src/lib/mobile-auth.ts`
- `apps/mobile/src/lib/api.ts`
- `apps/mobile/src/lib/secure-session-core.ts`
- `apps/mobile/tests/mobile-auth-core.test.ts`
- `apps/mobile/tests/secure-session-core.test.ts`
- `.omo/ulw-loop/bootstrap-notepad.md`

## exactEvidenceGaps

- No original goal packet, executor evidence bundle, changed-files manifest, implementation diff, code-review report, or manual QA matrix was supplied. The target files have no current working-tree diff, so this review evaluates the current branch state directly.
- No live request was sent to a deployed backend. The two client leaks were reproduced with Axios's adapter boundary so no real credential or external system was touched.
- Mobile API response DTOs are trusted via TypeScript assertions rather than runtime parsing, but no security exploit tied to the stated backend contract was demonstrated; this remains outside the blocker list.
- The backend documentation states `no-store`/`nosniff` explicitly for the authenticated stream but not again in the public-stream subsection. The backend controller directly proves both headers are applied to the public stream; the frontend guidance omits both.

## finalGate

**REJECT / FAIL (highest severity HIGH).** Approval requires fixing trusted-origin resolution before Bearer injection, preventing share-token URL logging and unnecessary auth on public-share calls, and expanding `.codex/API.md` into an accurate, resolvable security contract for web/mobile auth, OAuth, public sharing, and file streams.
