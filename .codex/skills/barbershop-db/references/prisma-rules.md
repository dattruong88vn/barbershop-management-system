# Prisma Rules

## Access

- Use Prisma only for database access.
- Do not use raw SQL.
- Keep DB logic scoped to API/server utilities; do not access Prisma from client components.

## Schema

- Preserve existing naming style and relation patterns.
- Tenant-owned models must include `shop_id` and enforce shop scoping in API/server logic.
- Add indexes for fields used in common tenant-scoped lookups when consistent with nearby models.
- Use Prisma-generated DB types where possible.

## Types

- Add custom types only for API responses, session payloads, and shapes Prisma does not cover.
- Shared types belong in `src/types/<module>.ts`.
- Export types through `src/types/index.ts`.
