---
name: barbershop-visits
description: Use when editing visit creation, visit updates, visit detail, service/combo selection, visit pricing snapshots, haircut photos, barber/skinner assignment, or visit-related APIs/components/hooks/types.
---

# Barbershop Visits

## Read First

- `CONTEXT.md`
- Relevant visit route, component, hook, type, or API file.

## References

- Read `references/visit-selection-rules.md` when editing service/combo selection.
- Read `references/visit-pricing-rules.md` when editing pricing, snapshots, combos, or report inputs.
- Read `references/visit-photo-rules.md` when editing haircut photo behavior or staff permissions.

## Workflow

1. Identify whether the change affects visit creation, update, detail, status, pricing, assignment, or photos.
2. Inspect related visit constants, texts, types, hooks, API routes, and module components.
3. Preserve service/combo mutual exclusion.
4. Preserve snapshot pricing and allocated revenue behavior.
5. Preserve role-based photo and assignment rules.
6. Summarize completed changes in the final response.

## Verification

- Do not run tests or ESLint unless the user asks.
- If pricing allocation changes, prefer focused unit coverage only when explicitly requested.
