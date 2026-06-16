# Data Model Rules

## Tenancy

- Every shop is a tenant.
- Tenant-owned records must be scoped by `shop_id`.
- Avoid cross-tenant joins or lookups unless explicitly superadmin-only.

## Finite Values

- Plans: `basic`, `pro`, `pro_max`.
- Plan statuses: `active`, `expired`.
- Roles: `superadmin`, `owner`, `manager`, `receptionist`, `barber`, `skinner`.
- Visit statuses: `pending`, `in_progress`, `completed`.
- Shared finite values belong in `src/constants/common/`.

## Business-Critical Fields

- Every service must declare `responsibleRole` as `barber` or `skinner`.
- Visit service/combo pricing must be snapshotted into `visit_services` at visit create/update time.
- Reports must use snapshot fields and `allocatedPrice`, never current service/combo names or prices.
