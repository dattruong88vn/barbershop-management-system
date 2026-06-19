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
R2_PRIVATE_BUCKET_NAME="private-documents-bucket"
```

- `DATABASE_URL`: Supabase Transaction pooler, port `6543`.
- `DIRECT_URL`: Supabase Session pooler, port `5432`.
- Do not use Supabase Direct connection string with Prisma.
- `R2_PRIVATE_BUCKET_NAME` lưu tài liệu nhạy cảm như ảnh CCCD. Bucket này không được bật public access; upload và xem ảnh phải dùng signed URL có thời hạn ngắn.

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

## After DB Schema Changes

When `prisma/schema.prisma` or `prisma/migrations/` changes, update the database
before checking the app in the browser:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

If the dev server is already running and an API fails with a missing column error,
stop it, run the commands above, then start it again.

## Useful Docs

- Git flow: [git-flow.md](git-flow.md)
- Prisma and DB: [prisma-and-db.md](prisma-and-db.md)
- Shared location DB, migrate/sync, and FDW: [shared-location-db.md](shared-location-db.md)
- Testing: [testing.md](testing.md)
