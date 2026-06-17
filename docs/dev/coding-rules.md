# Coding Rules

## Naming

- Pages/layouts: `kebab-case`.
- Components: `PascalCase`.
- Hooks: `camelCase` with `use` prefix.
- Utils/types/texts: `camelCase`.
- API handlers: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Internal variables: `_camelCase`.
- Booleans: `is/has/can` prefix.
- Constants: `UPPER_SNAKE_CASE`.

## Placement

- `src/app/` contains route files only.
- App-wide reusable UI goes in `src/components/global/`.
- Shared mobile UI goes in `src/components/mobile/`.
- Module UI goes in `src/components/modules/<module>/`.
- Page-specific UI goes in `src/components/screens/<module-or-route>/`.
- Shared types go in `src/types/`.
- Shared helpers go in `src/utils/`.

## Components

- Search `src/components/global/` before creating UI.
- Reuse global primitives instead of local button/input/card/table/alert variants.
- If the same JSX/style pattern appears in 2+ screens, extract or extend a shared component before duplicating it again. Example: use global `PageTitle` instead of repeating `<h1 className="text-2xl font-semibold">`.
- Page/component files should keep one module-scope JSX-returning function.
- Move reusable pure helpers to `src/utils/`.
- Split large components into focused sections, panels, lists, rows, and fields.

## Texts And Constants

- UI text belongs in `src/constants/texts/`.
- Shared finite values belong in `src/constants/common/`.
- Role checks and labels must use exports from `src/constants/common/roles.ts`.
- Navigation uses `ROUTES`; API calls use `API_ROUTES`.

## TypeScript

- Strict TypeScript.
- Do not use `any`.
- Do not define shared types inside components.
