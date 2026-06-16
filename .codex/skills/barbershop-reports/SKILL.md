---
name: barbershop-reports
description: Use when editing revenue reports, staff reports, branch/service/combo reports, personal reports, report APIs, report pages, allocated revenue, unknown assignee behavior, or report navigation.
---

# Barbershop Reports

## Read First

- `CONTEXT.md`
- Relevant report page, component, API route, type, and constants.

## References

- Read `references/revenue-allocation-rules.md` when editing revenue, combo allocation, or report totals.
- Read `references/staff-reporting-rules.md` when editing barber/skinner report attribution or unknown assignee behavior.

## Workflow

1. Identify the report kind and source data.
2. Inspect report constants, texts, types, pages, API routes, and module components.
3. Use snapshot fields and `allocatedPrice` for revenue.
4. Preserve unknown-assignee reporting.
5. Keep report routes and navigation constants centralized.
6. Summarize completed changes in the final response.

## Verification

- Do not run tests or ESLint unless the user asks.
- For allocation changes, manually reason through rounding and total preservation.
