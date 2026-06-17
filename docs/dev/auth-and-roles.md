# Auth And Roles

## Auth

- Username/password only.
- Do not add email login.
- Do not add social login.
- NextAuth.js uses Credentials Provider.
- Staff accounts are created by owner/manager flows.
- Staff must change password after first login when required by account state.
- Staff account display status is derived from account fields: `Khởi tạo` means `status = active` and `isFirstLogin = true`; `Đang làm` means `status = active` and `isFirstLogin = false`; inactive staff are former staff and remain in history.

## Roles

- `superadmin`
- `owner`
- `manager`
- `receptionist`
- `barber`
- `skinner`

Use exported role constants/types from `src/constants/common/roles.ts` for role checks, role arrays, role-keyed records, and role labels.

## Management Permissions

- `owner` and `manager` can manage services, combos, and staff accounts.
- Branch management is owner-only.
- Owner management routes use `/owner/*`; owner must not access `/manager/*`.
- Manager management routes use `/manager/*`; manager must not access `/owner/*`.
- Owner can manage staff across the whole shop.
- Manager can manage only staff in the manager's own `branch_id`; staff create/update requests must be scoped to that branch.
- Shared management screens should use `mode="owner" | "manager"` when owner and manager routes share UI behavior.

## Layout By Role

- `owner`, `manager`, `superadmin`: desktop-oriented management layout.
- `receptionist`, `barber`, `skinner`: mobile/tablet staff workflow.
- Staff roles see the global mobile-only fallback on desktop.
