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

## 2026-06-09

### Business Changes
- None

### Database Changes
- None

### API Changes
- Added `POST /api/upload/presigned` for staff-only Cloudflare R2 presigned photo upload URLs.
- Added `POST /api/visits/:id/photos` to persist barber-uploaded R2 photo keys as visit photo records.
- Returned Visit Detail photo upload permission from `GET /api/visits/:id` so the UI can render upload controls reliably.
- Aligned customer search `lastVisit` with Customer Detail by only using completed visits for lookup warnings and visit badges.
- Added status-filtered `GET /api/visits?status=...` list responses for pending, in-progress, and completed visits.

### UI Changes
- Integrated Visit Detail photo upload with presigned R2 upload, success toast, inline errors, and immediate photo list updates.
- Made the empty Visit Detail photos area clickable for barber uploads and added mobile camera capture hint.
- Fixed Login redirect handling so auth callback URLs cannot point back to auth screens and first-login users go to Change Password.
- Built `/visits` Visit List with status filters, pending visit cards, photo warning badges, and links back to Visit Detail.
- Preserved Customer Detail as the back destination when creating or opening visits from a customer profile.

### Refactoring
- Added a shared Cloudflare R2 S3 client helper and public photo URL formatter.
- Added shared visit status constants and reused them for Visit List filtering and API status validation.
- Replaced remaining non-test hardcoded visit status literals with shared visit status constants.

### Breaking Changes
- None

### Notes
- Installed `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, and `nanoid`; all include TypeScript declarations.
- Added R2 environment variable examples to `.env.example`.

## 2026-06-10

### Business Changes
- Kept haircut photo deletion restricted to the barber upload permission path.
- Added role-based visit status transitions: barber/skinner can start pending visits, receptionist can complete in-progress visits.

### Database Changes
- None

### API Changes
- Added `DELETE /api/visits/:id/photos?photoId=...` to remove a visit photo scoped by `shop_id` and `visit_id`.
- Added status update support to `PATCH /api/visits/:id` for `pending` to `in_progress` and `in_progress` to `completed`.
- Added Visit Detail update support to `PATCH /api/visits/:id` for replacing services/combos and updating barber/skinner on non-completed visits.
- Added `lastUpdatedByName` to Visit Detail API responses so the UI can display the updater username instead of the raw user id.

### UI Changes
- Added an X icon button on uploaded Visit Detail photos to delete photos with success toast and inline error handling.
- Added a Visit Detail refresh button to reload the current visit details with loading, success toast, and inline error handling.
- Changed the Visit Detail update button icon from refresh to edit-style `PencilLine`.
- Updated Customer Detail visit history to show pending and in-progress visits so newly created visits appear when returning from Visit Detail.
- Added Visit Detail status action buttons for starting and completing visits based on API permissions.
- Added a Visit Detail edit panel with service/combo selectors and barber/skinner selects matching the Create Visit form.
- Added the V0 Geist design-system component set under `src/components/design-system/`, including primitives, inputs, layout, display, feedback, overlay, specialized components, tokens, utilities, and barrel exports.
- Added Geist typography utilities for `text-heading-32` and `text-copy-14`, and aligned radius tokens to the 6px/8px/12px Geist scale.
- Extended existing `EmptyState` and `Skeleton` components with Geist-compatible props while preserving their existing call sites.
- Moved app-wide shared UI components from `src/components/design-system/` to `src/components/global/`.
- Moved the auth-only form shell component to `src/components/screens/auth/`.
- Moved shadcn UI primitives from `src/components/ui/` to `src/components/global/ui/`.
- Moved mobile navigation components from `src/components/global/` to `src/components/mobile/`.
- Removed the Visit Detail header refresh button and moved the edit action into that header position.
- Changed Visit Detail editing from an inline sidebar panel to a modal form.
- Hid the Visit Detail photo upload section until the visit status is `in_progress`.
- Added an in-section photo refresh button that appears after a successful upload or delete.
- Added shared body scroll locking for project overlays so the background screen does not scroll while modals, sheets, drawers, command menus, or image lightboxes are open.
- Renamed Visit Detail "Thông tin visit" to "Thông tin chung", added status to that section, and display updater username when available.
- Combined Visit Detail services and combos into one "Dịch vụ" section and removed the separate Combo section.
- Removed the separate Visit Detail status section and moved status transition actions beside the header edit button.
- Combined Visit Detail barber and skinner display into a single "Nhân sự" section.
- Changed the pending status action label to "Thực hiện" while preserving existing role-based permissions.
- Hid the haircut photo warning while Visit Detail is still pending.
- Removed the Visit Detail header description and last-updater display row.
- Shortened the in-progress status action label from "Hoàn thành visit" to "Hoàn thành".
- Replaced the post-upload Visit Detail photo upload button with an inline plus tile at the end of the photo grid.
- Moved the Visit Detail photo refresh action to the right side of the "Ảnh kiểu tóc" section header.
- Updated default and primary button styling to use inverse neutral theme colors for stronger CTA contrast in light and dark modes.
- Replaced hardcoded owner-screen action buttons with the shared Button primitive so branch, staff, service, and combo screens inherit the same theme-aware button styling.
- Removed the separate Visit Detail staff-edit section and moved eligible completed-visit staff edits into the shared edit modal.
- Kept service/combo controls visible but disabled in the edit modal after a visit is completed, while allowing barber/skinner edits only within the 3-hour completion window.
- Matched the Visit Detail header edit button and photo refresh button styling to the primary save button used in the edit modal.
- Updated Visit Create and Visit Detail edit staff dropdowns to use the shared design-system Select styling.
- Replaced the generic staff dropdown placeholder with "Chọn thợ cắt" and "Chọn skinner".
- Replaced Visit Create and Visit Detail edit staff native browser selects with custom design-system combobox dropdowns.

### Refactoring
- Added visit photo delete route constants, hook mutation, and shared visit detail text/type entries.
- Exposed a guarded Visit Detail refetch handler from the visit detail hook.
- Added visit status mutation handling and cache invalidation for Visit Detail, Visit List, and Customer Detail history.
- Added visit detail update mutation handling with cache invalidation for Visit Detail, Visit List, and Customer Detail history.
- Added shared design-system copy constants and exported them through `src/constants/texts`.
- Moved customer module components from `src/components/customers/` to `src/components/modules/customers/`.
- Moved visit module components from `src/components/visits/` to `src/components/modules/visits/`.
- Updated app, module, and test imports to use `global`, `modules`, and `screens` component paths.
- Updated component placement documentation in `AGENTS.md` and `docs/ui/component-spec.md` for the new component folder structure.
- Updated the shadcn `components.json` UI alias to `@/components/global/ui`.
- Updated app, module, and test imports to use the new `mobile` component path.
- Reused the existing Visit Detail refresh handler for photo-section updates after photo mutations.
- Added `useLockBodyScroll` as a shared hook and applied it to global overlay primitives plus customer and visit modals.
- Updated Visit Detail tests and API tests for the new general-info, service/combo, staff, and updater-name behavior.
- Updated Visit Detail section tests for the pending photo-warning and last-updater removal behavior.
- Updated Visit Detail photo section tests for the inline plus upload control.
- Updated Visit Detail tests for completed-visit staff-only editing and expired edit-window behavior.
- Updated visit create/edit dropdown tests for the new design-system Select usage and staff placeholders.
- Updated visit create/edit dropdown tests for the custom combobox interaction and displayed selected staff values.

### Breaking Changes
- None

### Notes
- Did not run tests or ESLint because they were not requested.

## 2026-06-15

### Business Changes
- Clarified that manager dashboard is for quick operational overview and action alerts, while reports are for audit and deeper analysis.

### Database Changes
- None

### API Changes
- None

### UI Changes
- None

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Documentation-only change; did not run tests or ESLint.

## 2026-06-15

### Business Changes
- Started manager dashboard UI groundwork with chart dependency, dashboard data hook, dashboard texts, and reusable chart primitives.

### Database Changes
- None

### API Changes
- None

### UI Changes
- Added `recharts` as the charting dependency for dashboard visualizations.
- Added global chart container and tooltip primitives aligned with the existing design tokens.

### Refactoring
- Added a dashboard hook that loads the real dashboard API through `fetchClient` and `API_ROUTES.dashboard`.
- Added dashboard filter and response typing support for UI integration.

### Breaking Changes
- None

### Notes
- Did not build the dashboard page yet; this covers steps 1-4 only.

## 2026-06-15

### Business Changes
- Began the manager dashboard UI implementation with summary metrics, period filtering, and revenue trend visualization.

### Database Changes
- None

### API Changes
- None

### UI Changes
- Added focused dashboard screen components for metric cards, period filters, revenue trend charts, and loading skeletons.
- Replaced the placeholder dashboard heading with a data-backed dashboard page using the real dashboard API.
- Added current month, specific month, current year, and all-time filtering for the dashboard.
- Added the first Recharts visualization for dashboard revenue trend.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Top lists and action alerts are still pending for the next dashboard UI pass.

## 2026-06-15

### Business Changes
- Completed the remaining manager dashboard overview UI sections for ranking lists and haircut photo action alerts.

### Database Changes
- None

### API Changes
- None

### UI Changes
- Added dashboard top lists for barbers, skinners, services, and combos with count and allocated revenue.
- Added dashboard haircut warning alerts that link to visit detail pages for visits missing haircut photos.
- Expanded dashboard loading skeletons to cover the full dashboard layout.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Dev server browser verification was blocked by an existing Next dev lock for PID `12217`; lint and static checks were used instead.

## 2026-06-15

### Business Changes
- Improved dashboard API diagnostics after a reported 500 response on the dashboard endpoint.

### Database Changes
- None

### API Changes
- Added dashboard API error logging around the full request handler so server logs reveal the underlying 500 cause.

### UI Changes
- None

### Refactoring
- Added a dashboard-named report period filter helper for dashboard UI code.

### Breaking Changes
- None

### Notes
- Direct Prisma dashboard queries succeeded against the configured database; the API handler now logs hidden runtime errors for faster follow-up.

## 2026-06-16

### Business Changes
- Simplified the dashboard period selector from separate current-month and month choices into a single monthly tab.

### Database Changes
- None

### API Changes
- None

### UI Changes
- Replaced the dashboard period checkboxes with three tabs: Month, Current Year, and All Time.
- Kept the month tab defaulting to the current month and showing the month picker badge.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- None

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Grouped the dashboard data sections into one global card titled by the selected month, current year, or all-time period.
- Changed dashboard child sections to plain panels inside the grouped card to avoid nested cards.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- None

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Wrapped the dashboard period tabs and month picker badge in the global card without a title.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- None

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Simplified the dashboard period filter to show only the three period tabs and the month picker badge.
- Removed the dashboard period label/value row, divider, and card border wrapper.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- None

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Extended the global `Card` component with a reusable title and action header pattern.
- Updated dashboard chart, top-list, and alert cards to use the global card title pattern.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- None
- Regenerated Prisma Client after dashboard API returned 500 because the local client did not include `VisitService.allocatedPrice`.
- Referenced `../personal-project-design-v2/docs/GEIST_COMPONENTS.md` and adapted the V0 components to this repo's token, routing, and no-`window.location` conventions.
- Did not run tests or ESLint for the component reorganization because they were not requested.
- Verified the Visit Detail UI and overlay scroll-lock changes with TypeScript, targeted Vitest files, and ESLint; ESLint still reports the existing `no-img-element` warning in `src/components/global/Display.tsx`.
- Verified the latest Visit Detail copy and warning changes with targeted Vitest files only.
- Verified the completed-visit edit-window changes with targeted Visit Detail component tests only.
- Verified the staff dropdown design-system and placeholder changes with targeted visit form/detail tests only.
- Verified the custom staff combobox dropdown changes with targeted visit form/detail tests only.
- Updated the Visit Detail desktop header so the edit button sits beside the page title beneath the customer back link.
- Did not run tests or ESLint for the Visit Detail header layout tweak because they were not requested.
- Adjusted the Visit Detail desktop header so the title stays left while the edit/status button group aligns right beneath the customer back link.
- Added a Visit Create API guard that blocks creating a new visit when the customer already has a `pending` or `in_progress` visit.
- Added API error copy for customers with an unfinished visit.
- Blocked Customer Detail create-visit actions on the frontend when the customer has an unfinished visit and show a warning toast asking staff to complete the current visit first.
- Added the same unfinished-visit warning toast when Visit Create submission is rejected by the API guard.
- Added a Visit module context provider that centralizes visit options, create mutation, detail data, edit mutations, photo mutations, and status transitions.
- Wrapped Visit Create and Visit Detail routes with the Visit provider.
- Updated Visit Create form and Visit Detail view to consume shared visit data and methods from the Visit context instead of directly wiring hooks through route props.
- Moved the Visit context from the visits module folder into the shared `src/context/` folder and updated imports.
- Added visit staff-skip flags for "Không cắt tóc" and "Không có dịch vụ skinner" with Prisma schema and migration updates.
- Blocked receptionist completion when a visit is missing barber/skinner and the matching skip flag is not selected.
- Added warning feedback when completion is blocked by missing barber/skinner requirements.
- Added optional skip checkboxes to Visit Detail barber/skinner dropdowns and persisted those values through visit detail/staff updates.
- Removed visit staff-skip flag selection from customer visit history and visit list APIs so those endpoints do not 500 before Prisma Client is regenerated.
- Removed visit staff-skip flag selection and writes from the Visit Detail API route so it does not 500 before Prisma Client is regenerated.
- Moved Visit Detail staff-skip checkboxes out of the dropdown menus into the staff field header row and renamed the skinner skip option to "Không skinner".
- Defaulted Visit Create staff selection to the current user when the creator is a barber or skinner, with an API fallback for submitted payloads.
- Increased Visit Create/Edit field label typography for services, combos, barber, and skinner so labels stand out from option/value text.
- Increased the Visit Detail edit modal title prominence and aligned it with the close icon.
- Increased total price number typography in Visit Create and Visit Detail edit/detail views for easier recognition.
- Right-aligned total price numbers in Visit Create and Visit Detail edit summaries.
- Blocked Visit Detail photo upload/delete actions for completed visits in both the frontend and visit photo API.
- Added an app toast dismiss event and clear Visit Detail warning toasts when leaving the screen or opening the edit popup.
- Fixed Visit completion checks so saved "Không cắt tóc" and "Không skinner" selections satisfy the required staff validation.
- Clear the Visit Detail completion inline error when the updated visit response satisfies completion requirements.
- Navigate back to the customer detail screen after a visit is completed from Visit Detail.
- Matched customer visit history item title color to each visit status color.
- Changed customer visit history status icon from outlined styling to filled status color.
- Show captured hairstyle photos on completed Visit Detail screens while keeping photo edit actions locked.
- Limited Customer Detail recent hairstyle photos to the latest completed visit that has photos.
- Removed frontend visit-date sorting for Customer Detail recent photos and rely on backend visit ordering.
- Split Visit Detail sections into focused files under `src/components/modules/visits/detail/` and moved shared helpers into `src/utils/common/` and `src/utils/visits/`.
- Removed the Visit Detail sections barrel file, added component-splitting rules to `AGENTS.md`, and extracted remaining customer/visit subcomponents and helpers into focused component files and utils.
- Split Customer Detail profile/history sections into focused files under `src/components/modules/customers/profile/detail/` and reduced `CustomerVisitHistorySections.tsx` to a re-export file.
- Added barrel `index.ts` files for customer/visit module folders and utils subfolders.
- Added an `AGENTS.md` rule requiring `index.ts` barrel files for folders with exports.
- Added an `AGENTS.md` rule to create module contexts in `src/context/` when API data or logic is shared across screens/components.
- Moved remaining root-level visit components into `create/`, `detail/`, `shared/`, and `staff/` subfolders so the visits module root only exposes `index.ts`.
- Flattened customer and visit module components back to direct module-level files, removed nested component folders, and updated module import paths.
- Added a Husky pre-commit hook that runs lint and build.
- Added a Visit Detail "Tạo mới" action beside the title actions that opens Visit Create with the current visit customer, services/combo, barber, and skinner prefilled.
- Included customer summary data in the Visit Detail API response so duplicate visit creation can preselect the same customer.
- Added Visit Create query-param parsing for prefilled service/combo and staff suggestions from an existing visit.
- Did not run tests, ESLint, or build for the Visit Detail create-new action because they were not requested; TypeScript check could not run because `node`, `npm`, and `npx` were unavailable in the shell PATH.
- Hid the Visit Detail "Tạo mới" action unless every visit for that customer is completed.
- Moved the mobile "Tạo mới" action into the same row as the Visit Detail title and matched its button variant with the edit action.
- Fixed the mobile selected-customer card on Visit Create so the "Đổi khách" action aligns cleanly in the card header without squeezing customer details.
- Added a `/design-system` reference page that displays global component variants, app primitives, shadcn primitives, and interactive overlay examples.
- Added design-system reference copy to `designSystemTexts` and a `ROUTES.designSystem` route constant.
- Verified the design-system page changes with `git diff --check`; did not run tests, ESLint, or build because they were not requested.
- Made `/design-system` a public route that bypasses middleware auth and role checks.
- Changed the Visit Create selected-customer "Đổi khách" action to warning medium badge styling and removed the X icon.
- Removed the profile-prefill helper text from the Visit Create selected-customer card.
- Split the Visit Create form into "Chọn dịch vụ" and "Chọn nhân viên" sections and removed the form description line.
- Removed the Visit Create wrapper title and gave the "Chọn dịch vụ" and "Chọn nhân viên" sections separate bordered cards.
- Normalized Visit Create section spacing by removing the extra top margin before the service section.
- Removed the Visit Create page description under the page title.
- Refactored non-design-system `page.tsx` files so route files keep page orchestration/semantics while stateful screens and list/form UI live under `src/components/screens/` or module components.
- Moved page-level helper logic for auth callbacks, customer recent searches/phone validation, and visit create/list display into `src/utils/`.
- Split Visit List card and skeleton UI into focused visit module components and added missing screen/util barrel exports.
- Replaced the default root Next.js page with a project landing page using route and text constants.
- Documented the `page.tsx` structure rule in `AGENTS.md` and `CONTEXT.md`.
- Inlined single-use page wrapper components back into their matching `page.tsx` files for auth, owner CRUD, customer, and visit routes.
- Removed the now-unused screen wrapper component files and stale barrel exports after confirming they were not imported outside their route pages.
- Clarified the page/component function rule so handlers can live inside the component while helper/component functions outside the component must move to utilities or separate files.
- Split customer header, visit create field, and customer skeleton component files so each production component file has only one module-scope JSX-returning function.
- Added `created_by` tracking for customers and made `/customers` show customers created by the current staff member by default when no search term is entered.
- Removed the new customer `created_by` column dependency and made default customer lookup use existing visit creator data to avoid API 500s before a database migration is applied.
- Split customer lookup into an independent one-time default page-1 cache and separate search result cache, with the customers API returning 10 records per page.
- Moved default pagination values into shared constants and removed the default empty customer list message.
- Moved shared pagination constants into `src/constants/common/` and documented the common constants convention for future modules.
- Moved shared staff roles, visit statuses, and visit staff edit window constants into `src/constants/common/`.
- Moved `isVisitStatus` into visit helpers and added shared visit item type constants for `service` and `combo`.
- Documented the rule that known finite values must be declared as constants/enums before use.

## 2026-06-14

### Business Changes
- Added the personal reports screen path for `receptionist`, `barber`, and `skinner` roles.

### Database Changes
- None

### API Changes
- Added `GET /api/reports/personal` for staff personal reports scoped by `shop_id`, current user role, completed visits, and `period=month|year|all&month=YYYY-MM`.

### UI Changes
- Updated runtime app notifications to render through the shared Feedback notification component for success, warning, and error messages while leaving the global Toast component unchanged.
- Moved runtime feedback notifications to the top-right corner of the screen.
- Documented that runtime success, warning, and error notifications must use the global Feedback notification flow instead of rendering the Toast component directly.
- Added `/reports` with a mobile-first personal report view showing service count, combo count, period, supporting metrics, and top performed services.
- Added a management report placeholder for owner/manager users until Report API support is implemented.
- Allowed staff roles to access `/reports` through middleware.
- Connected the personal report screen to the new API with loading, error, empty, and loaded states.
- Added reusable global typography primitives for headings, paragraphs, and metric values.
- Updated the report screens to use shared typography and skeleton primitives instead of local text/skeleton styling.
- Updated personal reports with a two-column staff info section and a report-period dropdown section that contains the summary metric cards.
- Switched staff and personal report period selection to the shared global combobox primitive.
- Updated the personal report staff info section so labels are in the left column and values are aligned in the right column.
- Fixed the shared combobox runtime hook error by marking it as a Client Component.
- Updated the report-period dropdown to default to the current month and offer the last 12 months, current year, and all-time filters.
- Replaced the report-period dropdown with exclusive checkbox options for month/current year/all time, plus a month picker limited to the last 12 months through the current month.
- Added skeleton placeholders to the personal report data cards while switching report period filters.
- Replaced the native month input with a shared design-system month calendar that disables future months and months older than one year.
- Moved report metric cards and top-service data into a single data section separate from the report-period controls.
- Added a subtle divider between the report-period row and filter checkboxes.
- Renamed the month report filter to "Tháng hiện tại" and moved specific month selection behind a warning badge-style button that opens the shared month calendar in a modal.
- Split report filters into two rows with the current-month checkbox and month picker button on the first row, and year/all-time checkboxes on the second row.
- Changed the month picker badge action to small size and placed it directly after the current-month checkbox.
- Kept the year and all-time report checkboxes on one row on mobile, and changed the month picker badge action to a compact warning outline button.
- Added a separate specific-month report checkbox with the month picker badge beside it; choosing a calendar month now selects the specific-month option and unchecks current month.
- Aligned the specific-month checkbox with the all-time checkbox by moving report filters into a shared two-column grid with a wider second column.
- Changed the specific-month checkbox to open the calendar without fetching until a month is selected, preserving the previous checkbox when the modal is closed.

### Refactoring
- Added report text constants, report types, focused report module components, and report module barrel exports.
- Added a personal report hook and API route constant.
- Added individual staff role constants for new role-specific report filtering.
- Extended the shared `Skeleton` primitive with a card variant for module loading states.
- Added a shared global `Combobox` primitive and documented the rule to search/reuse global components before writing module UI.
- Strengthened UI documentation to make global component reuse mandatory and forbid native/browser controls when a matching global component exists.
- Added shared user-role constants/types and documented that role checks, role labels, and role-keyed records must use common role constants.
- Added a shared title-value row component and documented that title/value pairs must stay on one row with title left and value right.
- Added a reusable global badge-style button for compact badge actions.
- Added a distinct current-month report period constant so current month and specific month are separate UI states.

### Breaking Changes
- None

### Notes
- Did not run tests or ESLint because they were not requested.

## 2026-06-15

### Business Changes
- Started the service/combo revenue allocation backend groundwork by defining service responsibility roles for `barber` and `skinner`.

### Database Changes
- Added the Prisma `ServiceResponsibleRole` enum with `barber` and `skinner` values.
- Added `Service.responsibleRole` to identify whether a service contributes to barber or skinner reporting.

### API Changes
- Allowed `manager` users to manage services, combos, and staff accounts while keeping branch mutations owner-only.

### UI Changes
- Allowed `manager` users to access the existing service, combo, and staff management routes.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Did not run tests or ESLint because they were not requested.

## 2026-06-15

### Business Changes
- Added real manager/owner dashboard API support for revenue, visit, customer, trend, top employee, top service, top combo, and missing haircut photo data.

### Database Changes
- None

### API Changes
- Added `GET /api/dashboard?period=month|year|all&month=YYYY-MM` for `owner` and `manager` users, scoped by `shop_id`.
- Dashboard revenue now uses `visit_services.allocated_price` and snapshot fields instead of current service/combo prices.
- Added dashboard API route constant and response types for future UI integration.

### UI Changes
- None

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Did not run tests or ESLint because they were not requested.

## 2026-06-16

### Business Changes
- Clarified the manager dashboard UI contract: no page description, title text uses uppercase first letters, and the selected-period data is grouped in one card.
- Standardized client page data loading so browser/window focus does not refetch data automatically.

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed the dashboard page description under the `Dashboard` title.
- Capitalized the first letter of the selected month card title.
- Documented the manager dashboard tab filter, month-picker badge, selected-period card title, and shared data card layout.
- Documented the global page data-fetching behavior for all screens.

### Refactoring
- Disabled TanStack Query `refetchOnWindowFocus` in the shared query client.

### Breaking Changes
- None

### Notes
- Tests were not run because they were not requested.

## 2026-06-16

### Business Changes
- Confirmed the management sidebar structure will include dashboard, nested report pages, services, combos, staff, and owner-only branches.

### Database Changes
- None

### API Changes
- None

### UI Changes
- Added route constants for revenue, staff, services, combos, and branches report pages.
- Added navigation text constants for the management sidebar and report submenu labels.
- Added a desktop management sidebar for owner and manager routes.
- Added nested report links under the management report menu.
- Limited branch management and branch report links to owner users.
- Added placeholder pages for revenue, staff, services, combos, and branches reports.
- Redirected management users from the base reports route to the revenue report.
- Kept the base reports route available for staff personal reports.
- Restricted report child routes in middleware by role.
- Updated the navigation documentation for owner and manager sidebars.
- Added shared constants for management report kinds.
- Added bottom sidebar actions for settings and logout.
- Wrapped the app in NextAuth SessionProvider and rendered the management sidebar from useSession so manager users see it after login.
- Renamed user-facing Dashboard text to Tổng quan across the app and updated related documentation.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Completed sidebar planning steps 1, 2, 3, and 4.
- Did not run tests or ESLint because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Replaced the mobile bottom navigation `Tạo` item with a final `Đăng xuất` action.
- Mobile logout now uses the same NextAuth sign-out flow as the management sidebar and redirects to the login route.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed descriptions from the visit list and report headers.
- Updated text inputs, textareas, and selects to use 16px text to avoid mobile browser zoom on focus.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Updated project docs to match the latest mobile bottom navigation, visit creation origins, visit completion redirect, visit list filter order, personal report layout, and input font-size rules.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Documentation-only update; tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Updated the customer and visit create back-link text from `Quay lại tra cứu` to `Quay lại`.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Updated the visit list create button to match the customer detail create-visit button style.
- Create-visit links now carry an origin so the create screen can distinguish customer-detail and visit-list entry points.

### Refactoring
- Added shared visit-create origin constants and a route helper for creating visits from the visit list.

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Reordered visit list status filters to `Hoàn thành`, `Đang làm`, then `Pending`.
- Updated the default visit list filter to `Hoàn thành`.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Fixed the create-visit customer result row markup to avoid nested button hydration errors.

### Refactoring
- Replaced the inner select button visual with a non-interactive styled span because the whole row is already the selection button.

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Changed personal report top services and top customers into separate cards matching the general info card style.

### Refactoring
- Removed the shared history-list component from the personal report top sections.

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Wrapped the personal report top services and top customers sections in one shared card.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Grouped `Visit hoàn thành` and `Khách đã phục vụ` into one `Thông tin chung` card on the personal report screen.

### Refactoring
- Added a focused `PersonalReportGeneralInfoCard` component for grouped personal report metrics.

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Increased spacing between personal report sections while keeping title-to-content spacing tighter.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed the outer card frame around the personal report top services and top customers sections.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Added a reusable global history-style list component based on the customer detail visit history row pattern.
- Applied the shared history-style list to both personal report top services and top customers.

### Refactoring
- Replaced custom personal report top-item rows with the shared `HistoryList` component.

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- Added top served customers to the personal report API response.

### UI Changes
- Added a `Khách phục vụ nhiều nhất` card to the personal report screen.

### Refactoring
- Made the personal report top-items card title configurable for reuse.

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed the `Dịch vụ đã làm` and `Combo đã làm` summary cards from the personal report screen.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed the outer border/background wrapper around the personal report metric and top-item cards.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Changed the customer detail profile `Tạo visit` action to use the primary button variant.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Reduced the horizontal gap between the customer avatar and name/phone block on the customer detail profile summary.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Rebalanced the customer profile summary so avatar plus customer text align as one left cluster against the create-visit button.
- Restored a more comfortable gap between customer name and phone number.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Tightened the customer name and phone stack further on the customer detail profile summary.
- Vertically centered the left customer information cluster with the create-visit action.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Tightened the spacing between customer name and phone number on the customer detail profile summary.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Moved customer edit access to a direct pencil action in the customer detail header on mobile.
- Removed the mobile overflow menu from the customer detail header.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Moved the customer detail `Tạo visit` action next to the customer name in the profile summary.
- The create-visit action now appears only when the customer has no pending or in-progress visits.
- Removed the duplicate create-visit action from the customer detail header and mobile menu.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Updated visit completion flow to navigate back to the completed visit customer's detail screen.
- Visit detail completion now falls back to the loaded visit customer when no `returnToCustomerId` query parameter is present.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.

## 2026-06-16

### Business Changes
- None

### Database Changes
- None

### API Changes
- None

### UI Changes
- Removed the inline visit-detail error shown when completing a visit without enough assigned staff.
- Kept warning feedback through the global notification flow for the missing-staff completion case.

### Refactoring
- None

### Breaking Changes
- None

### Notes
- Tests and ESLint were not run because they were not requested.
