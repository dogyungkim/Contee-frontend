# TEAM DOMAIN

## OVERVIEW

Owns team creation/joining, team summaries and details, membership rosters,
invite codes, and role-based capabilities. Selected-team state lives at the
workspace seam in `src/context/team-context.tsx`, not inside this directory.

## STRUCTURE

| Area              | Path                               | Responsibility                                   |
| ----------------- | ---------------------------------- | ------------------------------------------------ |
| Member actions    | `hooks/use-team-member-actions.ts` | Confirmations, clipboard, role labels, toasts    |
| Permission policy | `utils/team-permissions.js`        | Roles allowed to edit team content               |
| Roster policy     | `utils/team-member-filters.ts`     | Search/filter and manageable-member rules        |
| Selection         | `../../context/team-context.tsx`   | Current team, URL bootstrap, first-team fallback |

## WHERE TO LOOK

- Team selector and create/join entry points: `src/components/layout/sidebar.tsx`.
- Team management composition: `src/app/(dashboard)/dashboard/teams/page.tsx`.
- Join-and-select cache handoff: `components/join-team-form.tsx`.
- Existing permission behavior test: `tests/team-permissions.test.mjs`.

## CONVENTIONS

- `TeamProvider` fetches teams only after authentication. Bootstrap selection
  from a valid `?teamId=`, otherwise select the first team; tolerate `null` while loading.
- Every team-scoped query/action receives the explicit team ID. A context change
  alone is not a cache boundary; the ID must appear in the query key.
- After joining, await the list invalidation, read `teamKeys.lists()`, then select
  the new/matching team. Do not guess the joined team from the membership response.
- Content editing roles are `OWNER`, `ADMIN`, and `MEMBER`; `VIEWER` is read-only.
  Reuse `canEditTeamContent` in conti/song consumers.
- Member administration is narrower: only `OWNER`/`ADMIN` may manage members.
  Never expose actions for the current user or an `OWNER`; keep
  `canManageTeamMember` and server authorization aligned.
- Member remove/role mutations invalidate `teamKeys.members(teamId)`. Create/join
  invalidate `teamKeys.lists()`. Also invalidate detail/list data when a mutation
  changes team metadata or summary fields such as `memberCount`.
- Keep invite codes uppercase at form boundaries and treat clipboard feedback as
  transient UI state; the API remains the authority for joining.

## ANTI-PATTERNS

- Do not persist a second selected-team source in Zustand, local storage, or a page.
- Do not duplicate role matrices in new consumers or equate content editing with
  member administration.
- Do not use the selected team name/summary where full detail is required; resolve
  `useTeamQuery(selectedTeamId)` and retain the summary only as a loading fallback.
- Do not invalidate all queries for roster-only changes; target the team key family.

## NOTES

- Sidebar selection currently changes context without rewriting `?teamId=`; preserve
  that distinction unless navigation semantics are intentionally redesigned.
