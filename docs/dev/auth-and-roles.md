# Auth And Roles

## Auth

- Username/password only.
- Do not add email login.
- Do not add social login.
- NextAuth.js uses Credentials Provider.
- Staff accounts are created by owner/manager flows.
- Staff must change password after first login when required by account state.

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

## Layout By Role

- `owner`, `manager`, `superadmin`: desktop-oriented management layout.
- `receptionist`, `barber`, `skinner`: mobile/tablet staff workflow.
- Staff roles see the global mobile-only fallback on desktop.
