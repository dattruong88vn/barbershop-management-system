# Visit Selection Rules

## Statuses

- Visit statuses are `pending`, `in_progress`, and `completed`.
- Known status values must come from constants, not scattered string literals.

## Services And Combos

- A visit uses service items or combo items, never both.
- Selecting a combo clears selected services.
- Selecting a service clears selected combos.
- UI and API validation must agree on this rule.

## Responsible Role

- Every service must declare `responsibleRole` as `barber` or `skinner`.
- Role labels and role checks must use constants from `src/constants/common/roles.ts`.
