# Visits Module

## Scope

Visit creation, visit list/detail, status changes, service/combo selection, barber/skinner assignment, pricing snapshots, and haircut photos.

## Main Files

- `src/app/visits/page.tsx`
- `src/app/visits/create/page.tsx`
- `src/app/visits/[id]/page.tsx`
- `src/app/api/visits/`
- `src/components/modules/visits/`
- `src/hooks/useVisits.ts`
- `src/types/visits.ts`
- `src/constants/texts/visits.ts`

## Business Rules

- Visit statuses are `pending`, `in_progress`, and `completed`.
- A visit uses service items or combo items, never both.
- Selecting a combo clears selected services.
- Selecting a service clears selected combos.
- UI validation and API validation must enforce the same selection rules.
- Every service must declare `responsibleRole` as `barber` or `skinner`.
- Visit service/combo pricing must be snapshotted into `visit_services` at create/update time.
- Barber/skinner assignment is editable only within 3 hours after `completed_at`.

## Pricing Snapshot

- Reports use snapshot fields and `allocatedPrice`.
- Reports must not use current service/combo names or prices for historical revenue.
- Combo allocation uses `combo.price / sum(service.price)` across combo services.
- Round VND per line and assign the final rounding difference to the last line.
- Allocated totals must always match the combo price.

## Photos

- Show warning when `is_haircut = true` and no photos exist.
- Warning text: `Chưa upload ảnh kiểu tóc`.
- Only `barber` can upload haircut photos.
- Other roles view photos only.
- Preserve tenant and visit ownership checks for upload, delete, and listing behavior.

## Implementation Notes

- Use `ROUTES` for navigation and `API_ROUTES` for API calls.
- Use constants from `src/constants/common/` for statuses, roles, item types, and origins.
- Use global Feedback notification flow for successful actions.
- Keep page files as route orchestration and page-level semantics.
