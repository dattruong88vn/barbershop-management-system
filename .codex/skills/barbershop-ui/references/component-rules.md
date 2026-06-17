# Component Rules

## Placement

- `src/app/` contains route files only: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.
- App-wide reusable UI belongs in `src/components/global/`.
- Shared mobile navigation and mobile-specific shared UI belong in `src/components/mobile/`.
- Module components belong directly under `src/components/modules/<module>/`.
- Page-specific components belong under `src/components/screens/<module-or-route>/`.
- Do not create nested component subfolders inside a module folder.
- Every component folder with exports must include an `index.ts` barrel file.

## Composition

- Module and screen components must build on global primitives.
- Do not reimplement existing global primitives such as typography, buttons, inputs, comboboxes, calendars, skeletons, cards, alerts, empty states, or feedback notifications.
- Title/value display pairs must use a single-row layout with title on the left and value on the right; add or reuse a global component for this pattern.
- Split large components into focused children: sections, panels, lists, rows, and form fields.

## Page Files

- `page.tsx` files must keep route orchestration plus page-level view/semantics.
- Do not create a single-use page wrapper that only moves the whole page body out of `page.tsx`.
- Inside a page/component file, keep only one module-scope function: the page/component function that returns JSX.
- Move reusable or pure functions declared outside a component to `src/utils/`.
- Page-specific handlers and helpers may stay inside the component function.

## Styling

- Use shadcn/ui and global app primitives where possible.
- Do not hardcode colors or custom spacing; use design tokens only.
- Page headers must show the title only; do not render page description or subtitle text below the title.
- Select/dropdown controls must use the global `Select` primitive. Text left padding and icon right padding must be visually equal, and the right padding must still keep the icon from overlapping text.
- Tables must use the global table primitives with both horizontal row dividers and vertical cell dividers.
- Staff management display status is derived in UI: `Khởi tạo` = active staff with first-login password change still required; `Đang làm` = active staff that already completed first-login password change. Do not add a DB enum for `Khởi tạo`.
- Keep UI text fitting within its parent on mobile and desktop.
- Cards should use 8px radius or less unless an existing design-system rule says otherwise.
