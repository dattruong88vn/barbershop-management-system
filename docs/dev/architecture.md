# Architecture

## Stack

- Next.js 14+ App Router.
- Tailwind CSS.
- shadcn/ui plus app-level global components.
- PostgreSQL.
- Prisma v6.
- NextAuth.js Credentials Provider.
- Cloudflare R2.
- Vercel.
- Supabase.

## App Shape

```txt
src/
  app/                  # routes and API route handlers
  components/
    global/             # app-wide reusable UI
    mobile/             # shared mobile navigation/UI
    modules/            # module components
    screens/            # page-specific components
  constants/
    common/             # shared finite values and constants
    routes/             # ROUTES and API_ROUTES
    texts/              # UI text
  hooks/                # TanStack Query hooks
  lib/                  # fetch, API, auth, Prisma utilities
  types/                # shared TypeScript types
  utils/                # reusable helpers
```

## Runtime Boundaries

- Route files stay in `src/app/`.
- API routes live under `src/app/api/` and return JSON.
- Client components/hooks call APIs through `fetchClient`.
- Server components call APIs through `fetchServer`.
- Prisma access stays server-side.

## Product Boundaries

- Every shop is a tenant.
- Staff mobile workflows are separate from owner/manager desktop workflows.
- Reports use visit snapshot data, not current service/combo records.
