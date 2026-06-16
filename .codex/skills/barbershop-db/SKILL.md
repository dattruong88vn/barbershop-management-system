---
name: barbershop-db
description: Use when editing Prisma schema, migrations, database models, tenant-owned tables, enums, relations, seed data, or data-model documentation for the Barber Shop SaaS.
---

# Barbershop DB

## Read First

- `CONTEXT.md`
- `docs/data-model.md`
- `prisma/schema.prisma`

## References

- Read `references/prisma-rules.md` before editing Prisma models or database access patterns.
- Read `references/data-model-rules.md` when adding tenant-owned entities, finite values, or business-critical fields.

## Workflow

1. Identify the owning module and tenant boundary.
2. Inspect existing model naming, relations, indexes, and constants.
3. Add or change Prisma schema conservatively.
4. Keep finite values mirrored in `src/constants/common/` when used in app logic.
5. Update related types/docs when the data shape changes.
6. Summarize completed changes in the final response.

## Verification

- Do not run migrations, tests, or ESLint unless the user asks.
- If the user asks to commit DB changes, follow the repo git flow and run requested checks only.
