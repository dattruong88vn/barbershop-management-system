# [AGENTS.md](http://AGENTS.md)

## Project Overview

This is a SaaS application for managing male barbershops in Vietnam. The target customers are small and independent barbershops or small chains within a city or town.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js + Credentials Provider
- **File Storage**: Cloudflare R2 (for haircut photos)
- **Deploy**: Vercel + Supabase

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
│   ├── mvp-features.md   # MVP features & roles
│   ├── data-model.md     # Database tables & fields
│   ├── tech-stack.md     # Tech stack decisions
│   ├── database.md       # Database strategy
│   ├── git-flow.md       # Git flow & environments
│   └── market-positioning.md # Target market
├── skills/               # Project conventions & known issues (read before coding)
│   └── skill-setup-conventions.md  # Setup conventions & known issues
└── public/
```

## Roles

The system has 6 roles:

- `superadmin` — full system access, can impersonate any shop owner
- `owner` — manages their own shop (services, combos, staff, branches)
- `manager` — manages assigned branch, views branch reports
- `receptionist` — looks up & saves customer info, uploads photos
- `barber` — looks up & saves customer info, uploads photos
- `skinner` — looks up & saves customer info, uploads photos

## Key Business Rules

- Each shop is a tenant, identified by `shop_id` in all tables
- Each shop has a `plan` field: `basic`, `pro`, `pro_max` (default: `basic`)
- Each shop has a `status` field: `active`, `expired` and `trial_expires_at`
- A visit has 3 statuses: `pending`, `in_progress`, `completed`
- Barber/skinner can be edited within 3 hours of `completed_at`, no extensions
- Warning is shown if a visit contains a haircut service (`is_haircut = true`) but has no photos
- Username/password auth only — no email or social login

## Instructions for Codex

- Always read `/skills` folder first before writing any code
- Always refer to `/docs/data-model.md` before writing any database-related code
- Always refer to `/docs/mvp-features.md` before implementing any feature
- Use Prisma for all database queries — never write raw SQL
- Use shadcn/ui components where possible — do not build UI components from scratch
- Keep API routes in `src/app/api/`
- All responses from API routes must be in JSON format
- Use TypeScript strictly — no `any` types
- Each feature should be developed on a separate `feature/` branch
