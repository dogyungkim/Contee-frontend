# DASHBOARD DOMAIN KNOWLEDGE

## OVERVIEW

Team-scoped aggregate read model for summary, recent contis, songs, and activity.

## WHERE TO LOOK

| Concern            | Path                                     | Detail                                         |
| ------------------ | ---------------------------------------- | ---------------------------------------------- |
| Aggregate endpoint | `api/dashboard.api.ts`                   | `GET /api/v1/teams/{teamId}/dashboard`         |
| Backend shape      | `api/dashboard.dto.ts`                   | Summary, conti, song, and activity payload     |
| Conversion         | `api/dashboard.mapper.ts`                | Nested summary/conti/activity mapping          |
| Frontend model     | `models/dashboard.ts`                    | Aggregate consumed by the hook and UI          |
| Team-aware query   | `hooks/use-dashboard.ts`                 | Key factory, enable guard, stable empty values |
| Main rendering     | `components/dashboard-content.tsx`       | State branching, local song filter, navigation |
| Loading parity     | `components/dashboard-skeleton.tsx`      | Skeleton for the content grid                  |
| No-team state      | `components/team-empty-state.tsx`        | Team creation entry point                      |
| Route status       | `src/app/(dashboard)/dashboard/page.tsx` | Currently redirects to `/dashboard/contis`     |

## CONVENTIONS

- Keep `selectedTeamId` in `dashboardKeys.data(...)`; team changes must select a new cache entry.
- Enable the aggregate query only when teams exist and `selectedTeamId` is truthy.
  The non-null assertion in `queryFn` depends on that guard.
- Preserve the hook's stable return shape: empty summary, arrays, and status flags let
  `DashboardContent` branch without nullable aggregate handling.
- Render states in domain order: no team, loading skeleton, error, then populated/empty sections.
- Keep song filtering local and bounded: blank query shows four songs; active query shows eight.
- Update the skeleton whenever the content grid or major card grouping changes.
- `index.ts` is the supported surface for dashboard components, hook, keys, and hook view model.

## ANTI-PATTERNS

- Do not fetch before team selection or remove team identity from the query key.
- Do not make `useMockDashboard()` the production path; the Axios mock adapter already
  supplies transport-compatible data when mock mode is enabled.
- Do not assume `DashboardContent` is live product UI while the route redirect remains.
  Mount it deliberately or keep changes limited to preparation work.
- Do not duplicate summary/activity shapes in components; change DTO, mapper, model,
  and hook return contract together.
- Do not deepen the current song-domain coupling. `dashboard.dto.ts` and the model import
  song internals; prefer a stable song public type when that boundary is introduced.

## NOTES

- Dashboard data is currently read-only; there are no dashboard mutations or invalidations.
- Visual changes must keep content inside the existing authenticated workspace shell.
