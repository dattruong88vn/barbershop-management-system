---
name: barbershop-git
description: Use when creating branches, committing, pushing, opening pull requests, or applying the Barber Shop SaaS git workflow.
---

# Barbershop Git

## Read First

- `docs/dev/git-flow.md`.

## Branches

- Branch names use `feature/name`, `fix/description`, or `chore/description`.
- Before a new branch: checkout `develop`, then pull `origin develop`.
- Never commit directly to `main` or `staging`.

## Commits

- Commit format: `type: short description`.
- Types: `feat`, `fix`, `chore`, `refactor`, `style`, `test`.
- If asked to commit only, commit and stop.
- If asked to push, commit, push, and create a PR into `develop`.

## Checks

- When asked to commit, run ESLint plus targeted Vitest for new or updated test files only.
- Run the full suite only when explicitly requested.
- If feature code changed but tests were not updated, remind the user before committing.
