# API Rules

## Route Handlers

- API routes live under `src/app/api/`.
- Route handlers must return JSON.
- API handler functions are named `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`.
- Use Prisma only for database access; do not use raw SQL.
- Use `DEFAULT_JSON_HEADERS` from `@/lib/apiConfig` for JSON requests.
- Use `hasResponseData` from `@/lib/apiResponse` for optional response data guards.

## Client And Server Calls

- Client components/hooks use `fetchClient` from `@/lib/fetchClient`.
- Server components use `fetchServer` from `@/lib/fetchServer`.
- Never use `fetch` directly in components or hooks.
- Use `API_ROUTES` for API calls; never hardcode API URLs.

## Error Handling

- `400`: show message.
- `401`: redirect to `/login`.
- `403`: redirect to `/dashboard`.
- `404`: redirect to `/not-found`.
- `500`: show error feedback.

## Hooks

- Each entity has one hook in `src/hooks/`.
- A hook exports one function combining query and mutations.
- Query key is a private constant in the hook module.
- Response data key is a private constant, for example `const VISIT_RESPONSE_DATA_KEY = "visit"`.
- When multiple mutations need optional response data, create one private `get[Entity]ResponseData()` helper.
