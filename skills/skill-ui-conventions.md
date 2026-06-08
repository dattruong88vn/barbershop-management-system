# UI Conventions

## Purpose

This document defines mandatory UI implementation rules for all frontend work.

Always read this file together with:

- docs/SCREENS.md
- docs/ui/navigation.md
- docs/ui/design-tokens.md
- docs/ui/component-rules.md
- docs/ui/ui-guideline.md
- docs/ui/user-flows.md
- docs/ui/page-specifications.md

---

## Core Principles

### Mobile First

All screens must be designed for mobile first.

Primary users:

- receptionist
- barber
- skinner

Desktop layouts are extensions of mobile layouts.

---

### Speed First

Optimize for:

- Fast customer search
- Fast visit creation
- Fast photo upload

Avoid unnecessary clicks and navigation steps.

---

### Consistency

Do not invent new design systems.

Follow:

- design-tokens.md
- component-rules.md

strictly.

---

## UI Library

Preferred components:

- shadcn/ui

Styling:

- Tailwind CSS

Do not introduce another UI framework unless explicitly requested.

---

## Layout Rules

### Mobile

Use:

- Page Header
- Content Area
- Sticky Action Area

Do not use tables on mobile.

Use cards instead.

---

### Desktop

Use:

- Sidebar Layout
- Page Header
- Content Area

---

## Components

Use existing reusable components whenever possible.

### Component Placement

The `src/app/` tree is for route files only. Do not put reusable or module components inside route folders.

Allowed route files include:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- route tests next to the route file when needed

If a route needs UI composition, choose one of these placements:

- Put route-only orchestration directly inside `page.tsx`.
- Put module components in `src/components/<module>/`.
- Put app-wide reusable components in `src/components/design-system/`.

Default to putting reusable UI primitives and shared components in:

- `src/components/design-system/`

Module-specific components can live in the module folder only when they include module-specific composition, data shape, or behavior.

Module components must compose or extend design-system components instead of redefining base visuals.

For modules with multiple pages, split module components by ownership:

- Module-shared components stay at `src/components/<module>/`.
- Page-specific components go into `src/components/<module>/<page>/`.
- For customers, use `src/components/customers/` for shared customer components, `src/components/customers/search/` for Customer Search page components, and `src/components/customers/profile/` for Customer Profile/Detail page components.

Before creating, moving, or extracting any component or helper function, classify its ownership:

- App-wide reusable: put UI components in `src/components/design-system/`; put shared pure helper functions in `src/lib/`; put shared types in `src/types/`; put shared text in `src/constants/texts/common.ts` or another appropriate shared text file.
- Module reusable: put module components in `src/components/<module>/`; put module helper functions in a clearly named module lib file only when they depend on that module's data shape or business language.
- Screen-local only: keep inside the screen/component file only when it is small, not reused, and tightly coupled to that screen's state or event handling.

Split large screen/module components into focused child components for sections, panels, lists, rows, and form fields. Route/view components should orchestrate layout and state wiring instead of rendering every UI block inline.

Do not leave app-wide wrappers or helper functions inside a module file just because the first use case came from that module. If a component/function can naturally be reused by multiple modules or screens, move it to the shared location immediately and let the module pass its own copy, route, active state, or behavior through props.

Examples:

- Use `src/components/design-system/Skeleton.tsx` for the shared skeleton primitive.
- Put a customer-only profile skeleton composition near the customer module if it combines customer-specific sections, but build it from `Skeleton`.
- Put app-wide mobile bottom navigation in the design system, while each screen passes active item and actions through props.
- Put customer visit date, money, and photo-warning display helpers in `src/lib/` when they can be reused by search, profile, visit detail, or reporting screens.

Prefer:

- Card
- Badge
- Dialog
- Sheet
- Select
- Input
- Button

from shadcn/ui.

---

## Colors

Never hardcode colors.

Use design tokens only.

Follow:

docs/ui/design-tokens.md

---

## Spacing

Never create custom spacing scales.

Use documented spacing tokens only.

---

## Forms

Use:

- React Hook Form
- Zod

Rules:

- Labels above inputs
- Inline validation
- Required fields clearly marked

---

## Navigation

Follow:

docs/ui/navigation.md

Do not add menu items or navigation flows that are not documented.

---

## Screen Structure

Follow:

docs/SCREENS.md

Do not invent additional sections unless required by business rules.

---

## Business Rules

Important:

- Show warning when haircut service exists and no photo uploaded.
- Only role `barber` can upload haircut photos; all other roles can only view photos/photo warnings.
- Respect visit status restrictions.
- Respect role-based access.
- Respect tenant boundaries.

---

## Responsive Rules

Mobile

0-767px

Tablet

768-1023px

Desktop

1024px+

---

## Accessibility

Minimum touch target:

44px

Minimum font size:

14px

All interactive elements must be keyboard accessible.

---

## Before Implementing Any Screen

Read:

1. AGENTS.md
2. KB_INDEX.md
3. This file
4. docs/SCREENS.md
5. page-specifications.md

Only then start implementation.
