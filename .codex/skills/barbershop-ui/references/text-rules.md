# Text And Constants Rules

## UI Text

- Never hardcode user-facing UI text in components.
- Put module text in `src/constants/texts/<module>.ts`.
- Export text files through `src/constants/texts/index.ts`.
- Keep page/component files focused on structure and behavior, not copy storage.
- Filter/select options that mean "all values" must display exactly `Tất cả`; do not append the filtered noun such as role, branch, status, scope, or assignee.

## Constants

- Shared cross-module constants belong in `src/constants/common/`.
- Known finite values such as item types, statuses, roles, and modes must be constants/enums before use.
- Do not scatter raw string literals such as `"service"`, `"combo"`, `"barber"`, or `"owner"` through logic.
- Role checks, role arrays, role-keyed records, and role labels must use exports from `src/constants/common/roles.ts`.

## Feedback

- Every successful user action must show success feedback through the global Feedback notification flow.
- Do not render the global Toast component directly for runtime app notifications.
