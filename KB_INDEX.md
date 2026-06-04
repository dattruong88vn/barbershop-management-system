# Knowledge Base Index

This is the primary routing document for AI agents. Use it to decide which project documents, skills, and source folders to load before making changes.

Supported agents include Claude Code, OpenAI Codex, Cursor, GitHub Copilot, and other AI-assisted coding tools.

## How to Use This Index

- Start with `AGENTS.md` for global rules.
- Find the closest module below.
- Load only the listed documents and source folders needed for the task.
- Prefer module-specific context before broad repository scans.
- If a task spans modules, load each relevant module section plus `Shared Routes, Texts, Types & API Utilities`.
- After completing a task, update `CHANGELOG_AI.md`.

## Project Overview & Agent Conventions

### Business

- README.md
- AGENTS.md
- CLAUDE.md
- CHANGELOG_AI.md
- docs/mvp-features.md
- docs/market-positioning.md
- docs/rules.md

### Database

- docs/database.md
- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- docs/tech-stack.md
- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- src/lib/apiConfig.ts
- src/lib/apiResponse.ts
- src/lib/fetchClient.ts
- src/lib/fetchServer.ts

### Workflow

- CHANGELOG_AI.md
- docs/onboarding.md
- docs/git-flow.md
- skills/skill-setup-conventions.md
- skills/skill-git-conventions.md
- skills/skill-unit-test-conventions.md

### UI

# Product Context

- docs/mvp-features.md
- docs/market-positioning.md

# UI Documentation

- docs/ui/screen-map.md
- docs/ui/navigation.md
- docs/ui/component-spec.md
- docs/ui/design-tokens.md
- docs/ui/component-rules.md
- docs/ui/ui-guideline.md
- docs/ui/mobile-screens.md
- docs/ui/desktop-screens.md
- docs/ui/auth-screens.md
- docs/ui/user-flows.md
- docs/ui/page-specifications.md

# Conventions

- skills/skill-text-conventions.md
- skills/skill-ui-conventions.md

# Global UI Files

- src/app/globals.css
- src/app/layout.tsx
- src/app/providers.tsx

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-git-conventions.md
- skills/skill-naming-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-setup-conventions.md
- skills/skill-text-conventions.md
- skills/skill-ui-conventions.md
- skills/skill-types-conventions.md
- skills/skill-unit-test-conventions.md

### Source Code

- src/app
- src/constants
- src/hooks
- src/lib
- src/types
- prisma

## Authentication & Access Control

### Business

- docs/mvp-features.md
- docs/tech-stack.md
- docs/data-model.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/auth/[...nextauth]/route.ts
- src/app/api/change-password/route.ts
- src/lib/auth.ts
- src/lib/password.ts
- src/middleware.ts

### Workflow

- docs/onboarding.md
- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-unit-test-conventions.md

### UI

- docs/ui/auth-screens.md
- src/app/(auth)
- src/constants/texts/auth.ts
- src/constants/routes/appRoutes.ts
- src/constants/routes/apiRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md
- skills/skill-unit-test-conventions.md

### Source Code

- src/app/api/auth
- src/app/api/change-password
- src/app/(auth)
- src/lib/auth.ts
- src/lib/password.ts
- src/middleware.ts
- src/hooks/useChangePassword.ts
- src/types/auth.ts
- src/types/next-auth.d.ts

## Customers

### Business

- docs/mvp-features.md
- docs/data-model.md
- docs/market-positioning.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/customers/route.ts
- src/app/api/customers/[id]/visits/route.ts
- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md
- skills/skill-unit-test-conventions.md

### UI

- src/app/customers
- src/constants/texts/customers.ts
- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/app/customers
- src/app/api/customers
- src/hooks/useCustomers.ts
- src/hooks/useCustomerVisits.ts
- src/types/customers.ts
- src/constants/texts/customers.ts

## Visits & Haircut Photos

### Business

- docs/mvp-features.md
- docs/data-model.md
- docs/tech-stack.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/visits/route.ts
- src/app/api/visits/[id]/route.ts
- src/app/api/customers/[id]/visits/route.ts
- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md
- skills/skill-unit-test-conventions.md

### UI

- src/app/customers/[id]
- src/constants/texts/visits.ts
- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/app/api/visits
- src/app/api/customers/[id]/visits
- src/app/customers/[id]
- src/hooks/useVisits.ts
- src/hooks/useCustomerVisits.ts
- src/types/visits.ts
- src/constants/texts/visits.ts

## Owner Services

### Business

- docs/mvp-features.md
- docs/data-model.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/services/route.ts
- src/app/api/services/[id]/route.ts
- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md
- skills/skill-unit-test-conventions.md

### UI

- src/app/owner/services
- src/constants/texts/services.ts
- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/app/owner/services
- src/app/api/services
- src/hooks/useServices.ts
- src/types/services.ts
- src/constants/texts/services.ts

## Owner Combos

### Business

- docs/mvp-features.md
- docs/data-model.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/combos/route.ts
- src/app/api/combos/[id]/route.ts
- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md
- skills/skill-unit-test-conventions.md

### UI

- src/app/owner/combos
- src/constants/texts/combos.ts
- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/app/owner/combos
- src/app/api/combos
- src/hooks/useCombos.ts
- src/types/combos.ts
- src/constants/texts/combos.ts

## Owner Staff

### Business

- docs/mvp-features.md
- docs/data-model.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/staff/route.ts
- src/app/api/staff/[id]/route.ts
- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md
- skills/skill-unit-test-conventions.md

### UI

- src/app/owner/staff
- src/constants/texts/staff.ts
- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/app/owner/staff
- src/app/api/staff
- src/hooks/useStaff.ts
- src/types/staff.ts
- src/constants/texts/staff.ts

## Owner Branches

### Business

- docs/mvp-features.md
- docs/data-model.md

### Database

- docs/data-model.md
- prisma/schema.prisma
- prisma/migrations/20260601000000_init/migration.sql

### API

- src/app/api/branches/route.ts
- src/app/api/branches/[id]/route.ts
- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md
- skills/skill-unit-test-conventions.md

### UI

- src/app/owner/branches
- src/constants/texts/branches.ts
- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/app/owner/branches
- src/app/api/branches
- src/hooks/useBranches.ts
- src/types/branches.ts
- src/constants/texts/branches.ts

## Reports

### Business

- docs/mvp-features.md
- docs/data-model.md

### Database

- docs/data-model.md
- prisma/schema.prisma

### API

- src/constants/routes/apiRoutes.ts

### Workflow

- docs/onboarding.md
- skills/skill-data-fetching-conventions.md
- skills/skill-api-error-handling.md

### UI

- src/constants/routes/appRoutes.ts

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- None currently identified

## Trial, Billing & Plans

### Business

- docs/mvp-features.md
- docs/database.md
- docs/market-positioning.md

### Database

- docs/data-model.md
- prisma/schema.prisma

### API

- None currently identified

### Workflow

- docs/onboarding.md
- docs/git-flow.md

### UI

- None currently identified

### Skills

- skills/skill-naming-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- prisma/schema.prisma

## Shared Routes, Texts, Types & API Utilities

### Business

- AGENTS.md
- KB_INDEX.md
- CHANGELOG_AI.md
- docs/onboarding.md

### Database

- docs/data-model.md
- prisma/schema.prisma

### API

- src/constants/routes/apiRoutes.ts
- src/lib/apiConfig.ts
- src/lib/apiResponse.ts
- src/lib/fetchClient.ts
- src/lib/fetchServer.ts
- src/lib/queryClient.ts

### Workflow

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md
- skills/skill-unit-test-conventions.md

### UI

- src/constants/routes/appRoutes.ts
- src/constants/texts/common.ts
- src/app/providers.tsx

### Skills

- skills/skill-api-error-handling.md
- skills/skill-data-fetching-conventions.md
- skills/skill-routes-conventions.md
- skills/skill-text-conventions.md
- skills/skill-types-conventions.md

### Source Code

- src/constants/routes
- src/constants/texts
- src/hooks
- src/lib
- src/types

# Recommended Context Loading

For common tasks:

- Add new feature
  - Load first: AGENTS.md, KB_INDEX.md, docs/mvp-features.md, docs/market-positioning.md, docs/data-model.md, docs/tech-stack.md, docs/ui/screen-map.md, docs/ui/navigation.md, docs/ui/component-spec.md, docs/ui/design-tokens.md, docs/ui/component-rules.md, docs/ui/ui-guideline.md, docs/ui/auth-screens.md

- Then load the target module section from this file, plus relevant skills: skills/skill-naming-conventions.md, skills/skill-routes-conventions.md, skills/skill-text-conventions.md, skills/skill-types-conventions.md, skills/skill-data-fetching-conventions.md, skills/skill-api-error-handling.md
- After completion: update CHANGELOG_AI.md

- Fix bug
  - Load first: AGENTS.md, KB_INDEX.md, docs/mvp-features.md, docs/data-model.md, skills/skill-unit-test-conventions.md
  - Then load the broken source folder, its adjacent tests, and any matching hook/API/text/type files listed in the target module section.
  - After completion: update CHANGELOG_AI.md

- Refactor
  - Load first: AGENTS.md, KB_INDEX.md, docs/mvp-features.md, skills/skill-naming-conventions.md, skills/skill-types-conventions.md, skills/skill-routes-conventions.md, skills/skill-text-conventions.md
  - Then load the affected module source folders and shared utilities only when the refactor touches shared behavior.
  - After completion: update CHANGELOG_AI.md

- Database change
  - Load first: AGENTS.md, KB_INDEX.md, docs/data-model.md, docs/database.md, prisma/schema.prisma, skills/skill-setup-conventions.md
  - Then load the affected API routes, hooks, types, and migration files for the target module.
  - After completion: update CHANGELOG_AI.md

- API change
  - Load first: AGENTS.md, KB_INDEX.md, docs/mvp-features.md, docs/data-model.md, skills/skill-api-error-handling.md, skills/skill-data-fetching-conventions.md, skills/skill-routes-conventions.md
  - Then load the target API route, corresponding hook, route constants, types, text constants, and adjacent tests if tests are requested.
  - After completion: update CHANGELOG_AI.md
