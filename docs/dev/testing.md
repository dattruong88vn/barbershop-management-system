# Testing

## Stack

- Vitest.
- React Testing Library.

## Rules

- Test files live next to the file under test.
- Do not write or update tests unless explicitly asked.
- Do not run tests or ESLint after implementation unless asked.
- Run full suite only when explicitly requested.

## Targeted Runs

```bash
npx vitest run src/hooks/useVisits.test.tsx
npx vitest run src/app/api/customers/route.test.ts
```

## Commit Checks

When asked to commit:

- Run ESLint.
- Run targeted Vitest for new or updated test files only.
- If feature code changed but tests were not updated, remind the user before committing.
