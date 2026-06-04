# AGENTS.md

## Purpose

This file is the concise operating guide for AI agents working in this repository.

Use `KB_INDEX.md` as the primary routing document for context loading. Use `CHANGELOG_AI.md` to record completed work.

This guide is intended for Claude Code, OpenAI Codex, Cursor, GitHub Copilot, and other AI-assisted development tools.

## Project Summary

This is a SaaS application for managing male barbershops in Vietnam. The target users are small independent shops and small local chains.

Tech stack:

- Frontend: Next.js 14+ App Router, Tailwind CSS, shadcn/ui
- Backend: Next.js API Routes
- Database: PostgreSQL with Prisma ORM
- Auth: NextAuth.js Credentials Provider
- File storage: Cloudflare R2 for haircut photos
- Deploy: Vercel and Supabase

## Context Loading Order

Before changing code, load context in this order:

1. `AGENTS.md`
2. `KB_INDEX.md`
3. The target module section in `KB_INDEX.md`
4. Relevant files from `docs/`, `skills/`, `src/`, and `prisma/` listed for that module

Always read `skills/` conventions before writing code. For feature work, also read `docs/mvp-features.md`. For database-related work, also read `docs/data-model.md` and `docs/database.md`. For UI work, also read: `docs/ui/screen-map.md`, `docs/ui/navigation.md`, `docs/ui/component-spec.md`, `docs/ui/design-tokens.md`, `docs/ui/component-rules.md`, `docs/ui/ui-guideline.md`, `docs/ui/mobile-screens.md`, `docs/ui/desktop-screens.md`, `docs/ui/auth-screens.md`, `docs/ui/user-flows.md`, `docs/ui/page-specifications.md`.

## Key Business Rules

- Every shop is a tenant. Tenant-owned tables must include and enforce `shop_id`.
- Plans are `basic`, `pro`, and `pro_max`; default plan is `basic`.
- Shop statuses are `active` and `expired`; trial expiry is tracked by `trial_expires_at`.
- Roles are `superadmin`, `owner`, `manager`, `receptionist`, `barber`, and `skinner`.
- Auth is username/password only. Do not add email or social login unless explicitly requested.
- Visit statuses are `pending`, `in_progress`, and `completed`.
- Barber/skinner assignment can be edited only within 3 hours after `completed_at`; do not extend this window.
- Show a warning when a visit includes a haircut service (`is_haircut = true`) and has no photos.

## Coding Rules

- Use Prisma for database access. Do not write raw SQL in application code.
- Keep API routes under `src/app/api/`.
- API routes must return JSON responses.
- Do not use `fetch` directly in components or hooks.
- Client Components and hooks must use `fetchClient` from `@/lib/fetchClient`.
- Server Components must use `fetchServer` from `@/lib/fetchServer`.
- Use `DEFAULT_JSON_HEADERS` from `@/lib/apiConfig` for JSON requests.
- Use `hasResponseData` from `@/lib/apiResponse` for optional response data guards.
- Use `ROUTES` for frontend navigation and `API_ROUTES` for API calls.
- Do not hardcode UI text in components. Put UI strings in `src/constants/texts/`.
- Do not define shared types/interfaces inside components. Put them in `src/types/`.
- Use strict TypeScript. Do not introduce `any`.
- Use shadcn/ui components where possible.
- Keep changes scoped to the requested module and existing project patterns.

## Testing Rules

- Testing stack: Vitest and React Testing Library.
- Test files live next to the file under test.
- Do not add or update unit tests unless the user explicitly asks for tests.
- When tests are requested, run only the new or updated test files, for example `npx vitest run src/hooks/useCustomers.test.tsx`.
- Run the full test suite only when explicitly requested or when shared behavior has a large blast radius.
- If the user asks to commit related code before tests are written or updated, remind them and ask for confirmation before committing.

## Git Rules

- New feature branches use `feature/name`, bug fixes use `fix/description`, chores use `chore/description`.
- Before creating a new branch, pull the latest `develop`:

```bash
git checkout develop
git pull origin develop
```

- Never commit directly to `main` or `staging`.
- Commit format: `type: short description`.
- Valid types: `feat`, `fix`, `chore`, `refactor`, `style`, `test`.
- If asked to commit only, commit and stop. Do not push or create a PR.
- If asked to push code, commit, push the current branch, and create a PR into `develop`.

## Dependency Rules

- Use npm. Do not install packages globally.
- When adding a package, check whether it includes TypeScript declarations.
- If needed and available, install the matching `@types/package-name` as a dev dependency.
- Follow `skills/skill-setup-conventions.md` for Node, Prisma, Supabase, and setup details.

## Documentation Rules

- Update `CHANGELOG_AI.md` after every completed task.
- Never remove historical changelog entries.
- Append changelog information only, in chronological order.
- Keep `AGENTS.md` concise. Put routing details in `KB_INDEX.md`.
- When adding or moving documentation, update `KB_INDEX.md`.
