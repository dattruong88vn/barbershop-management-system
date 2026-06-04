# Barber Shop SaaS

A SaaS application for managing male barbershops in Vietnam.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js + Credentials Provider
- **File Storage**: Cloudflare R2
- **Deploy**: Vercel + Supabase

## Prerequisites

- Node.js latest (v22+) — do NOT use v20, seed will hang
- npm or yarn
- Supabase account

## Start Source Code Locally

Use this checklist when you already have the source code on your machine and want to run the app.

### 1. Create a working branch

Before coding, always start from the latest `develop` branch.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Use `feature/*` for new features, `fix/*` for bug fixes, and `chore/*` for docs, config, or maintenance work.

### 2. Install the correct Node.js version

Use Node.js latest, v22 or newer.

```bash
node -v
```

If the version is lower than v22, switch Node before installing dependencies.

### 3. Install dependencies

```bash
npm install
```

If dependency install looks incomplete or the dev server reports a missing native package, reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. Create local environment file

```bash
cp .env.example .env.local
```

Fill these required values in `.env.local`:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

For Supabase:

- `DATABASE_URL`: Transaction pooler, port `6543`
- `DIRECT_URL`: Session pooler, port `5432`

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Apply database migrations

```bash
npx prisma migrate deploy
```

### 7. Seed sample data, optional

```bash
npx prisma db seed
```

### 8. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port `3000` is busy, Next.js will print the alternate localhost URL in the terminal.

## Getting Started From A New Clone

### 1. Clone the repo

```bash
git clone repo-url
cd project
npm install
```

### 2. Create a working branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 3. Setup environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local` — see `.env.example` for reference.

### 4. Setup Supabase

- Create a new Supabase project
- Go to **Database → Settings → Connection string**
- Copy **Transaction pooler** (port 6543) → `DATABASE_URL`
- Copy **Session pooler** (port 5432) → `DIRECT_URL`

### 5. Run database migration

```bash
npx prisma migrate deploy
```

### 6. Seed sample data (optional)

```bash
npx prisma db seed
```

### 7. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### Missing `lightningcss.darwin-arm64.node`

This usually means dependencies were installed incompletely or on a different CPU/OS environment.

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Prisma seed hangs

Check Node.js version. This project requires Node.js v22+ because Node v20 can hang when running:

```bash
npx prisma db seed
```

## Common Commands

```bash
npm run dev              # Start dev server
npx prisma migrate dev   # Create new migration
npx prisma migrate deploy # Apply migrations
npx prisma db seed       # Seed sample data
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open Prisma GUI
```

## Project Structure

```
/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities, Prisma client, auth config
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Prisma migrations
├── docs/                 # Project documentation
├── skills/               # Project conventions for AI agents
└── public/
```

## Documentation

- [MVP Features](docs/mvp-features.md)
- [Data Model](docs/data-model.md)
- [Tech Stack](docs/tech-stack.md)
- [Git Flow](docs/git-flow.md)
- [Onboarding](docs/onboarding.md)
