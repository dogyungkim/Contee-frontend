---
version: beta
name: Contee Sanctuary Infrastructure
description: A quiet praise-management workspace with a soft attached sidebar, a floating main content panel, restrained monochrome controls, and table/list-first dashboard surfaces. The tone is operational and calm: worship planning as high-fidelity infrastructure rather than friendly church software.
---

# Contee Design System

## Brand Position

Contee should feel like a professional operating console for worship leaders and production teams. The interface is calm, precise, and logistical. It avoids heavy decoration, bright brand colors, and overly friendly SaaS tropes. The design should make planning feel controlled and legible.

Core qualities:

- Quiet confidence
- Clear operational hierarchy
- Editorial typography
- Low-noise surfaces
- Precise borders and spacing
- Technical metadata for songs, dates, keys, and BPM

## Current App Shell

The authenticated dashboard uses a two-layer shell:

- The outer background is a bright neutral canvas.
- The sidebar stays visually attached to that background.
- The main content area floats as a white panel with rounded corners, a thin border, and a soft shadow.

This is intentional. The sidebar should not feel like a separate card. It should feel like part of the background, while the main workspace is the active surface.

Implementation references:

- App shell: `src/app/(dashboard)/layout.tsx`
- Sidebar: `src/components/layout/sidebar.tsx`
- Global tokens: `src/app/globals.css`

## Colors

Use neutral tone layers more than color accents.

```yaml
background:
  app-canvas: "#f4f4f4"
  dashboard-shell: "#f7f7f8"
  content-panel: "#ffffff"
  sidebar-surface: transparent

text:
  ink: "#1a1c1c"
  body: "#4c4546"
  muted: "#60646c"

borders:
  default: "#f0f0f3"
  content-panel: "#e7e7e9"
  content-card: "#e5e5e7"
  content-inner: "#e8e8ea"
  sidebar-control: "#dcdee0"

actions:
  primary: "#000000"
  primary-hover: "#1a1a1a"
  on-primary: "#ffffff"
  link: "#0d74ce"

semantic:
  error: "#ba1a1a"
  success: "#16a34a"
```

Guidelines:

- Do not use `bg-muted` broadly inside dashboard content. It becomes visually heavy quickly.
- Prefer white surfaces with quiet borders.
- Use soft gray fills only for small controls, active sidebar rows, or metadata chips.
- Use black only for primary actions and the small Contee mark.
- Use blue only for links and rare wayfinding.

## Typography

Contee uses Inter-style sans typography for almost everything, with JetBrains Mono-style metadata for technical values.

```yaml
display:
  family: Inter, SF Pro Display, system-ui, sans-serif
  weight: 600
  tracking: negative for large headings

body:
  family: Inter, SF Pro Text, system-ui, sans-serif
  weight: 400-500

metadata:
  family: JetBrains Mono, Fira Code, SFMono-Regular, Menlo, Monaco, monospace
  size: 12-13px

label-caps:
  family: Inter
  size: 11px
  weight: 600
  tracking: 0.08em
  transform: uppercase
```

Use metadata styling for:

- Song key
- BPM
- Dates in compact list rows
- Status-like small text
- Short codes and invite codes

## Shape

The shape language is compact and infrastructural.

```yaml
buttons: 8px
inputs: 8-12px
cards: 12px
main-panel: 16px
sidebar-controls: 12px
status-pills: 9999px only when status semantics need it
```

Avoid making every control pill-shaped. Rounded pills should be reserved for small badges or status markers.

## Elevation

Most surfaces should be flat. Depth is used mainly to separate the main content panel from the app canvas.

```css
.floating-shell {
  border: 1.8px solid #e7e7e9;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgb(26 28 28 / 0.04),
    0 8px 24px rgb(26 28 28 / 0.035);
}
```

Guidelines:

- Main workspace may float.
- Sidebar should not float.
- Cards inside the main workspace may have a very soft shadow, but border should do most of the work.
- Avoid dramatic drop shadows.

## Dashboard Layout

Desktop dashboard:

- Outer shell: bright neutral background with padding.
- Sidebar: transparent, attached to the background.
- Main content: floating white panel.
- Main panel contains the page content and owns scrolling.

Mobile dashboard:

- Main panel fills the available screen.
- Sidebar is shown through a sheet.
- Sheet sidebar can use the same sidebar component but should not introduce extra card styling.

## Sidebar

The sidebar should feel embedded in the background.

Rules:

- No outer border, radius, or shadow on the sidebar container.
- Logo block should sit directly on the canvas.
- Team selector and profile card may have light borders.
- Active nav item uses a subtle white overlay.
- Hover state uses soft white transparency.

Current sidebar details:

```yaml
container:
  background: transparent
  border: none
  shadow: none

team-selector:
  background: white / 80%
  border: "#dcdee0"
  radius: 12px

profile:
  background: white / 60%
  border: "#dcdee0"
  radius: 12px

active-nav:
  background: white / 80%
```

## Main Content

The main content panel is the primary workspace.

Rules:

- Use a white panel over the bright shell background.
- Keep page content constrained with a max width.
- Use 1px borders in content cards.
- Avoid heavy gray fills inside cards.
- Lists should feel like structured rows rather than decorative cards.

Current content border behavior:

```yaml
main-panel-border: "#e7e7e9"
card-border: "#e5e5e7"
inner-border: "#e8e8ea"
```

## Components

### Buttons

Primary:

- Black background
- White text
- 8px radius
- No visible shadow

Secondary:

- White or light gray background
- Thin border
- Near-black text

Ghost:

- Used mostly in sidebar and row actions
- Should stay quiet

### Cards

Cards should support information clarity, not decoration.

Rules:

- White background
- Thin border
- 12px radius
- No saturated fills
- Header and row separators use soft borders

### Lists and Tables

Preferred for dashboard data.

Rules:

- Full-row click is encouraged for list rows.
- Action menus should remain independent from row navigation.
- Use `divide-y` or border-bottom lines for row separation.
- Use metadata typography for compact values.
- Avoid zebra striping unless data density becomes high.

### Inputs and Selects

Inputs and selects should feel compact and quiet.

Rules:

- Height around 40-44px
- White background
- Light border
- 8-12px radius
- Focus border/ring should be visible but not loud

### Badges

Badges are technical chips, not colorful labels.

Rules:

- Prefer neutral gray fills.
- Use mono typography for metadata chips.
- Reserve color for true semantic states.

## Landing Pages

Marketing pages can use a softer atmospheric layer than the dashboard.

Rules:

- Hero may use sky wash gradients.
- Product mockups are preferred over abstract illustration.
- Avoid multicolor mesh gradients.
- Keep CTAs black and compact.

## Avoid

- Broad `bg-muted` blocks in dashboard content
- Dark or chunky borders
- Sidebar as a floating card
- Purple/pink SaaS gradients
- Heavy glassmorphism
- Too many nested cards
- Pill-shaped primary buttons
- Decorative colors without semantic value

## Implementation Checklist

When adding a new dashboard screen:

1. Put the page inside the existing floating main workspace.
2. Keep sidebar visually attached to the background.
3. Use a page label in `text-caption-upper`.
4. Use a clear heading with tight tracking.
5. Prefer list/table rows for repeatable data.
6. Use white surfaces and thin borders.
7. Use mono typography for metadata.
8. Avoid `bg-muted` for large content blocks.
