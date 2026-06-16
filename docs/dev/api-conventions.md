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

## Responses

- Keep response data keys consistent and typed.
- Use centralized text constants for user-facing errors.
- Use shared finite-value constants instead of scattered string literals.

## Client Access

- Client components/hooks call through `fetchClient`.
- Server components call through `fetchServer`.
- JSON requests use `DEFAULT_JSON_HEADERS`.
