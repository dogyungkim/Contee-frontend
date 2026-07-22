# API.md Backend Contract Gate Review

## recommendation

**REJECT (user-facing verdict: FAIL)**

`.codex/API.md` is not complete or accurate enough to guide future frontend API
work against the current backend contract. Its only actionable instruction points
to a path that does not resolve from the frontend repository, and it contains no
rules for the backend's shared wire contract, exceptional response types, frontend
transport boundaries, or source-parity checks.

## originalIntent

Original request: `.codex/API.md $omo:review-work 백엔드 api에 맞게 잘 설계되어있는지 리뷰해줘`.

The user wanted a read-only review of whether `.codex/API.md` is well designed
against the backend API, not an implementation change.

## desiredOutcome

A future frontend engineer should be able to consult `.codex/API.md` and reliably:

1. find the authoritative backend contract;
2. apply the common auth, response, error, pagination, multipart, and binary-stream
   rules correctly;
3. place transport code in the repository's shared client/domain DTO/mapper
   boundaries; and
4. detect and resolve drift between backend documentation and controller source
   before adding or changing an endpoint.

## successCriteria

| ID | Criterion |
|---|---|
| SC-1 | The backend contract reference is accurate and resolvable from the frontend repository. |
| SC-2 | The guide is complete enough for future API calls, including common auth/response/error rules and documented non-JSON exceptions. |
| SC-3 | The guide routes API work through the frontend's actual shared client, repository, DTO, mapper, and domain API boundaries. |
| SC-4 | The guide prevents contract drift by requiring source verification when backend docs and implemented controller mappings disagree. |

## userOutcomeReview

The desired user-visible outcome is not achieved. A developer following the file
literally cannot open the referenced contract from the frontend repository. Even
after manually finding the sibling backend repository, the file gives no guidance
for choosing the shared client, unwrapping `ApiResponse<T>`, handling refresh-token
sessions, or treating sheet-music responses as binary streams. It also provides no
way to resolve a reproduced disagreement between the backend docs and source.

## blockers

### B-1: Broken contract pointer

- `violatedCriterion`: SC-1
- Observation: `.codex/API.md:3` names `backend/docs/api.md`. From the frontend
  root, that path does not exist; the contract supplied by the project is
  `../Contee-backend/docs/api.md`.
- `evidencePointer`:
  - `.codex/API.md:3`
  - `AGENTS.md:50`
  - Read-only reproduction: `test -e backend/docs/api.md` returned 1;
    `test -e ../Contee-backend/docs/api.md` returned 0.

### B-2: Mandatory wire-contract behavior is absent

- `violatedCriterion`: SC-2
- Observation: all three lines of `.codex/API.md` omit the `/api/v1` base path,
  bearer/cookie/mobile token split, shared success/error envelopes, permission
  model, refresh rotation/session behavior, pagination, multipart handling, and
  non-JSON stream exceptions. These are implementation-affecting backend contract
  rules, not optional style guidance.
- `evidencePointer`:
  - `.codex/API.md:1-3`
  - `../Contee-backend/docs/api.md:13-106` (base URL, auth, response, error,
    permissions)
  - `../Contee-backend/docs/api.md:142-172` (web refresh contract and rotation)
  - `../Contee-backend/docs/api.md:185-230` (session APIs)
  - `../Contee-backend/docs/api.md:1560-1612` (multipart upload and authenticated
    binary stream)
  - `../Contee-backend/docs/api.md:1724-1732` (public binary stream outside
    `ApiResponse`)

### B-3: Frontend API architecture is not specified

- `violatedCriterion`: SC-3
- Observation: the guide does not say to use `src/lib/api.ts` /
  `@contee/api-client`, keep endpoint calls in the owning domain API, model wire
  shapes as DTOs, map DTOs to frontend models, or avoid raw Axios/fetch in UI code.
  Those are the repository's actual integration boundaries and are necessary for
  consistent future API work.
- `evidencePointer`:
  - `AGENTS.md:43-44`
  - `AGENTS.md:77-83`
  - `AGENTS.md:91-98`
  - `src/domains/AGENTS.md:9-27`
  - `packages/api-client/src/client.ts:82-216`
  - `packages/api-client/src/team.repository.ts:22-104`
  - `src/domains/conti/api/conti.api.ts:16-103`

### B-4: The docs-only rule already permits a real contract mismatch

- `violatedCriterion`: SC-4
- Observation: the current backend docs advertise
  `GET /api/v1/contis/team/{teamId}`, while the current controller source exposes
  `GET /api/v1/teams/{id}/contis`. The shared frontend repository follows the docs
  route. `.codex/API.md` says only to consult the docs and contains no instruction
  to verify controller source or reconcile disagreements.
- `evidencePointer`:
  - `../Contee-backend/docs/api.md:1044-1056`
  - `../Contee-backend/docs/api.md:1805`
  - `../Contee-backend/src/main/java/com/contee/team/controller/TeamController.java:313-335`
  - `../Contee-backend/src/main/java/com/contee/conti/controller/ContiController.java:40-133`
  - `packages/api-client/src/conti-read.repository.ts:13-27`

## directReviewLanes

| Review area | Verdict | Confidence | Evidence summary |
|---|---|---|---|
| Goal and constraint verification | FAIL | HIGH | SC-1 through SC-4 fail against the current three-line artifact. |
| Hands-on document QA | FAIL | HIGH | The documented path fails to resolve; representative JSON, auth/session, binary, architecture, and source-parity workflows cannot be completed from the guide. |
| Code/document quality | FAIL | HIGH | The prose is readable but functionally under-specified and points at the wrong location. |
| Security | PASS | MEDIUM | No secret or vulnerable code was added. Missing auth guidance is counted under SC-2; no separate exploitable artifact was established. |
| Context mining | FAIL | HIGH | Project rules, shared API-client code, domain boundaries, backend docs, and controller source expose requirements and drift absent from `.codex/API.md`. |

The `review-work` skill's five-agent execution surface was unavailable in this
session, so these lanes were performed directly. This limitation does not create a
blocker by itself; the artifact's reproduced criterion failures determine the
recommendation.

## manualQAMatrix

| Scenario | Expected | Actual | Verdict | Evidence |
|---|---|---|---|---|
| Open the contract exactly as instructed | Referenced file resolves | `backend/docs/api.md` is absent | FAIL | `.codex/API.md:3`; path checks above |
| Add a normal authenticated JSON endpoint | Guide identifies bearer auth and `ApiResponse<T>` handling | Neither is described | FAIL | backend docs `:19-69`; API guide `:1-3` |
| Implement web refresh/session handling | Guide identifies cookie credentials, rotation, and session endpoints | Not described | FAIL | backend docs `:142-230`; API guide `:1-3` |
| Implement sheet-music fetch | Guide distinguishes binary stream from JSON envelope | Not described | FAIL | backend docs `:1603-1612`, `:1724-1732` |
| Place a new endpoint in frontend architecture | Guide selects shared client/domain API/DTO/mapper boundary | Not described | FAIL | `AGENTS.md:43-50,77-98`; API guide `:1-3` |
| Resolve backend docs/source disagreement | Guide requires controller-source verification | No rule exists; current conti-list route differs | FAIL | backend docs `:1044`; controller `TeamController.java:317` |

This is a prose/rule artifact with no machine-consumed seam, so runtime tests and
prompt-text assertions would provide false confidence. Hands-on QA therefore used
path resolution and contract/source tracing rather than adding phrase-presence or
snapshot tests.

## directRemoveAiSlopsAndProgrammingPass

### remove-ai-slops / overfit review

- No implementation diff or tests were supplied for `.codex/API.md`; `git diff --
  .codex/API.md` is empty at frontend commit
  `420f347c50dc5a2ccdd006ceb3be77d7e339c818`.
- No excessive tests, deletion-only tests, removal-verification tests,
  tautological assertions, implementation-mirroring tests, parsing helpers, or
  normalization layers exist in scope.
- The artifact is prose. Per the skill, adding word-count, phrase, or snapshot
  tests would be overfit and is not recommended.
- The failure is under-specification and an invalid pointer, not unnecessary
  production complexity.

### programming review

- No `.ts`, `.tsx`, `.py`, `.rs`, or `.go` file is changed by this review, so
  language-specific type, LOC, and TDD gates are not applicable.
- The current guide omits the existing strict transport boundaries: shared client,
  DTO-to-model mapping, and domain-owned endpoint modules. That omission creates
  maintenance burden and contract drift and directly violates SC-3.
- No code extraction, parsing, normalization, logging, error wrapper, or helper was
  introduced.

No supplied code-review report contained these skill-perspective checks. The
evidence directory was searched before reaching that conclusion; this direct pass
provides the required coverage and the missing report is recorded as an evidence
gap, not an independent blocker.

## checkedArtifactPaths

- `/Users/bryan/Dev/Contee/Contee-frontend/.codex/API.md`
- `/Users/bryan/Dev/Contee/Contee-frontend/AGENTS.md`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/domains/AGENTS.md`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/lib/api.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/packages/api-client/src/client.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/packages/api-client/src/team.repository.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/packages/api-client/src/conti-read.repository.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/domains/auth/api/auth.api.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/domains/team/api/team.api.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/domains/song/api/song.api.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/domains/conti/api/conti.api.ts`
- `/Users/bryan/Dev/Contee/Contee-frontend/src/domains/dashboard/api/dashboard.api.ts`
- `/Users/bryan/Dev/Contee/Contee-backend/docs/api.md`
- `/Users/bryan/Dev/Contee/Contee-backend/src/main/java/com/contee/auth/controller/AuthController.java`
- `/Users/bryan/Dev/Contee/Contee-backend/src/main/java/com/contee/team/controller/TeamController.java`
- `/Users/bryan/Dev/Contee/Contee-backend/src/main/java/com/contee/conti/controller/ContiController.java`
- `/Users/bryan/Dev/Contee/Contee-backend/src/main/java/com/contee/conti/controller/SharedContiController.java`
- `/Users/bryan/Dev/Contee/Contee-frontend/.omo/ulw-loop/bootstrap-notepad.md`
- `/Users/bryan/Dev/Contee/Contee-frontend/.omo/evidence/`

## artifactAndEvidenceStatus

- Original brief, goal, success outcome, and review scope: supplied in the request.
- Changed files/diff: no change to `.codex/API.md`; the review targets its current
  tracked content. No executor implementation diff was supplied.
- Executor evidence: not supplied.
- Code review report: not supplied and no API-related review report was found under
  `.omo/evidence/`.
- Manual QA matrix: produced above from direct artifact use.
- Notepad path: `.omo/ulw-loop/bootstrap-notepad.md`.
- ULW attempt directory: unavailable because `omo ulw-loop status --json` could not
  run (`omo` is not installed/on PATH). The notepad independently records this
  condition, so the required fallback report location is used.
- Backend source revision inspected: `5274d042eaa96d6bf0de748939d2185db214d931`.
- Backend `docs/api.md` has uncommitted changes in the backend worktree; current
  on-disk docs were reviewed because the request identifies that file as the
  contract artifact.

## exactEvidenceGaps

1. No executor evidence package, changed-file list, implementation diff, standalone
   code-review report, or pre-existing manual QA matrix was supplied for this goal.
2. The prescribed five subagents could not be launched because no agent tool
   surface is exposed in this session; equivalent direct lanes are documented
   above.
3. ULW status and `currentAttemptDir` could not be retrieved because no `omo`
   executable is available; therefore this report uses the mandated fallback path.

None of these gaps is the reason for rejection. Rejection is based on B-1 through
B-4, each tied to a stated success criterion and inspected artifact evidence.

## minimumRemediationForReReview

1. Replace the broken path with `../Contee-backend/docs/api.md` and state which
   backend controller/source paths win when docs disagree.
2. Add concise rules for base URL, bearer and refresh-token behavior, common
   success/error envelopes, pagination, multipart uploads, and binary-stream
   exceptions.
3. Route all endpoint work through `src/lib/api.ts` / `@contee/api-client` and the
   owning `src/domains/{domain}/api` DTO/mapper boundary; explicitly prohibit raw
   transport calls from UI components.
4. Reconcile the conti-list route between backend docs, backend controller source,
   and `packages/api-client/src/conti-read.repository.ts`, then require endpoint
   parity checks as part of future API work.
