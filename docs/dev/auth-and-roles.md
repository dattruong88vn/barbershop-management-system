# Auth And Roles

## Auth

- Username/password only.
- Do not add email login.
- Do not add social login.
- NextAuth.js uses Credentials Provider.
- Staff accounts are created by owner/manager flows.
- Staff must change password after first login when required by account state.
- Staff account display status is derived from account fields: `Khởi tạo` means `status = active` and `isFirstLogin = true`; `Đang làm` means `status = active` and `isFirstLogin = false`; `branch_suspended` means access is paused because the assigned/managed branch is inactive; inactive staff are former staff and remain in history.
- Users with `branch_suspended` can authenticate, but middleware redirects them to the branch unavailable screen and operational APIs must not allow branch-scoped mutations.

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
- Owner can create `manager` accounts and assign them to one or more active branches through `branches.manager_id`.
- Owner staff creation can only create `manager`, `receptionist`, `barber`, and `skinner`; owner/superadmin accounts are not created from the staff management screen.
- For manager accounts, branch permissions come from the selected active branches assigned to `branches.manager_id`. Do not use `users.branch_id` to decide which branches a manager manages.
- For regular staff accounts, working branch comes from `users.branch_id`.
- Each branch can have at most one manager, while one manager can manage many branches.
- Manager must operate inside an active branch context selected at `/manager/select-branch`; staff create/update requests must be scoped to that active branch.
- Shared management screens should use `mode="owner" | "manager"` when owner and manager routes share UI behavior.

## Manager Branch Context

- If a manager has exactly one active branch, the session may auto-select it.
- If a manager has multiple active branches, middleware requires selecting one before entering routes with sidebar.
- The selected branch is persisted in the session as `active_branch_id` and mirrored to `branch_id` for existing branch-scoped code paths.
- Manager service, combo, staff, visit, and report APIs must verify that the selected branch is active and assigned to the manager.
- The sidebar shows `Đổi chi nhánh` only when the manager has more than one active branch.

## Layout By Role

- `owner`, `manager`, `superadmin`: desktop-oriented management layout.
- `receptionist`, `barber`, `skinner`: mobile/tablet staff workflow.
- Staff roles see the global mobile-only fallback on desktop.
