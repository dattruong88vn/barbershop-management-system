# AI Project Changelog

This file tracks project changes made by humans, Codex, Claude, Cursor, Copilot, and other AI agents.

## Instructions for AI Agents

- Update this file after every completed task.
- Never remove historical entries.
- Append only.
- Use chronological order for dated entries.
- Add a new date section when the task date is not already present.
- If the current date section already exists, append new bullets under the matching categories.
- If a category has no changes, write `None`.
- Keep entries concise and factual.

## Reusable Entry Template

Copy this structure when starting a new date section:

- Date heading: `## YYYY-MM-DD`
- Required subsections: `Business Changes`, `Database Changes`, `API Changes`, `UI Changes`, `Refactoring`, `Breaking Changes`, `Notes`
- Default bullet when there are no changes: `- None`

## 2026-06-04

### Business Changes
- Added AI knowledge base indexing support for project context loading.
- Added AI-assisted project changelog tracking.
- Optimized AI agent documentation for Claude Code, OpenAI Codex, Cursor, and GitHub Copilot.

### Database Changes
- Added `users.status` with `active`/`inactive` values so staff can be deactivated without deleting historical visit data.

### API Changes
- Updated change password redirect handling so staff roles continue to Customer Search after first-login password change.

### UI Changes
- Updated UI documentation to mark the Create Visit route as TBD until aligned with `ROUTES`.
- Clarified that standalone Visit Detail requires `GET /api/visits/:id` or backend implementation before UI work.
- Removed the standalone Photos bottom navigation assumption for MVP and documented photos as part of Customer Detail and Visit Detail.
- Added `skills/skill-ui-conventions.md` to UI context routing in `KB_INDEX.md`.
- Clarified manager navigation scope, report/dashboard placeholder status, pending photo upload API, and pending trial warning session/API support.
- Built the Customer Search page with debounced name/phone search, clear search, loading skeletons, customer cards, create customer flow, and customer detail/create visit actions.
- Built the Login page for the existing NextAuth Credentials login flow.
- Linked the Customer Search quick create visit action directly to the create visit section on Customer Detail.
- Refined the Change Password page with app-owned validation and Vietnamese error copy.
- Added the BarberOS dark/gold UI component spec and aligned UI token/rule docs to use it as the styling source of truth.
- Added the Auth screen UI spec for Login and Change Password, including current redirect and first-login contract notes.
- Translated all `docs/ui` documentation prose to Vietnamese while preserving route, API, token, role, and component identifiers.
- Rebuilt Login and Change Password UI with the shared auth layout, BarberOS dark/gold tokens, shadcn `Button`/`Input`, and lucide icons.

### Test Changes
- Added Login page unit tests and updated Change Password page tests for the rebuilt Auth UI behavior.

### Refactoring
- Made `AGENTS.md` more concise and moved routing responsibility to `KB_INDEX.md`.
- Improved `KB_INDEX.md` usage guidance and common task context loading.
- Reorganized `CHANGELOG_AI.md` instructions and reusable template.
- Moved Login and Change Password into an auth route group and shared their form shell UI.
- Updated `KB_INDEX.md` so UI feature work loads `docs/ui/component-spec.md` and the new auth route group.
- Updated `AGENTS.md` so UI work also loads the shared component spec.
- Linked Auth UI context in `AGENTS.md`, `KB_INDEX.md`, and `docs/ui/page-specifications.md`.
- Added shared auth password-field UI and aligned global Tailwind theme variables with BarberOS design tokens.

### Breaking Changes
- None

### Notes
- Created `KB_INDEX.md` for AI agent context discovery.
- Created `CHANGELOG_AI.md` as the reusable changelog for human and AI-assisted changes.
- Reviewed `AGENTS.md`, `KB_INDEX.md`, and `CHANGELOG_AI.md` together for missing sections, duplication, contradictions, and organization.

## 2026-06-05

### Business Changes
- Added persistent login behavior so authenticated users can return without logging in again during the session lifetime.

### Database Changes
- None

### API Changes
- Set NextAuth JWT session lifetime to 30 days with daily session refresh.
- Updated dynamic owner resource API route context types for Next.js 16 route handler type-checking.
- Filtered inactive staff from staff lists, visit create options, visit staff assignment, and credentials login.
- Changed staff deletion behavior to mark staff inactive instead of hard-deleting the user record.
- Kept inactive historical staff visible in visit history while omitting them from new-visit staff suggestions.

### UI Changes
- Rebuilt Login and Change Password auth UI against the updated Geist-style component spec and auth screen spec.
- Added Geist-style global tokens and utilities for auth surfaces, typography, status colors, and `material-base`.
- Updated auth layout, form shell, password field, inline error alerts, and primary auth buttons to use the updated design tokens.
- Added a shared `Button` loading prop and fixed primary button contrast across light/dark token modes.
- Redirected already-authenticated users away from `/login` to the dashboard.
- Moved UI screen documents into `docs/ui/screens/` and added the Customer Search screen spec to UI context routing.
- Added the `/dashboard` page with a Dashboard heading and role-based post-auth redirects for owner/manager vs staff users.
- Rebuilt the Customer Search page to match the new screen spec with responsive header/navigation, realtime search, recent searches, customer cards, empty states, and create-customer modal.
- Added a Geist-style success toast after creating a customer, delayed navigation so the toast is readable, and documented the create-customer success behavior.
- Extracted Login, Change Password, and Customer Search UI pieces into shared design-system and customer components.

### Test Changes
- Verified Login and Change Password page behavior with their existing focused Vitest files.
- Verified persistent auth middleware/session changes with focused auth, middleware, and login tests.
- Verified owner dynamic resource route handlers with focused branch, service, combo, and staff route tests.
- Added unit coverage for persistent session max age, authenticated `/login` redirects, unauthenticated login access, auth inline alert rendering, login required-marker behavior, change-password required markers, and button loading state.
- Added unit coverage for the Dashboard page, shared post-auth redirect helper, login redirects by role, change-password redirects by role, and middleware staff dashboard fallback.
- Updated Customer Search page tests for realtime search, card navigation, and create-customer modal behavior.
- Added focused unit coverage for extracted design-system components, customer UI components, app toast provider behavior, and customer display helpers.

### Refactoring
- Kept auth error and label copy in `src/constants/texts/auth.ts` and preserved shared auth component structure.
- Updated AGENTS, KB index, UI conventions, and page specifications to point at the new `docs/ui/screens/` document structure.
- Updated agent testing workflow so tests and ESLint run only when committing code or when explicitly requested.
- Moved toast presentation styles into a design-system component so app providers only handle toast state and events.
- Moved customer display helpers and page-level UI sections out of the Customer Search page to keep page logic focused on state and handlers.

### Breaking Changes
- None

### Notes
- Created branch `feature/auth-design-system-ui` from the latest `develop`.
- `next build --webpack` passes after aligning dynamic route handler context types with Next.js 16.
- Browser verified `/login` on the running localhost server; `/change-password` returned 404 on that server, likely because the server was started before the new auth route group was available and needs a restart.

## 2026-06-06

### Business Changes
- Added Customer Profile screen documentation routing for the customer detail workflow.

### Database Changes
- None

### API Changes
- Added customer profile update support for editing customer name and phone from the Customer Profile screen.

### UI Changes
- Rebuilt Customer Profile UI from the new screen spec with responsive header/actions, metrics, suggestions, recent photos, completed visit history, edit modal, lightbox, and toast feedback.
- Fixed `Button asChild` rendering so Customer Profile action links do not crash Radix Slot at runtime.
- Refined the Customer Profile screen to match the provided desktop/tablet and mobile references, including the framed surface, compact mobile metrics, in-panel bottom navigation, and darker theme-safe surfaces.
- Imported the v0 consolidated screen specification into `docs/SCREENS.md`.
- Imported v0 design preview components into `src/components/design` and supporting mock data into `src/lib/design-data.ts`.
- Added a local `Badge` UI primitive so imported design preview wrappers compile without adding a new dependency.
- Updated Login and Change Password to match the v0 neutral auth card direction with compact brand, bordered form surface, password guidance, and support text.
- Updated Customer Search to use the v0-style desktop sidebar shell, mobile header, neutral search surface, grouped result list, and bottom navigation create action.
- Updated Customer Profile surfaces, chips, photo grid, visit rows, edit modal, lightbox, and mobile bottom navigation to align with the imported v0 UI direction.
- Fixed Customer Profile mobile bottom navigation so it stays pinned to the bottom of the viewport.
- Fixed Customer Search mobile header so it remains visible while scrolling.
- Fixed Customer Search mobile layout so only the content area scrolls above the fixed bottom navigation.
- Replaced the Customer Profile name fallback so the customer ID is not shown while profile data is loading.
- Added a shared design-system `Skeleton` primitive and used skeleton loading regions for Customer Profile.
- Updated shared customer/auth field, alert, modal, avatar, skeleton, recent-search, and toast styling away from the older `material-base`/gray utility treatment.
- Moved the shared password field into `src/components/design-system/PasswordField.tsx`.
- Added a shared `EmptyState` design-system component and updated Customer Search to compose it.
- Moved Customer Profile skeleton composition into the customer module while keeping primitive skeleton visuals in the design system.
- Updated the Customer Profile create-visit form to compose shared `Button` and `InlineAlert` components and use design tokens.
- Fixed Customer Search hydration by loading recent searches from `localStorage` only after mount.

### Refactoring
- Linked the Customer Profile screen spec from AGENTS, KB index, and page specifications.
- Split Customer Profile rendering into internal section components inside `CustomerVisitHistory.tsx` to keep the exported component focused on state and orchestration.
- Moved Customer Profile visit display helpers into `src/lib/customerVisitDisplay.ts` for reuse outside the screen component.
- Moved Customer Profile section components into `src/components/customers/CustomerVisitHistorySections.tsx` so the route component only manages state and orchestration.
- Added reusable design-system `MobileBottomNavigation` and `ImageLightbox` components, then composed them from the customer module.
- Moved app-wide mobile bottom navigation configuration into `src/components/design-system/AppMobileBottomNav.tsx` and reused it from Customer Search and Customer Profile.
- Clarified UI token documentation so Geist neutral/status colors are the default design language and gold is only a limited legacy/brand accent.
- Updated `AGENTS.md` from the v0 project to include `docs/SCREENS.md` as the consolidated UI spec entry point.
- Added `docs/SCREENS.md` to the UI documentation routing in `KB_INDEX.md`.
- Added missing auth/customer UI strings to constants for the updated screens.
- Removed the older per-screen UI spec files under `docs/ui/screens/` and updated agent/UI routing to use `docs/SCREENS.md` as the single screen-spec source.
- Added component placement rules requiring reusable UI primitives/components to live in `src/components/design-system/`, with module components composing from design-system primitives.
- Updated UI skill conventions to require ownership classification for app-wide, module-level, and screen-local components/functions before creating or extracting them.
- Updated UI skill conventions so `src/app/` route folders only contain route files, with route-only orchestration kept in `page.tsx` and components moved to `src/components`.
- Added the `src/app/` route-file-only rule to route, naming, and unit-test skill conventions so component and test placement stays consistent.
- Reorganized customer module components so shared components stay at `src/components/customers/`, Customer Search components live in `src/components/customers/search/`, and Customer Profile components live in `src/components/customers/profile/`.
- Documented customer component folder ownership in AGENTS, KB index, UI component rules/spec, and UI skill conventions.
- Removed unused v0 design preview artifacts from `src/components/design/` and `src/lib/design-data.ts`.
- Inlined the Customer Detail route orchestration into `src/app/customers/[id]/page.tsx` and removed the separate app-folder `CustomerVisitHistory` component.
- Moved `VisitCreateForm` from the app route folder into `src/components/customers/VisitCreateForm.tsx`.
- Moved the Visit Create form test next to its component and renamed the customer detail behavior test away from the removed component name.
- Removed the old `src/components/auth` folder after moving its reusable field into the design system.

### Breaking Changes
- None

### Notes
- Did not run tests or ESLint because checks are only run on explicit request or commit.

## 2026-06-07

### Business Changes
- Added standalone Visit Detail support for the documented `/visits/:id` workflow.
- Added the documented Create Visit route as `/visits/create`.
- Documented that only role `barber` can upload haircut photos; other roles can only view photos/photo warnings.

### Database Changes
- None

### API Changes
- Added `GET /api/visits/:id` to load a tenant-scoped visit detail response.
- Aligned customer search and visit create/options API role checks with documented owner, manager, receptionist, barber, and skinner access.
- Added Create Visit API validation to reject payloads that include both service IDs and combo IDs.

### UI Changes
- Built the responsive Visit Detail screen with visit information, status, services, combos, barber/skinner, photo section, missing-photo warning, and locked staff-edit state.
- Built the responsive Create Visit page with customer search/selection followed by the services, combos, barber, skinner, and total price form.
- Updated Create Visit form success flow to navigate to the newly created visit detail page.
- Added a success toast when Create Visit completes before navigating to the visit detail page.
- Wired desktop sidebar navigation and app mobile bottom navigation to documented `ROUTES`.
- Split newly added visits/customer UI into focused child components for customer selection, visit detail sections, staff edit panel, form fields, and sidebar nav items.
- Updated Customer Detail create-visit actions to pass the current customer into `/visits/create` so staff do not need to search for the same customer again.
- Renamed the Create Visit submit button from "Tạo visit pending" to "Tạo visit".
- Updated Create Visit selection behavior so selecting a combo clears selected services, and selecting a service clears selected combos.

### Refactoring
- Added a focused `useVisitDetail` hook for loading visit details and refreshing the detail cache after staff updates.
- Added Visit Detail UI strings and component prop types to the existing visits constants/types.
- Aligned Create Visit route documentation and KB routing with the new `/visits/create` page.
- Removed the obsolete customer hash create-visit route constant.
- Documented the mutually exclusive service/combo visit selection rule across agent, business, data model, screen, page specification, and user flow docs.
- Documented the rule that every successful user action must show a success toast.
- Documented the rule that all client navigation must use Next navigation and must not use `window.location`.
- Replaced `fetchClient` `window.location` redirects with an app navigation event handled by `Providers` through `router.push`.
- Added unit coverage for desktop sidebar and mobile bottom navigation route links.
- Added component-splitting rules so new screen/module components are decomposed into section, panel, list, row, and form-field child components.
- Added focused unit tests for changed visit routes, visit hooks, visit create/detail components, app navigation, mobile navigation, customer navigation, and updated API/customer tests.

### Breaking Changes
- None

### Notes
- `./node_modules/.bin/tsc --noEmit` passes.
- Attempted targeted Vitest tests for all changed code paths, but Vitest failed during startup because the local Rollup native optional package `@rollup/rollup-darwin-arm64` has an invalid code signature.

## 2026-06-08

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed stale UI documentation references to deleted context files from `docs/SCREENS.md`.
- Aligned `docs/ui/component-spec.md` font guidance with `CONTEXT.md` to use `font-sans` without custom font imports.
- Standardized documented UI routes against `src/constants/routes/appRoutes.ts`, including owner-prefixed routes.

### Refactoring
- Updated the UI context loading guidance in `docs/SCREENS.md` to use `AGENTS.md`, `CONTEXT.md`, and the remaining UI spec files.
- Removed obsolete Geist font import guidance from the UI component spec.
- Added route constant references to screen and page specs, and marked Superadmin Landing as pending a `ROUTES` constant.

### Breaking Changes
- None

### Notes
- Did not run tests or ESLint because this was a documentation-only change.
- Did not run tests or ESLint for the font documentation update.
- Did not run tests or ESLint for the route documentation update.
