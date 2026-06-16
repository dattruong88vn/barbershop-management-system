# ADR-0002: Visit Pricing Snapshot

## Status

Accepted

## Context

Service and combo names, roles, and prices can change after a visit is completed. Reports need historical accuracy and must not drift when current catalog data changes.

## Decision

Snapshot visit service/combo names, prices, responsible roles, and allocated revenue into `visit_services` at visit create/update time. Reports use snapshot fields and `allocatedPrice`, never current service/combo names or prices.

## Consequences

- Visit create/update flows must build snapshot lines.
- Combo visits are expanded into service-level lines for reporting.
- Combo allocation uses `combo.price / sum(service.price)`, rounded per VND line, with final rounding difference assigned to the last line.
- Report totals remain stable after catalog edits.
