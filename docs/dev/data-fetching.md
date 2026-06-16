# Data Fetching

## Rules

- Never use `fetch` directly in components or hooks.
- Client components/hooks use `fetchClient` from `@/lib/fetchClient`.
- Server components use `fetchServer` from `@/lib/fetchServer`.
- JSON requests use `DEFAULT_JSON_HEADERS` from `@/lib/apiConfig`.
- Optional response data guards use `hasResponseData` from `@/lib/apiResponse`.

## Hooks

- Each entity has one hook in `src/hooks/`.
- Hook exports one function combining query and mutations.
- Query key is a private constant inside the hook module.
- Response data key is a private constant, for example `const VISIT_RESPONSE_DATA_KEY = "visit"`.
- If multiple mutations need optional response data, create one private `get[Entity]ResponseData()` helper.

## Error Handling

- `400`: show message.
- `401`: redirect `/login`.
- `403`: redirect `/dashboard`.
- `404`: redirect `/not-found`.
- `500`: show error feedback.

## Query Behavior

TanStack Query should not refetch on browser/window focus by default. Data should fetch when entering a page, reloading the browser, changing a query key, or after explicit invalidate/refetch following a mutation.
