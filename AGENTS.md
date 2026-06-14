# AGENTS.md

## Project

Barber Shop SaaS — quản lý tiệm cắt tóc nam tại Việt Nam. Target: tiệm nhỏ độc lập và chuỗi nhỏ.

Tech stack: Next.js 14+ App Router · Tailwind CSS · shadcn/ui · PostgreSQL · Prisma v6 · NextAuth.js · Cloudflare R2 · Vercel · Supabase

## Business Rules

- Every shop is a tenant. Tenant-owned tables must include and enforce `shop_id`.
- Plans: `basic` (default) · `pro` · `pro_max`. Statuses: `active` · `expired`. Trial tracked by `trial_expires_at`.
- Roles: `superadmin` · `owner` · `manager` · `receptionist` · `barber` · `skinner`.
- Auth: username/password only. Do not add email or social login.
- Visit statuses: `pending` · `in_progress` · `completed`.
- A visit uses service items OR combo items, never both. Selecting a combo clears services; selecting a service clears combos.
- Barber/skinner assignment editable only within 3 hours after `completed_at`.
- Show warning when visit has `is_haircut = true` and no photos.
- Only `barber` role can upload haircut photos. Other roles view only.

## Coding Rules

- Prisma only for DB access. No raw SQL.
- API routes under `src/app/api/`. Must return JSON.
- Never use `fetch` directly in components or hooks.
- Client Components/hooks → `fetchClient` from `@/lib/fetchClient`.
- Server Components → `fetchServer` from `@/lib/fetchServer`.
- Use `DEFAULT_JSON_HEADERS` from `@/lib/apiConfig` for JSON requests.
- Use `hasResponseData` from `@/lib/apiResponse` for optional response data guards.
- Use `ROUTES` for navigation, `API_ROUTES` for API calls. Never hardcode URLs.
- Never use `window.location`, `window.location.href`, or `window.location.assign`.
- Never hardcode UI text in components → `src/constants/texts/`.
- Shared cross-module constants → `src/constants/common/`.
- Known finite values such as item types, statuses, roles, and modes must be declared as constants/enums in `src/constants/common/` before use. Do not scatter raw string literals like `"service"`, `"combo"`, `"barber"`, or `"owner"` through logic.
- Role checks, role arrays, role-keyed records, and role labels must use exported role constants/types from `src/constants/common/roles.ts`.
- Never define shared types inside components → `src/types/`.
- Never hardcode colors or custom spacing → use design tokens only.
- Strict TypeScript. No `any`.
- Use shadcn/ui components where possible.
- Mandatory: before writing or styling any UI, search `src/components/global/` for an existing component/pattern and reuse it. If the pattern is reusable, add or extend a global component first.
- Do not use native/browser controls or hand-rolled visuals when a global component exists for that pattern.
- Every successful user action must show a success toast.
- Keep changes scoped to the requested module.
- Split components into the smallest practical focused components.
- Shared or reusable helper functions must live in `src/utils/`.
- Inside a page/component file, keep only one module-scope function: the page/component function that returns JSX.
- Page/component-specific handlers and helpers may be declared inside that component function.
- Do not declare helper functions or additional component functions outside the main component function in the same file.

## Component Placement

- `src/app/` → route files only (`page.tsx` · `layout.tsx` · `loading.tsx` · `error.tsx` · `not-found.tsx` · `route.ts`).
- App-wide reusable UI → `src/components/global/`.
- Shared mobile navigation/components → `src/components/mobile/`.
- Module components → `src/components/modules/<module>/`.
- Page-specific components → `src/components/screens/<module-or-route>/`.
- Route-only orchestration → inline in `page.tsx`.
- `page.tsx` files must keep route orchestration plus page-level view/semantics, not only a one-line render of another component.
- Do not create single-use page wrapper/container components that only move the whole page body out of `page.tsx`; inline that page body directly into the route file.
- Move reusable or pure functions declared outside a component to `src/utils/`; page-specific handlers may stay inside the page component function.
- If a `page.tsx` or component file contains multiple component functions, split them into separate files under the matching `src/components/screens/` or `src/components/modules/` folder. `/design-system` is exempt as the reference screen.
- Never create PascalCase component files inside `src/app/`.
- Module and screen components must build on global primitives, not redefine base visuals.
- Module and screen components must not reimplement existing global primitives such as typography, buttons, inputs, comboboxes, calendars, skeletons, cards, alerts, or empty states.
- Title/value display pairs must use a single-row layout with title on the left and value on the right, spaced evenly; use or add a global component for this pattern.
- Split large components into focused children (sections, panels, lists, rows, form fields).
- Keep module component files directly under `src/components/modules/<module>/`; do not create nested component subfolders inside a module.
- Every component/util folder with exports must include an `index.ts` barrel file.

## Naming

- Files: pages/layouts = `kebab-case` · components = `PascalCase` · hooks = `camelCase` (prefix `use`) · utils/types/texts = `camelCase`
- Functions: components = `PascalCase` · hooks = `use` prefix · internal handlers = `handle` prefix · exports = verb-first camelCase · API handlers = `GET` / `POST`
- Variables: internal = `_camelCase` · exports = `camelCase` · booleans = `is/has/can` prefix · constants = `UPPER_SNAKE_CASE` · enums = `UPPER_SNAKE_CASE`

## Data Fetching

- Server Components → `fetchServer`. Client Components → `fetchClient` via TanStack Query.
- Each entity has one hook in `src/hooks/`. Hook exports one function combining query + mutations.
- When a module shares API data or shared business logic across multiple screens/components, create a module context in `src/context/` similar to `VisitContext`.
- Query key = private constant in hook module. Response data key = private constant, e.g. `const VISIT_RESPONSE_DATA_KEY = "visit"`.
- When multiple mutations need optional response data → create one private `get[Entity]ResponseData()` using `hasResponseData`. Never repeat `if (!hasResponseData(...))` per mutation.
- Error handling: 400 → show message · 401 → redirect `/login` · 403 → redirect `/dashboard` · 404 → redirect `/not-found` · 500 → toast error.

## Types & Texts

- Types → `src/types/<module>.ts`, export via `src/types/index.ts`.
- Texts → `src/constants/texts/<module>.ts`, export via `src/constants/texts/index.ts`.
- Shared constants used by multiple modules/APIs → `src/constants/common/<name>.ts`, export via `src/constants/common/index.ts`.
- Known finite data values → constants/enums in `src/constants/common/` when shared, or the owning module constants file when module-specific.
- Prisma generates DB types. Only add types for API responses, session payloads, and what Prisma doesn't cover.
- When adding a module, create matching `src/types/<module>.ts` and `src/constants/texts/<module>.ts`.

## Testing

- Stack: Vitest + React Testing Library.
- Test files live next to the file under test.
- Do NOT write or update tests unless explicitly asked.
- Do NOT run tests or ESLint after implementation unless asked.
- When asked to commit: run ESLint + targeted Vitest for new/updated test files only.
- Run full suite only when explicitly requested.
- If feature code changed but tests not updated, remind user before committing.

## Git

- Branches: `feature/name` · `fix/description` · `chore/description`.
- Before new branch: `git checkout develop && git pull origin develop`.
- Never commit directly to `main` or `staging`.
- Commit format: `type: short description`. Types: `feat` · `fix` · `chore` · `refactor` · `style` · `test`.
- If asked to commit only → commit and stop. Do not push or create PR.
- If asked to push → commit + push + create PR into `develop`.

## Dependencies

- Use npm. No global installs.
- When adding a package, check for TypeScript declarations. Install `@types/package-name` as devDependency if needed.
- Node v22+. Prisma v6. Do not upgrade without testing.

## Workflow

- After every completed task, update `CHANGELOG_AI.md`. Append only, never remove entries.

## Context Loading

Before starting any task, decide which files to read based on task type:

- UI task → read `CONTEXT.md` + `docs/SCREENS.md`
- API task → read `CONTEXT.md` + relevant `src/app/api/` route file
- DB task → read `CONTEXT.md` + `docs/data-model.md` + `prisma/schema.prisma`
- Setup/config task → read `CONTEXT.md`
- Bug fix → read the broken file + adjacent test file
- Default → `AGENTS.md` is sufficient, no extra files needed
