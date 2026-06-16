---
name: barbershop-api
description: Use when editing Barber Shop SaaS API routes, server-side mutations, route handlers, auth checks, tenant checks, JSON response shapes, or API-related constants under src/app/api and supporting server utilities.
---

# Barbershop API

## Read First

- `CONTEXT.md`
- The relevant `src/app/api/` route file.

## References

- Read `references/api-rules.md` when editing route handlers or response behavior.
- Read `references/tenant-rules.md` when reading, creating, updating, or deleting tenant-owned data.

## Workflow

1. Locate the route handler under `src/app/api/`.
2. Inspect related constants, types, hooks, and utilities before editing.
3. Enforce auth, role, and tenant scope before data access.
4. Use Prisma only for database access.
5. Return JSON from every API route.
6. Keep response keys and finite values centralized.
7. Summarize completed changes in the final response.

## Verification

- Do not run tests or ESLint unless the user asks.
- If asked to commit after API changes, run ESLint and targeted Vitest for new or updated tests only.
