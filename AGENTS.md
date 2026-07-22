# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-16 17:30 KST
**Commit:** 05b9e7d
**Branch:** main

## OVERVIEW

Contee is a Korean worship-team workspace for contis, song libraries, song forms,
team administration, and public sharing. The frontend is a single npm package on
Next.js 15, React 19, strict TypeScript, Tailwind CSS, TanStack Query, Zustand,
Axios, and Radix/shadcn primitives.

## STRUCTURE

```text
src/
├── app/                 # App Router pages, layouts, metadata, composition
├── domains/             # Business-owned API, model, hook, and UI slices
│   ├── auth/            # Session recovery, guards, account/profile flows
│   ├── conti/           # Editor, publishing, sharing, PDF/export workflows
│   ├── dashboard/       # Aggregate dashboard read model; currently unrouted
│   ├── song/            # Team song library and song-form editing
│   └── team/            # Team selection, membership, roles, invitations
├── components/          # Domain-free primitives and cross-route app shell
├── lib/                 # Axios transport, mocks, analytics, URL safety
├── context/             # Selected-team context
├── stores/              # Cross-cutting client state; currently auth only
├── hooks/               # Domain-independent hooks
├── types/               # Compatibility/shared types, not a domain dump
└── constants/           # Application-wide immutable values
tests/                   # node:test behavior suites for pure JS utilities
public/                  # PWA assets and hand-maintained service worker
.codex/                  # Architecture, API, design, and commit conventions
```

## WHERE TO LOOK

| Task                          | Location                                                         | Notes                                                 |
| ----------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| Add or change a route         | `src/app`                                                        | Keep pages/layouts as composition shells              |
| Implement business behavior   | `src/domains/{domain}`                                           | Use the narrowest owning domain                       |
| Add an endpoint               | `src/domains/{domain}/api`                                       | Keep DTO and mapper at the transport boundary         |
| Change auth/session transport | `src/lib/api.ts`, `src/stores/auth-store.ts`, `src/domains/auth` | Refresh is deduplicated; logs redact sensitive fields |
| Change selected-team behavior | `src/context/team-context.tsx`, `src/domains/team`               | Team-scoped queries must react to `selectedTeamId`    |
| Change the protected shell    | `src/app/(dashboard)/layout.tsx`, `src/components/layout`        | Layout owns auth/team providers and scrolling         |
| Change shared UI              | `src/components/ui`                                              | Radix/shadcn primitives; no domain dependencies       |
| Change mock API behavior      | `src/lib/mock/adapter.ts`, `src/lib/mock/data.ts`                | Stateful in-memory backend selected at module load    |
| Change product visuals        | `.codex/DESIGN.md`, `src/app/globals.css`                        | Preserve the quiet, neutral operations-console style  |
| Check backend contracts       | `../Contee-backend/docs/api.md`                                  | Required by `.codex/API.md` before API work           |

## CODE MAP

`Refs` is a static alias-importer count because codegraph and TypeScript LSP
reference tools were unavailable during generation.

| Symbol                     | Type            | Location                               |  Refs | Role                                                     |
| -------------------------- | --------------- | -------------------------------------- | ----: | -------------------------------------------------------- |
| `RootLayout`               | layout          | `src/app/layout.tsx`                   | entry | Query/Auth providers, chrome, PWA, analytics             |
| `DashboardGroupLayout`     | layout          | `src/app/(dashboard)/layout.tsx`       | entry | Protected team-scoped shell and scroll owner             |
| `apiClient`                | Axios singleton | `src/lib/api.ts`                       |     8 | Credentials, bearer token, refresh, logging, mock switch |
| `useAuth`                  | hook            | `src/domains/auth/hooks/use-auth.ts`   |    14 | UI-facing auth/session orchestration                     |
| `TeamProvider` / `useTeam` | context         | `src/context/team-context.tsx`         |    11 | URL-aware selected-team state                            |
| `useConti*` / `contiKeys`  | query hooks     | `src/domains/conti/hooks/use-conti.ts` |     7 | Conti server state and invalidation                      |
| `Button`                   | UI primitive    | `src/components/ui/button.tsx`         |    40 | Highest-use shared control                               |
| `cn`                       | utility         | `src/lib/utils.ts`                     |    34 | Tailwind class composition                               |
| `mockAdapter`              | Axios adapter   | `src/lib/mock/adapter.ts`              |     1 | In-memory backend for `NEXT_PUBLIC_USE_MOCK`             |

## CONVENTIONS

- Use `@/*` for `src/*`. Formatting authority is `.prettierrc`: no semicolons,
  single quotes, two spaces, ES5 trailing commas, 80 columns, LF.
- Default to Server Components. Put `'use client'` at the lowest boundary that
  needs state, effects, events, browser APIs, or a client-only dependency.
- Keep `page.tsx` and `layout.tsx` thin. Route-local, non-reused code may live in
  `_components`, `_hooks`, or `_lib`; reusable workflows belong to a domain.
- Domain flow is `api/dto/mapper -> hooks/query keys -> components`. Server-owned
  data stays in React Query/server mechanisms; Zustand is for cross-cutting client
  state.
- Kebab-case files; PascalCase component exports; `use-` hooks; `*.api.ts`,
  `*.dto.ts`, `*.mapper.ts`; `*.schema.ts`; `*-store.ts`.
- Use `index.ts` only at meaningful public boundaries. `src/types/{domain}.ts` and
  `src/lib/api/{domain}.ts` are compatibility surfaces, not new implementation homes.
- Commit subjects use prefixes such as `feat:`, `fix:`, or `chore:` and stay under
  two sentences.

## ANTI-PATTERNS (THIS PROJECT)

- Do not grow business workflows inside route pages. The large new-conti and songs
  pages are migration debt, not templates.
- Do not put domain UI in `components/ui`, concrete endpoints in `src/lib/api.ts`,
  or server-fetched data in a monolithic global store.
- Do not deep-import another domain when its public API exports the needed symbol.
  The current conti/song cross-imports are migration debt, not precedent.
- Do not use raw Axios/fetch in UI components, raw DTOs as view models when shapes
  differ, broad barrel files, or unrelated catch-all utilities.
- Do not add endpoint logic to one-line `src/lib/api/{domain}.ts` shims.
  `song-form.ts` is a legacy exception; new work belongs in `domains/song/api`.

## UNIQUE STYLES

- Dashboard: transparent attached sidebar, floating white workspace, quiet borders,
  restrained shadows, neutral rows/lists, and mono metadata.
- Avoid broad `bg-muted`, chunky/dark borders, floating-card sidebars, saturated
  SaaS gradients, heavy glassmorphism, nested-card stacks, and pill primary buttons.
- `components.json` defines shadcn `new-york`, RSC/TSX, neutral CSS variables, and
  Lucide icons. Preserve primitive APIs and accessibility when customizing them.

## COMMANDS

```bash
npm install
npm run dev
npm run build
npm run lint
npx tsc --noEmit --incremental false
npm test
```

## NOTES

- Node 20 is pinned in `.nvmrc`; this is not a workspace or monorepo.
- Public environment variables are documented in `README.md`. Set
  `NEXT_PUBLIC_USE_MOCK=true` before importing `src/lib/api.ts`; changing it after
  client initialization does not swap adapters.
- `public/sw.js` is hand-maintained. Production registers it; development unregisters
  service workers and clears caches. Bump its cache strategy/version deliberately.
- `src/lib/mock` is shared mutable singleton state with no reset. Keep response
  envelopes, fixture relationships, and cross-collection side effects aligned.
- `.next`, `next-env.d.ts`, and `tsconfig.tsbuildinfo` are generated/ignored.
- Current baseline: TypeScript passes; ESLint exits 0 with two warnings in
  `profile-card.tsx`; `npm test` fails before assertions because `.mjs` suites import
  named exports from `.js` files while the package is not configured as ESM.
- No CI workflow, component/browser test harness, or route-level loading/error/not-found
  boundaries currently exist.
