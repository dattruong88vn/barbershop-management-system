# API Conventions

## Routes

- API routes live under `src/app/api/`.
- Route handlers must return JSON.
- Handler names are `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`.
- Use `API_ROUTES` for API calls.

## Database Access

- Use Prisma only.
- Do not use raw SQL.
- Enforce auth, role permissions, and tenant scope before data access.

## Location Reference Data

- `GET /api/locations/provinces` returns active provinces from `reference_data.provinces`.
- `GET /api/locations/wards?provinceCode=<code>` returns active wards for one active province.
- Location routes require an authenticated session but are not tenant-scoped because the dataset is shared reference data.
- Staff create/update validates active province codes and the ward-province relationship before persisting codes.
- An unavailable Shared Data DB or FDW returns a JSON `500` error; it does not fall back to legacy free-text inference.

## Responses

- Keep response data keys consistent and typed.
- Use centralized text constants for user-facing errors.
- Use shared finite-value constants instead of scattered string literals.

## Client Access

- Client components/hooks call through `fetchClient`.
- Server components call through `fetchServer`.
- JSON requests use `DEFAULT_JSON_HEADERS`.
