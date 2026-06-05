# UI Conventions

## Purpose

This document defines mandatory UI implementation rules for all frontend work.

Always read this file together with:

- docs/ui/screens/screen-map.md
- docs/ui/navigation.md
- docs/ui/design-tokens.md
- docs/ui/component-rules.md
- docs/ui/ui-guideline.md
- docs/ui/screens/mobile-screens.md
- docs/ui/screens/desktop-screens.md
- docs/ui/screens/customer-search-screen.md
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

docs/ui/screens/mobile-screens.md

docs/ui/screens/desktop-screens.md

Do not invent additional sections unless required by business rules.

---

## Business Rules

Important:

- Show warning when haircut service exists and no photo uploaded.
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
4. page-specifications.md
5. Relevant screen specification files

Only then start implementation.
