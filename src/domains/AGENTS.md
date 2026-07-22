# DOMAIN LAYER KNOWLEDGE

## OVERVIEW

Business-capability slices; this file covers only rules shared by sibling domains.

## STRUCTURE

| Path                | Domain-layer role                                       |
| ------------------- | ------------------------------------------------------- |
| `*/api/*.api.ts`    | Concrete endpoint calls through `src/lib/api.ts`        |
| `*/api/*.dto.ts`    | Backend wire shapes, including request/response details |
| `*/api/*.mapper.ts` | Explicit DTO-to-frontend conversion boundary            |
| `*/models`          | Domain and view-facing business shapes                  |
| `*/hooks`           | Query keys, server-state orchestration, workflow hooks  |
| `*/components`      | Reusable UI that still carries business meaning         |
| `*/utils`           | Pure, domain-owned transformation or policy helpers     |
| `*/index.ts`        | Deliberate external surface, not an automatic barrel    |

## WHERE TO LOOK

| Change                      | Start here                        | Check next                                 |
| --------------------------- | --------------------------------- | ------------------------------------------ |
| Backend payload or endpoint | Owning domain's `api` folder      | `.codex/API.md`, backend API docs          |
| Cache/refetch behavior      | Owning domain's query hook        | Its key factory and mutation invalidations |
| Route-reused workflow UI    | Owning domain's `components`      | Consumers under `src/app`                  |
| Business transformation     | Owning domain's mapper or `utils` | Top-level behavior tests when present      |
| Cross-domain use            | Target domain's `index.ts`        | Add only a stable, narrow export           |

## CONVENTIONS

- Keep query-key factories beside their domain hooks; include every scope selector
  that changes the response, especially `teamId`.
- Treat `src/types/{domain}.ts` as compatibility input. New owning types stay in
  the domain model, DTO, or hook view-model file that gives them meaning.
- Public APIs are intentionally gradual: `auth`, `dashboard`, and `team` have
  `index.ts`; `conti` and `song` do not yet expose broad domain barrels.
- Current tests are intended to exercise stable pure helpers in `tests/*.test.mjs`;
  preserve those importable JS seams when changing tested policies.

## ANTI-PATTERNS

- Do not turn `index.ts` into `export *` coverage of every internal file.
- Do not make a second DTO/model for convenience without naming the boundary it serves.
- Do not hide a domain cycle behind aliases; dashboard-to-song and conti-to-song
  internals are existing narrow debts, not permission for more coupling.
- Do not place mock-only branches in feature components; `src/lib/mock/adapter.ts`
  selects mock transport without changing domain consumers.
