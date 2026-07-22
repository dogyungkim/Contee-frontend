# UI PRIMITIVES

## OVERVIEW

Project-wide, domain-free controls built on native elements and Radix/shadcn
composition. Consumers own business meaning and workflow state.

## CONFIGURATION

- `components.json` is the generator contract: shadcn `new-york`, RSC/TSX,
  neutral CSS variables, Lucide icons, `@/components/ui`, and `@/lib/utils`.
- `.codex/DESIGN.md` owns visual intent; `src/app/globals.css` owns the actual
  tokens and typography utilities.
- Treat generated shadcn code as a baseline. Review CLI diffs so local tokens,
  `data-slot` hooks, variants, and accessibility behavior survive updates.

## REFERENCE PRIMITIVES

| Need                      | Follow                                                  |
| ------------------------- | ------------------------------------------------------- |
| Variants and polymorphism | `button.tsx` (`cva`, `asChild`, exported variants)      |
| Compound overlay API      | `dialog.tsx` (Radix root/portal/overlay/content family) |
| Form accessibility        | `form.tsx` (stable IDs, descriptions, errors, ARIA)     |
| Native field wrapper      | `input.tsx` (prop passthrough and invalid/focus states) |
| Primitive composition     | `calendar.tsx` (Button variants plus DayPicker slots)   |

## COMPONENT CONTRACT

- Type wrappers from `React.ComponentProps` of the native or Radix primitive;
  preserve consumer props, refs, event handlers, and `className` escape hatches.
- Keep stable `data-slot` names on public pieces; styling and compound consumers
  rely on them.
- Preserve Radix structure and behavior: portals, focus management, Escape,
  keyboard navigation, disabled states, and semantic relationships are API.
- Export the complete named family for compound controls. Do not hide a required
  trigger, title, description, portal, or close primitive behind private markup.
- Merge classes with `cn`; place consumer `className` last so supported overrides
  resolve through `tailwind-merge`.
- Use `cva` for genuine reusable variants and sizes. Export the variant function
  when another primitive composes it, as `calendar.tsx` does with Button.
- Use CSS variables and established `type-*` utilities. Add missing tokens to the
  design contract/global styles before introducing new raw colors or dimensions.
- Keep focus-visible, invalid, disabled, selected, open/closed, and responsive
  states legible without relying on color alone.
- Interactive Radix wrappers may be client components; non-interactive native
  wrappers remain server-compatible.
- Icon-only controls use Lucide and require an accessible name, commonly an
  `aria-label` or `sr-only` label.

## ANTI-PATTERNS

- No domain imports, API/query calls, stores, router access, product copy, or
  feature-specific validation.
- Do not replace Radix behavior with hand-rolled overlays or menus for styling
  convenience.
- Do not bake a single screen's exception into a base primitive; compose locally
  first, then add a named variant only after the pattern is genuinely shared.
- Do not remove ARIA wiring or focus rings to satisfy a visual customization.
