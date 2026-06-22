# Branches Module

## Scope

Owner branch management, manager branch selection, branch-scoped API access, branch inactive/reactivate flow, staff transfer, and branch snapshots used by visits/reports.

## Main Files

- `src/app/owner/branches/`
- `src/app/manager/select-branch/page.tsx`
- `src/app/branch-unavailable/page.tsx`
- `src/app/api/branches/`
- `src/app/api/managers/`
- `src/app/api/staff/transfer/`
- `src/components/screens/branch-management/`
- `src/hooks/useBranches.ts`
- `src/types/branches.ts`
- `src/constants/common/branchStatuses.ts`
- `src/constants/texts/branches.ts`

## Business Rules

- Branch management is owner-only.
- Branch names do not need to be unique because address differentiates shops/locations.
- Branch list supports search by name/address and status filter: all, active, inactive.
- A branch can have at most one manager.
- One manager can manage multiple branches.
- Staff users (`receptionist`, `barber`, `skinner`) belong to one working branch through `users.branch_id`.
- Manager assignment is represented by `branches.manager_id`, not by `users.branch_id`.
- Branches are never hard deleted.

## Owner Creates Manager Accounts

- Owner creates manager accounts from the staff management create/edit form.
- The owner staff form may create roles `manager`, `receptionist`, `barber`, and `skinner`; it must not create `owner` or `superadmin`.
- When role is `manager`, the form shows a searchable multi-select/dropdown of active branches managed by that manager.
- When role is `manager`, do not require the regular staff working branch field.
- Saving a manager updates selected branches to point `manager_id` at that user.
- If a selected branch already has another manager, assigning the new manager replaces the old manager for that branch.
- When changing a manager into a regular staff role, remove old branch manager assignments and require one working branch through `users.branch_id`.
- When changing a regular staff user into a manager, stop using `users.branch_id` for manager permissions and require at least one active managed branch when the business flow requires immediate access.

## Create, Detail, Edit

- Create branch uses a dedicated route, not a popup.
- Detail and edit share the same information layout: name, address, manager, and staff list.
- Branch manager and staff names shown in tables, dropdowns, and read-only fields must prefer the staff full name, with username only as fallback for legacy records.
- Clicking the branch name in the table opens detail.
- Inactive branches are view-only; owner must reactivate before editing branch information.
- Manager dropdown/search only shows active manager accounts in the same shop and supports an unassigned state.

## Inactive And Reactivate

- Owner can deactivate a branch only when it has no `pending` or `in_progress` visits.
- Deactivate/reactivate actions must show the global `FullScreenLoading` until the status API finishes.
- Deactivation sets branch status to `inactive`, records `deactivated_at` and `deactivated_by`, and moves related staff/manager users to `branch_suspended`.
- After deactivation, operational actions for that branch are locked.
- Non-owner users in `branch_suspended` can authenticate, but middleware redirects them to `/branch-unavailable`. Owner must not be redirected because owner needs access to reactivate branches or reassign staff.
- Reactivating a branch sets status back to `active` and clears deactivation audit fields.
- Reactivation does not automatically restore staff to active; owner must transfer/assign staff again.

## Staff Transfer

- Owner can select staff in branch detail and transfer them in bulk to another active branch.
- Transfer is optional; inactive branch staff may remain suspended until owner decides.
- Staff can transfer only when they have no `pending` or `in_progress` visits as assigned barber/skinner.
- Transfer updates `users.branch_id` and restores transferred users to `active`.
- Historical visits and reports remain unchanged because visits keep branch relation and branch snapshot fields.

## Manager Branch Selection

- Managers with multiple active branches must choose a branch before entering the management workspace.
- Managers with exactly one active branch may be auto-selected.
- Auto-selection for exactly one active branch must render `FullScreenLoading` and redirect without flashing the selection cards.
- The selection screen has no sidebar.
- Sidebar shows `Đổi chi nhánh` only when the manager has more than one active branch.
- Selected branch is stored in session as `active_branch_id` and used as the scope for staff, service, combo, visit, and report APIs.
- API routes must verify the selected branch is active and assigned to the current manager.

## API Notes

- `GET /api/branches` supports owner branch list and manager active managed branch list.
- `POST /api/branches` is owner-only.
- `GET /api/branches/:id` is owner-only or assigned manager.
- `PATCH /api/branches/:id` is owner-only and blocked for inactive branches.
- `PATCH /api/branches/:id/status` is owner-only for activate/deactivate.
- `DELETE /api/branches/:id` is not supported; return a no-delete response instead of hard delete.
- `GET /api/managers` is owner-only and returns active managers in the owner shop.
- `PATCH /api/staff/transfer` is owner-only and validates target branch, staff shop, staff roles, and open visits.
