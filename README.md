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

## Getting Started

### 1. Clone the repo

```bash
git clone repo-url
cd project
npm install
```

### 2. Setup environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local` — see `.env.example` for reference.

### 3. Setup Supabase

- Create a new Supabase project
- Go to **Database → Settings → Connection string**
- Copy **Transaction pooler** (port 6543) → `DATABASE_URL`
- Copy **Session pooler** (port 5432) → `DIRECT_URL`

### 4. Run database migration

```bash
npx prisma migrate deploy
```

### 5. Seed sample data (optional)

```bash
npx prisma db seed
```

### 6. Start development server

```bash
npm run dev
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
