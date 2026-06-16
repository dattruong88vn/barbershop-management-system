# ADR-0001: Tenancy Model

## Status

Accepted

## Context

The product serves many independent barber shops and small chains. Each shop owns its operational data, but the MVP needs simple onboarding and low operational cost.

## Decision

Use shared database, shared schema multi-tenancy. Tenant-owned records include `shop_id`, and application logic enforces current shop scope for tenant-owned reads, creates, updates, and deletes.

## Consequences

- Every tenant-owned table needs `shop_id`.
- API/server logic must enforce shop scope before data access.
- Client-provided `shop_id` must not override session-derived shop context.
- Cross-tenant access is only allowed for explicitly superadmin-only flows.
