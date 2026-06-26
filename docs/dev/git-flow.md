# Git Flow

## Environments

| Environment | Branch | Hosting | Database | Purpose |
| --- | --- | --- | --- | --- |
| Local | `develop`, `feature/*`, `fix/*`, `chore/*` | Local machine | Local PostgreSQL or Supabase local | Development |
| Demo | `develop` or `main` | Vercel | Dev Barbershop DB + Shared Data DB | Customer demos and internal testing |
| Production | `main` | Vercel | Production Barbershop DB + Shared Data DB | Real users and data |

Current early-stage setup may use only two Supabase projects:

- Dev Barbershop DB: app data for local/dev/demo usage.
- Shared Data DB: core reference data such as province and ward data.

Do not treat the Dev Barbershop DB as production. It can be used for demos only
while there is no real customer data. When a customer buys the product, create or
upgrade to a separate Production Barbershop DB before onboarding real users.

## Branches

- `main`: production.
- `develop`: main development branch.
- `feature/name`: feature work.
- `fix/description`: bug fixes.
- `chore/description`: docs, skills, config, maintenance.

## Naming

- Lowercase.
- Use hyphens instead of spaces.
- Keep names short and clear.
- Prefer English.

## Flow

```txt
develop -> feature/* / fix/* / chore/* -> develop -> main
```

Before creating a new branch:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/name
```

## Commits

Format:

```txt
type: short description
```

Types:

- `feat`
- `fix`
- `chore`
- `refactor`
- `style`
- `test`

## Rules

- Never commit directly to `main`.
- If asked to commit only, commit and stop.
- If asked to push, commit, push, and create a PR into `develop`.
