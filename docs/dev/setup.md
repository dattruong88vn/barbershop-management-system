# Setup

## Requirements

- Node.js v22+.
- npm only.
- Prisma v6.
- Supabase account.
- Cloudflare account for R2 storage.

## First Setup

```bash
git clone repo-url
cd project
npm install
cp .env.example .env.local
npx prisma migrate deploy
npm run dev
```

Open the localhost URL printed by Next.js.

## Environment

`.env.local` needs at least:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

- `DATABASE_URL`: Supabase Transaction pooler, port `6543`.
- `DIRECT_URL`: Supabase Session pooler, port `5432`.
- Do not use Supabase Direct connection string with Prisma.

## Daily Start

```bash
git checkout develop
git pull origin develop
git checkout -b feature/name
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Use `feature/*`, `fix/*`, or `chore/*` depending on the work.

## Useful Docs

- Git flow: [git-flow.md](git-flow.md)
- Prisma and DB: [prisma-and-db.md](prisma-and-db.md)
- Testing: [testing.md](testing.md)
