# Prisma And DB

## Technology

- PostgreSQL.
- Prisma v6.
- Supabase pooler connection strings.

## Prisma Rules

- Use Prisma only; no raw SQL.
- Keep Prisma access server-side.
- Preserve existing model naming, relations, indexes, and tenant boundaries.
- Tenant-owned models need `shop_id`.

## Connection Strings

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- `DATABASE_URL`: Transaction pooler, port `6543`.
- `DIRECT_URL`: Session pooler, port `5432`.

## Commands

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx prisma studio
```

Do not upgrade Prisma without testing.

## Data Model

The full product data model remains in [../data-model.md](../data-model.md).
