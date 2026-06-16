# Staff Reporting Rules

## Attribution

- Service revenue is attributed according to each service `responsibleRole`.
- Staff roles involved in allocation are `barber` and `skinner`.
- Role checks and labels must use exports from `src/constants/common/roles.ts`.

## Unknown Assignee

- If allocated revenue has no matching barber/skinner assignment on the visit, keep the line item details.
- Report that revenue under `Chưa xác định`.
- Reassignment can move the revenue once a matching staff assignment exists.

## Assignment Window

- Barber/skinner assignment is editable only within 3 hours after `completed_at`.
- Report logic must be robust to historical visits that still lack a matching assignment.
