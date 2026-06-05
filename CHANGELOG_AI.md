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
- None

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

### UI Changes
- Rebuilt Login and Change Password auth UI against the updated Geist-style component spec and auth screen spec.
- Added Geist-style global tokens and utilities for auth surfaces, typography, status colors, and `material-base`.
- Updated auth layout, form shell, password field, inline error alerts, and primary auth buttons to use the updated design tokens.
- Added a shared `Button` loading prop and fixed primary button contrast across light/dark token modes.
- Redirected already-authenticated users away from `/login` to the dashboard.

### Test Changes
- Verified Login and Change Password page behavior with their existing focused Vitest files.
- Verified persistent auth middleware/session changes with focused auth, middleware, and login tests.

### Refactoring
- Kept auth error and label copy in `src/constants/texts/auth.ts` and preserved shared auth component structure.

### Breaking Changes
- None

### Notes
- Created branch `feature/auth-design-system-ui` from the latest `develop`.
- `next build --webpack` compiled successfully, then failed type-checking on an unrelated existing `src/app/api/branches/[id]/route.ts` route context type.
- Browser verified `/login` on the running localhost server; `/change-password` returned 404 on that server, likely because the server was started before the new auth route group was available and needs a restart.
