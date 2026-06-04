# [AGENTS.md](http://AGENTS.md)

## Project Overview

This is a SaaS application for managing male barbershops in Vietnam. The target customers are small and independent barbershops or small chains within a city or town.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js + Credentials Provider
- **File Storage**: Cloudflare R2 (for haircut photos)
- **Deploy**: Vercel + Supabase

## Project Structure

```
/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   │   ├── login/
│   │   ├── change-password/
│   │   ├── dashboard/
│   │   ├── visits/
│   │   │   └── [id]/
│   │   ├── customers/
│   │   │   └── [id]/
│   │   ├── reports/
│   │   ├── owner/
│   │   │   ├── services/
│   │   │   ├── combos/
│   │   │   ├── staff/
│   │   │   └── branches/
│   │   └── api/
│   │       ├── visits/
│   │       ├── customers/
│   │       ├── branches/
│   │       ├── services/
│   │       ├── combos/
│   │       ├── staff/
│   │       └── reports/
│   ├── components/       # Reusable UI components
│   ├── constants/
│   │   ├── routes/       # Route constants
│   │   │   ├── appRoutes.ts # Frontend navigation URLs
│   │   │   ├── apiRoutes.ts # API endpoint URLs
│   │   │   └── index.ts     # Export all route constants
│   │   └── texts/        # All UI text strings (no hardcoding in components)
│   │       ├── auth.ts
│   │       ├── visits.ts
│   │       ├── customers.ts
│   │       ├── dashboard.ts
│   │       └── index.ts
│   ├── hooks/            # TanStack Query hooks for client-side fetching
│   │   ├── useVisits.ts
│   │   ├── useCustomers.ts
│   │   └── useServices.ts
│   ├── lib/              # Utilities, Prisma client, auth config
│   │   ├── apiConfig.ts    # Default request/response config
│   │   ├── apiResponse.ts  # Shared response helpers
│   │   ├── fetchClient.ts  # Fetch wrapper for Client Components
│   │   ├── fetchServer.ts  # Fetch wrapper for Server Components
│   │   └── queryClient.ts  # TanStack Query client config
│   ├── types/            # TypeScript types & interfaces (no defining in components)
│   │   ├── auth.ts
│   │   ├── visits.ts
│   │   ├── customers.ts
│   │   ├── services.ts
│   │   └── index.ts
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Prisma migrations
├── docs/                 # Project documentation
│   ├── mvp-features.md   # MVP features & roles
│   ├── data-model.md     # Database tables & fields
│   ├── tech-stack.md     # Tech stack decisions
│   ├── database.md       # Database strategy
│   ├── git-flow.md       # Git flow & environments
│   ├── onboarding.md     # Developer onboarding guide
│   └── market-positioning.md # Target market
├── skills/               # Project conventions & known issues (read before coding)
│   ├── skill-setup-conventions.md          # Setup conventions & known issues
│   ├── skill-git-conventions.md            # Git, branch & commit conventions
│   ├── skill-naming-conventions.md         # File, function, variable naming
│   ├── skill-routes-conventions.md         # Routes conventions
│   ├── skill-text-conventions.md           # Text & constants conventions
│   ├── skill-types-conventions.md          # Types & interfaces conventions
│   ├── skill-data-fetching-conventions.md  # Data fetching conventions
│   ├── skill-api-error-handling.md         # API client & error handling
│   └── skill-unit-test-conventions.md      # Unit test conventions
└── public/
```

## Roles

The system has 6 roles:

- `superadmin` — full system access, can impersonate any shop owner
- `owner` — manages their own shop (services, combos, staff, branches)
- `manager` — manages assigned branch, views branch reports
- `receptionist` — looks up & saves customer info, uploads photos
- `barber` — looks up & saves customer info, uploads photos
- `skinner` — looks up & saves customer info, uploads photos

## Key Business Rules

- Each shop is a tenant, identified by `shop_id` in all tables
- Each shop has a `plan` field: `basic`, `pro`, `pro_max` (default: `basic`)
- Each shop has a `status` field: `active`, `expired` and `trial_expires_at`
- A visit has 3 statuses: `pending`, `in_progress`, `completed`
- Barber/skinner can be edited within 3 hours of `completed_at`, no extensions
- Warning is shown if a visit contains a haircut service (`is_haircut = true`) but has no photos
- Username/password auth only — no email or social login

## Unit Test Convention

- Testing library: Vitest + React Testing Library
- Test file placed next to the file being tested (no separate `__tests__` folder)
- When implementing a feature, Codex only writes feature code first unless the user explicitly asks for unit tests
- If the user asks to commit before unit tests are written or updated, Codex must remind the user and ask for confirmation before committing
- When writing/updating tests, run only the new or updated test files with `npx vitest run path/to/file.test.ts`; do not run the full project test suite unless explicitly requested or shared behavior has a large blast radius
- When user requests tests, commit message: `test: add unit tests for [feature name]`
- Refer to `/skills/skill-unit-test-conventions.md` for details and examples

## API Client & Error Handling

- Never use `fetch` directly in components or hooks
- Client Components → use `fetchClient` from `@/lib/fetchClient`
- Server Components → use `fetchServer` from `@/lib/fetchServer`
- Default config → use `DEFAULT_JSON_HEADERS` from `@/lib/apiConfig`
- Response data guard → use `hasResponseData` from `@/lib/apiResponse`
- Repeated response data extraction in one hook → create a private hook-module function that checks, throws, and returns data
- Error codes: 400 → show error message, 401 → redirect login, 403 → redirect dashboard, 404 → not-found, 500 → toast error
- Refer to `/skills/skill-api-error-handling.md` for details and examples

## Routes Convention

- `ROUTES` — frontend navigation, use in `Link`, `redirect`, `router.push` → import from `@/constants/routes`
- `API_ROUTES` — API endpoints, use in `fetchClient`, `fetchServer` → import from `@/constants/routes`
- Route constants live in `/src/constants/routes/`: `appRoutes.ts`, `apiRoutes.ts`, and `index.ts`
- Never use `ROUTES` for API calls or `API_ROUTES` for navigation
- Refer to `/skills/skill-routes-conventions.md` for details and examples

## Naming Conventions

- File: Page/Layout → `kebab-case`, Component → `PascalCase`, Hook/Util/Type/Text → `camelCase`
- Function: Component → `PascalCase`, Hook → `use` prefix, Internal handler → `handle` prefix, Exported util → starts with a verb (e.g. `formatDate`, `convertPrice`)
- Variable: Internal → `_` prefix, Boolean → `is/has/can` prefix, Constant → `UPPER_SNAKE_CASE`
- Refer to `/skills/skill-naming-conventions.md` for details and examples

## Data Fetching Convention

- **Server Components** → use `fetchServer` from `@/lib/fetchServer`
- **Client Components** → use TanStack Query hooks from `/src/hooks/` with `fetchClient`
- Refer to `/skills/skill-data-fetching-conventions.md` for details and examples

## Text & Constants Convention

- Never hardcode text strings in components or logic
- All UI text must be placed in `/src/constants/texts/`
- Each module has its own text file (e.g. `auth.ts`, `visits.ts`)
- Import text from `@/constants/texts` in components
- Refer to `/skills/skill-text-conventions.md` for details and examples

## Types & Interfaces Convention

- Never define types or interfaces inside components
- All types must be placed in `/src/types/` and split by module
- Import types from `@/types` in components, hooks, and API routes
- Prisma auto-generates types from schema — only add types for things Prisma doesn't cover
- Refer to `/skills/skill-types-conventions.md` for details and examples

## Branch Naming Convention

- `feature/name` — new features, checkout from `develop`
- `fix/description` — bug fixes, checkout from `develop`
- `chore/description` — docs, skills, config updates, checkout from `develop`
- Never commit directly to `main` or `staging`

## Commit Message Convention

Format: `type: short description`

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — docs, skills, config, dependencies
- `refactor:` — code refactor
- `style:` — UI/styling changes
- `test:` — add or update tests

## Commit & Push Workflow

- **Commit only** — when asked to only commit: commit with correct message, stop. Do NOT push or create PR.
- **Push code** — when asked to push: commit, push to current branch, create PR into `develop`

## Instructions for Codex

- Always read `/skills` folder first before writing any code
- Always refer to `/docs/data-model.md` before writing any database-related code
- Always refer to `/docs/mvp-features.md` before implementing any feature
- Before creating a new branch, always pull latest develop first:
  `git checkout develop && git pull origin develop`
- When installing a new package, always check if `@types/package-name` exists and install it as devDependency if needed
- Follow naming conventions in `/skills/skill-naming-conventions.md`
- Never hardcode URL strings — use `ROUTES` from `@/constants/routes` for navigation, `API_ROUTES` from `@/constants/routes` for API calls
- Never hardcode text in components — use `/src/constants/texts/` instead
- Never define types/interfaces in components — use `/src/types/` instead
- Never use `fetch` directly — use `fetchClient` or `fetchServer` from `@/lib/`
- Use `DEFAULT_JSON_HEADERS` from `@/lib/apiConfig` for JSON requests
- Use `hasResponseData` from `@/lib/apiResponse` for optional response data checks; keep response data keys as private constants in hooks
- When multiple mutations in one hook need the same response data check, use a private function inside that hook module instead of repeating `if (!hasResponseData(...))`
- Use TanStack Query for client-side fetching with `fetchClient`
- Use `fetchServer` in Server Components
- Do not write or update unit tests unless the user explicitly asks for tests
- If the user asks to commit while related unit tests are not written or updated, remind the user and ask for confirmation before committing
- Run targeted Vitest commands for only the new or updated test files when writing/updating tests, for example `npx vitest run src/hooks/useCustomers.test.tsx`; run the full `npx vitest run` only when explicitly requested or when shared behavior has a large blast radius
- Use Prisma for all database queries — never write raw SQL
- Use shadcn/ui components where possible — do not build UI components from scratch
- Keep API routes in `src/app/api/`
- All responses from API routes must be in JSON format
- Use TypeScript strictly — no `any` types
- Each feature should be developed on a separate `feature/` branch
