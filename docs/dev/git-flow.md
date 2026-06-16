# Git Flow

## Environments

| Environment | Branch | Hosting | Database | Purpose |
| --- | --- | --- | --- | --- |
| Local | `develop`, `feature/*`, `fix/*`, `chore/*` | Local machine | Local PostgreSQL or Supabase local | Development |
| Staging | `staging` | Vercel | Supabase free tier | Pre-release testing |
| Production | `main` | Vercel | Supabase Pro | Real users and data |

## Branches

- `main`: production.
- `staging`: pre-release testing.
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
develop -> feature/* / fix/* / chore/* -> develop -> staging -> main
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

- Never commit directly to `main` or `staging`.
- If asked to commit only, commit and stop.
- If asked to push, commit, push, and create a PR into `develop`.
