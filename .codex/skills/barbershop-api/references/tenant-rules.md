# Tenant Rules

## Scope

- Every shop is a tenant.
- Tenant-owned tables must include and enforce `shop_id`.
- Every tenant-owned read, create, update, and delete must be scoped to the current shop.
- Do not trust client-provided `shop_id` when session-derived shop context is available.

## Roles

- Roles are `superadmin`, `owner`, `manager`, `receptionist`, `barber`, and `skinner`.
- `owner` and `manager` can manage services, combos, and staff accounts.
- Branch management remains owner-only.
- Auth is username/password only. Do not add email or social login.

## Plans

- Plans are `basic`, `pro`, and `pro_max`; `basic` is the default.
- Statuses are `active` and `expired`.
- Trial is tracked by `trial_expires_at`.
