# CONTEXT.md

Project overview for Codex. This file should stay short; detailed rules live in skills and `docs/dev/`.

## Product

Barber Shop SaaS helps Vietnamese men barbershops manage customers, visits, services, combos, staff, haircut photos, and reports.

Primary operating model:

- Staff roles (`receptionist`, `barber`, `skinner`) work on mobile/tablet.
- Owner/manager workflows are desktop-oriented.
- Every shop is a tenant and tenant-owned data is scoped by `shop_id`.

## Current Context Map

- Developer handbook: `docs/dev/README.md`
- Design system: `docs/ui/design-system.md`
- Screen specs: `docs/SCREENS.md`
- Navigation: `docs/ui/navigation.md`
- Data model: `docs/data-model.md`
- Git flow: `docs/dev/git-flow.md`
- Visit module: `docs/dev/modules/visits.md`
- Reports module: `docs/dev/modules/reports.md`
- ADRs: `docs/dev/decisions/`
- Codex skills: `.codex/skills/`

## UI Summary

- Mobile first for staff workflows.
- Desktop first for owner/manager management workflows.
- Staff roles show the global mobile-only fallback on desktop (`1024px+`).
- Search `src/components/global/` before creating UI.
- Use global primitives for buttons, inputs, cards, tables, alerts, skeletons, empty states, feedback, and title/value rows.
- UI text belongs in `src/constants/texts/`.
- Navigation uses `ROUTES`; API calls use `API_ROUTES`.
- Every screen needs loading, empty, and error states.
- Runtime success feedback uses the global Feedback notification flow.

Detailed UI rules:

- `docs/ui/design-system.md`
- `docs/SCREENS.md`
- `docs/ui/navigation.md`
- `.codex/skills/barbershop-ui/`

## API And Data Summary

- API routes live under `src/app/api/` and return JSON.
- Prisma is the only DB access layer. No raw SQL.
- Client components/hooks use `fetchClient`.
- Server components use `fetchServer`.
- JSON requests use `DEFAULT_JSON_HEADERS`.
- Optional response data guards use `hasResponseData`.
- Tenant-owned data must enforce current shop scope.

Detailed API/DB rules:

- `docs/dev/api-conventions.md`
- `docs/dev/data-fetching.md`
- `docs/dev/prisma-and-db.md`
- `docs/dev/tenancy.md`
- `.codex/skills/barbershop-api/`
- `.codex/skills/barbershop-db/`

## Business-Critical Rules

- Visits use services or combos, never both.
- Visit pricing is snapshotted into `visit_services`.
- Combo revenue allocation must preserve integer VND totals and assign final rounding difference to the last line.
- Reports use snapshot fields and `allocatedPrice`, never current catalog prices.
- Missing barber/skinner allocation is reported under `Chưa xác định`.
- Only `barber` can upload haircut photos.

Detailed module rules:

- `docs/dev/modules/visits.md`
- `docs/dev/modules/reports.md`
- `.codex/skills/barbershop-visits/`
- `.codex/skills/barbershop-reports/`

## Setup Summary

- Node v22+.
- npm only.
- Prisma v6.
- Supabase `DATABASE_URL`: Transaction pooler, port `6543`.
- Supabase `DIRECT_URL`: Session pooler, port `5432`.
- Do not use Supabase Direct connection string with Prisma.

Detailed setup:

- `docs/dev/setup.md`
