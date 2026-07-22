# SHARED COMPONENTS

## OVERVIEW

Cross-route web composition lives here. Business-owned UI stays with its domain;
route-only UI stays beside its route.

## STRUCTURE

```text
components/
├── analytics/  # GA bootstrap and masked App Router page views
├── auth/       # Root session-to-store bridge
├── layout/     # Public chrome and authenticated navigation shell
├── providers/  # Application-wide client provider configuration
├── pwa/        # Browser/network status surfaces
├── sections/   # Public landing-page blocks
└── ui/         # Design-system primitives; see ui/AGENTS.md
```

## COMPOSITION MAP

| Concern                     | Mount point                      | Shared component                                          |
| --------------------------- | -------------------------------- | --------------------------------------------------------- |
| Query, auth, PWA, analytics | `src/app/layout.tsx`             | `providers`, `auth`, `pwa`, `analytics`                   |
| Public header and footer    | `src/app/layout.tsx`             | `layout/conditional-*`                                    |
| Dashboard navigation        | `src/app/(dashboard)/layout.tsx` | `layout/sidebar`, `layout/dashboard-mobile-sidebar`       |
| Marketing sections          | `src/app/page.tsx`               | `sections/hero-section`, `feature-section`, `cta-section` |

## PLACEMENT RULES

- Add here only when a component is shared by route groups, mounts an app-wide
  browser integration, or is a reusable public-site section.
- Put feature workflows, forms, and read models in
  `src/domains/{domain}/components`; shared shell code may compose them but must
  not become their owner.
- Keep one-route helpers near that route instead of promoting them preemptively.
- Keep provider policy in its provider file; layouts decide ordering and scope.
- `layout` owns navigation chrome and responsive shell adapters, not page content.
- `sections` is specific to the public landing page; dashboard panels do not move
  there merely because they are visually sectioned.
- `analytics` must retain production gating and route-value masking when page-view
  behavior changes.
- `pwa` may use browser APIs, but service-worker lifecycle remains owned by the
  root layout and `public/sw.js`.

## ANTI-PATTERNS

- Do not add API calls, query keys, DTO mapping, or domain mutations here.
- Do not duplicate desktop/mobile business behavior; responsive wrappers should
  reuse the same shared shell component.
- Do not place styled one-off controls beside the primitives; extend or compose
  `ui` according to its child guide.
