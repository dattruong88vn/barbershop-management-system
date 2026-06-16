# Reports Module

## Scope

Revenue reports, personal staff reports, branch/service/combo reports, report pages, report APIs, report navigation, and allocated revenue grouping.

## Main Files

- `src/app/reports/page.tsx`
- `src/app/reports/revenue/page.tsx`
- `src/app/reports/staff/page.tsx`
- `src/app/reports/services/page.tsx`
- `src/app/reports/combos/page.tsx`
- `src/app/reports/branches/page.tsx`
- `src/app/api/reports/`
- `src/components/modules/reports/`
- `src/types/reports.ts`
- `src/constants/texts/reports.ts`
- `src/constants/common/reportKinds.ts`

## Business Rules

- Reports use snapshot fields and `allocatedPrice`.
- Reports must not use current service/combo names or prices for historical revenue.
- Combo allocated line totals must equal combo price.
- Staff revenue attribution follows each service `responsibleRole`.
- Staff allocation roles are `barber` and `skinner`.
- Missing matching staff assignment is reported under `Chưa xác định`.
- Keep raw line details available when grouping by staff, service, combo, or branch.

## Report Kinds

- Revenue report.
- Staff report.
- Services report.
- Combos report.
- Branch report for owner-only branch scope.
- Personal report for staff roles.

## Personal Reports

- Staff personal report uses current user scope.
- Barber/skinner attribution follows matching visit assignment.
- Receptionist attribution follows visits created by the user.
- Staff roles see personal reports in mobile/tablet workflow and desktop fallback at `1024px+`.

## Implementation Notes

- Keep route and API constants centralized.
- Use role constants from `src/constants/common/roles.ts`.
- Use report kind constants from `src/constants/common/reportKinds.ts`.
- Use global loading, empty, and error states.
- For allocation changes, manually reason through rounding and total preservation.
