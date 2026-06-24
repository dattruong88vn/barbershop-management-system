# AGENTS.md

Runtime rules for Codex/AI agents in this repo. Keep this file short and mandatory; use the linked docs and skills for detailed context.

## Project

Barber Shop SaaS for men barbershops in Vietnam. Target users are independent shops and small chains.

Stack: Next.js 14+ App Router, Tailwind CSS, shadcn/ui, PostgreSQL, Prisma v6, NextAuth.js, Cloudflare R2, Vercel, Supabase.

## Read Order

Choose context by task:

- Default: this file only.
- UI task: `CONTEXT.md`, `docs/SCREENS.md`, `docs/ui/design-system.md`, and relevant `.codex/skills/barbershop-ui/`.
- API task: `CONTEXT.md`, relevant `src/app/api/` route, and `.codex/skills/barbershop-api/`.
- DB task: `CONTEXT.md`, `docs/data-model.md`, `prisma/schema.prisma`, and `.codex/skills/barbershop-db/`.
- Visit task: `docs/dev/modules/visits.md` and `.codex/skills/barbershop-visits/`.
- Report task: `docs/dev/modules/reports.md` and `.codex/skills/barbershop-reports/`.
- Git task: `docs/dev/git-flow.md` and `.codex/skills/barbershop-git/`.
- Setup/config task: `docs/dev/setup.md`.
- Bug fix: read the broken file and adjacent test file if present.

Developer handbook entry point: `docs/dev/README.md`.

## Prompt Commands

Yêu cầu của user phải bắt đầu bằng keyword command tiếng Anh. Keyword không phân biệt chữ hoa/thường. Phần mô tả sau keyword nên viết bằng tiếng Việt hoặc tiếng Anh đều được.

Nếu yêu cầu không có keyword command, dừng lại và yêu cầu user gửi lại với keyword trước khi đọc thêm file, sửa code, chạy test, commit hoặc push.

Định dạng command:

`<MODE> [AREA]: <mô tả yêu cầu bằng tiếng Việt hoặc tiếng Anh>`

Modes:

- `ASK`: chỉ trả lời hoặc giải thích; không sửa file.
- `PLAN`: đọc context liên quan và đề xuất kế hoạch; không sửa file.
- `FIX`: đọc context liên quan và thực hiện thay đổi.
- `REVIEW`: review bug, rủi ro, regression và test còn thiếu; không sửa file trừ khi được yêu cầu.
- `TEST`: chỉ chạy các test được yêu cầu.
- `COMMIT`: kiểm tra diff, chạy các bước kiểm tra bắt buộc theo Git rules, commit rồi dừng.
- `PUSH`: commit nếu cần, push branch và tạo PR vào `develop`.

Areas:

- `UI`: làm theo read order của UI.
- `API`: làm theo read order của API.
- `DB`: làm theo read order của DB.
- `VISIT`: làm theo read order của Visit.
- `REPORT`: làm theo read order của Report.
- `GIT`: làm theo read order của Git.

Ví dụ:

- `ASK DB: giải thích vì sao visit_services cần snapshot price.`
- `FIX VISIT: lỗi tạo visit bằng combo vẫn chọn được service.`
- `REVIEW API: kiểm tra src/app/api/reports có vi phạm tenant/shop_id không.`
- `fix docs: cho phép nhập keyword bằng chữ thường.`

## Mandatory Business Rules

- Every shop is a tenant. Tenant-owned tables must include and enforce `shop_id`.
- Auth is username/password only. Do not add email or social login.
- Roles: `superadmin`, `owner`, `manager`, `receptionist`, `barber`, `skinner`.
- `owner` and `manager` can manage services, combos, and staff accounts. Branch management is owner-only.
- Visit statuses: `pending`, `in_progress`, `completed`.
- A visit uses service items or combo items, never both.
- Every service must declare `responsibleRole` as `barber` or `skinner`.
- Visit service/combo pricing must be snapshotted into `visit_services`.
- Reports must use snapshot fields and `allocatedPrice`, never current service/combo names or prices.
- Delete actions are soft delete by default; do not hard delete business data that can affect visits, combos, reports, or audits.
- Missing barber/skinner allocation is reported under `Chưa xác định`.
- Barber/skinner assignment is editable only within 3 hours after `completed_at`.
- Show warning when `is_haircut = true` and no photos.
- Only `barber` can upload haircut photos. Other roles view only.

Key ADRs:

- `docs/dev/decisions/ADR-0001-tenancy-model.md`
- `docs/dev/decisions/ADR-0002-visit-pricing-snapshot.md`
- `docs/dev/decisions/ADR-0003-feedback-notification-flow.md`
- `docs/dev/decisions/ADR-0004-staff-mobile-workflow.md`

## Mandatory Coding Rules

- Prisma only for DB access. No raw SQL.
- API routes live under `src/app/api/` and must return JSON.
- Never use `fetch` directly in components or hooks.
- Client components/hooks use `fetchClient` from `@/lib/fetchClient`.
- Server components use `fetchServer` from `@/lib/fetchServer`.
- Use `DEFAULT_JSON_HEADERS` for JSON requests.
- Use `hasResponseData` for optional response data guards.
- Use `ROUTES` for navigation and `API_ROUTES` for API calls.
- Never use `window.location`, `window.location.href`, or `window.location.assign`.
- UI text belongs in `src/constants/texts/`.
- Shared finite values belong in `src/constants/common/`.
- Role checks, role arrays, role-keyed records, and role labels must use `src/constants/common/roles.ts`.
- Shared types belong in `src/types/`.
- Shared helpers belong in `src/utils/`.
- Strict TypeScript. No `any`.
- Do not hardcode colors or custom spacing; use design tokens.
- Keep changes scoped to the requested module.

## UI Rules

- Before writing or styling UI, search `src/components/global/`.
- Reuse global components when a pattern exists.
- If a reusable pattern is missing, add or extend a global component first.
- If the same JSX/style pattern appears in 2+ screens, extract or extend a shared component before duplicating it again. Example: use global `PageTitle` instead of repeating `<h1 className="text-2xl font-semibold">`.
- Do not use native/browser controls or hand-rolled visuals when a global component exists.
- Every successful user action must show success feedback through the global Feedback notification flow.
- Do not render the global Toast component directly for runtime app notifications.
- Every screen needs loading, empty, and error states using global primitives where possible.
- Page headers show the page title only. Do not render page description/subtitle text.
- Dropdown/select controls must use the global `Select` primitive; text left padding and icon right padding must be visually equal, with enough right padding so the icon never overlaps text.
- Tables must show both horizontal row dividers and vertical cell dividers when using the global table primitives.

Component placement:

- `src/app/`: route files only.
- `src/components/global/`: app-wide reusable UI.
- `src/components/mobile/`: shared mobile UI.
- `src/components/modules/<module>/`: module UI.
- `src/components/screens/<module-or-route>/`: page-specific UI.
- Route pages keep route orchestration plus page-level semantics.
- Do not create single-use page wrappers that only move an entire page body out of `page.tsx`.
- Page/component files should keep only one module-scope JSX-returning function. `/design-system` is exempt.
- Every component/util folder with exports needs an `index.ts` barrel file.

## Testing

- Stack: Vitest + React Testing Library.
- Test files live next to the file under test.
- Do not write or update tests unless explicitly asked.
- Do not run unit tests or ESLint after implementation unless asked.
- Smoke tests are mandatory after `FIX` changes that match `docs/dev/smoke-runbook.md#smoke-test-triggers`, unless user explicitly says not to run tests.
- When asked to commit: run ESLint and targeted Vitest for new/updated test files only.
- Run full suite only when explicitly requested.
- If feature code changed but tests were not updated, remind the user before committing.

## Git

- Branches: `feature/name`, `fix/description`, `chore/description`.
- Before a new branch: checkout `develop`, then pull `origin develop`.
- Never commit directly to `main` or `staging`.
- Commit format: `type: short description`.
- If asked to commit only, commit and stop.
- If asked to push, commit, push, and create a PR into `develop`.

## Workflow

- Use npm. No global installs.
- Node v22+. Prisma v6. Do not upgrade without testing.
