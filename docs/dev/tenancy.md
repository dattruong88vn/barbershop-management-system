# Tenancy

## Model

Every shop is a tenant. The app uses shared database, shared schema, with tenant-owned records separated by `shop_id`.

## Rules

- Tenant-owned tables must include `shop_id`.
- Tenant-owned reads, creates, updates, and deletes must enforce current shop scope.
- Do not trust client-provided `shop_id` when session shop context is available.
- Avoid cross-tenant access unless explicitly superadmin-only.

## Plans

- Plans: `basic`, `pro`, `pro_max`.
- Default plan: `basic`.
- Statuses: `active`, `expired`.
- Trial tracking: `trial_expires_at`.

Shared plan/status values belong in `src/constants/common/` when used in app logic.
