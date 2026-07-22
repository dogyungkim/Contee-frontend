# Manual QA — `.codex/API.md` backend contract alignment

- Verdict: **FAIL**
- Scope: read-only document/source contract QA; no app or backend server started
- Evidence directory fallback: `.omo/evidence` because `omo ulw-loop status --json` was unavailable (`omo: command not found`)
- All scenarios below were executed; none are skipped, inferred, or partial.

## Scenario list and executed checks

| Scenario | Criterion reference | Surface | Exact invocation | Verdict | Actual finding | Artifact refs |
|---|---|---|---|---|---|---|
| S1 | C1 valid source path | Frontend repository filesystem + `.codex/API.md` | `if test -f backend/docs/api.md; then ...; fi; if test -f ../Contee-backend/docs/api.md; then ...; fi; nl -ba .codex/API.md` | **FAIL** | `backend/docs/api.md` is missing; the real sibling path is `../Contee-backend/docs/api.md`, while API.md points to the former. | A1 |
| S2 | C2 required common contract coverage | `.codex/API.md`, frontend transport, backend reference | `nl -ba .codex/API.md; nl -ba src/lib/api.ts | sed -n '5,18p'; nl -ba ../Contee-backend/docs/api.md | sed -n '15,30p;32,70p'` | **FAIL** | API.md does not state base URL, auth, `ApiResponse`, or error-envelope rules; it only contains the invalid pointer. Backend docs contain those rules. | A1 |
| S3 | C3 stream exception coverage | Backend docs/source and frontend binary callers | `nl -ba ../Contee-backend/docs/api.md | sed -n '1603,1613p;1724,1733p'; nl -ba src/domains/conti/api/conti.api.ts | sed -n '75,88p'` | **FAIL** | Backend has file-stream endpoints that intentionally do not use JSON `ApiResponse`; API.md gives no exception guidance. | A2 |
| S4 | C4 endpoint list matches backend source | Backend controller annotations vs `docs/api.md` headings | Ruby route-set comparison over all `../Contee-backend/src/main/java/com/contee/**/*Controller.java` mappings and `../Contee-backend/docs/api.md` | **FAIL** | Source exposes `GET /api/v1/teams/{id}/contis`; docs expose `GET /api/v1/contis/team/{teamId}` instead. | A3 |
| S5 | C5 every frontend endpoint is documented | Frontend API repositories vs backend `docs/api.md` | `rg -n 'dashboard|contis/team|teams/.*/contis|teams/.*/dashboard' .codex/API.md ../Contee-backend/docs/api.md src packages` plus call-site `nl` checks | **FAIL** | `GET /api/v1/teams/{teamId}/dashboard` is called by the frontend but absent from backend docs. | A4 |
| S6 | C6 frontend paths match backend implementation | Frontend repositories vs backend controller mappings | `nl -ba packages/api-client/src/conti-read.repository.ts | sed -n '13,42p'; nl -ba src/domains/dashboard/api/dashboard.api.ts | sed -n '13,16p'; rg -n '@GetMapping("/\\{id\\}/contis")' ../Contee-backend/src/main/java/com/contee/team/controller/TeamController.java` | **FAIL** | Frontend calls docs-only `/api/v1/contis/team/${teamId}`; backend controller implements `/api/v1/teams/{id}/contis`. Dashboard call has no matching backend mapping. | A4 |
| S7 | C7 DTO ownership and mapper boundary | Frontend domain API folders, shared packages, backend controller DTO roots | `find src/domains -path '*/api/*' -type f | sort; rg -n '@contee/domain/.*/(dto|mapper)|to[A-Z].*Model' src/domains/{auth,team,song,conti,dashboard}/api packages/api-client/src; find ../Contee-backend/src/main/java/com/contee -path '*/controller/dto/*' -type f` | **FAIL** | The code has explicit DTO and mapper boundaries, but API.md documents none of the ownership or transport-to-model rules. | A5 |

## Adversarial cases

| Scenario | Criterion reference | Adversarial class | Expected behavior | Verdict | Artifact refs |
|---|---|---|---|---|---|
| A1 | C1 | Relative-path drift | The source path in API.md resolves from the frontend repo. | **FAIL** — path is missing. | A1 |
| A2 | C4 | Backend doc/source route drift | Documented endpoint set equals controller mapping set. | **FAIL** — one route differs in each direction. | A3 |
| A3 | C5 | Undocumented frontend call | Every frontend API endpoint has a backend-doc entry. | **FAIL** — dashboard endpoint is undocumented. | A4 |
| A4 | C6 | Stale documented route | Frontend calls resolve to a current backend controller path. | **FAIL** — conti list follows stale docs route. | A4 |
| A5 | C3 | JSON/binary response confusion | Contract identifies stream endpoints as non-`ApiResponse` and JSON endpoints separately. | **FAIL** — API.md has no such rule. | A2 |
| A6 | C2/C7 | Contract-boundary omission | Contract guide identifies envelope, auth, DTO ownership, and mapper boundary. | **FAIL** — all are absent from API.md. | A1, A2, A5 |

## Artifact references

| ID | Kind | Description | Path |
|---|---|---|---|
| A1 | command-output | API.md contents, path resolution, frontend base URL, backend auth/envelope reference | `.omo/evidence/contee-api-contract-path-and-coverage.txt` |
| A2 | command-output | Backend `ApiResponse`/`ErrorResponse`, stream exceptions, frontend binary response handling | `.omo/evidence/contee-api-contract-envelope-stream.txt` |
| A3 | command-output | Automated normalized endpoint-set comparison: docs vs backend controllers | `.omo/evidence/contee-api-contract-route-compare.txt` |
| A4 | command-output | Frontend conti/dashboard call sites and matching backend/doc route references | `.omo/evidence/contee-api-contract-frontend-mapping.txt` |
| A5 | command-output | Frontend DTO/mapper boundary and backend DTO ownership roots | `.omo/evidence/contee-api-contract-dto-mapper.txt` |

## Final assessment

**FAIL.** `.codex/API.md` is not currently a usable contract guide: its only source pointer is invalid, it omits the required common contract and boundary rules, and the referenced backend document is itself out of sync with controller routes. The frontend also calls an undocumented/unimplemented dashboard endpoint and a conti-list endpoint that matches the stale docs path rather than the backend controller path.
