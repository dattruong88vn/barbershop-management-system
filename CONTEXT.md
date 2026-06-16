# CONTEXT.md

Mention file này khi task liên quan đến UI, API pattern, hoặc setup môi trường.

---

## UI Rules

**Principles:** Mobile first. Speed first (tìm khách <3s, tạo visit <10s, upload ảnh <5s). Không tự tạo style riêng.
Luôn bắt buộc tìm trong `src/components/global/` trước khi viết component hoặc style mới. Reuse global component nếu đã có; nếu pattern có thể dùng lại, thêm hoặc mở rộng global component trước. Không dùng native/browser controls hoặc tự dựng visual khi global component đã tồn tại.

**Layout:**

- Mobile: Header + Content + Sticky Action Area. Padding 16px. Dùng card, không dùng table.
- Desktop: Sidebar (220px) + Page Header + Content. Padding 24px.
- Bottom nav mobile: 56px. Top nav tablet: 52px.
- Breakpoints: mobile 0–767px · tablet 768–1023px · desktop 1024px+.
- Min touch target 44px. Min font size 14px. All interactive elements keyboard accessible.
- Text inputs, textareas, selects, and combobox triggers must use 16px text (`text-base`) to avoid mobile browser zoom on focus.

**Role-based layout:**

- `owner` · `manager` · `superadmin` → desktop sidebar. Show "chỉ hỗ trợ desktop" warning on <1024px.
- `barber` · `skinner` · `receptionist` → mobile bottom navigation.
- `receptionist` → tablet top navigation where documented.
- `owner` và `manager` được quản lý services, combos, staff. Branch management chỉ dành cho `owner`.

**Colors — dùng Geist tokens, không hardcode:**

- Background: `bg-background-100` · `bg-gray-100` · `bg-gray-200`
- Border: `border-gray-400` · `border-gray-500`
- Text: `text-gray-1000` · `text-gray-900` · `text-gray-700`
- Status: success/completed = `text-green-900 bg-green-100` · in_progress = `text-blue-900 bg-blue-100` · pending/warning = `text-amber-900 bg-amber-100` · error = `text-red-900 bg-red-100`
- Không dùng `#FFFFFF` làm background. Không dùng gold cho heading/button/badge/warning mới.
- Theme tự đổi theo `prefers-color-scheme`. Dùng `font-sans`, không import custom font.

**Typography:** Heading = `text-heading-*` + `text-gray-1000`. Label/body = `text-label-*` / `text-copy-*` + `text-gray-900`.
Title/value display pairs must stay on one row with title left, value right, and even spacing; use the global title-value component/pattern.

**Spacing & radius:** Tailwind scale only, no hardcode px. Card/dialog = `rounded-xl`. Badge/avatar = `rounded-full`. Dùng border thay shadow trong dark UI.

**Forms:** React Hook Form + Zod. Label trên input. Required fields dùng `*`. Inline validation dưới field. Password có toggle show/hide. Search có icon + auto focus mobile + debounce 300ms + clear button.
Text inputs, textareas, selects, and combobox triggers use `text-base`; labels/help/error text may remain smaller.

**Cards:** Border nhẹ · `rounded-xl` · padding 16px. Dùng trên mobile thay table.

**Buttons:** Variants: Primary · Secondary · Ghost · Danger. Một primary action per section. Button loading: giữ nguyên text + spinner trái + disabled.

**Dialogs:** Chỉ dùng cho Create · Edit · Confirm Delete. Không nested dialog. Không multi-step dialog.

**Haircut warning:** Hiển thị khi `is_haircut = true` AND no photos. Dùng `AlertTriangle` từ lucide-react. Text: `Chưa upload ảnh kiểu tóc`. Token: `text-amber-900 bg-amber-100 border-amber-900/30`. Hiện ở Visit List · Visit Detail · Tổng quan. Chỉ `barber` thấy action upload; roles khác chỉ xem.

**Service/combo reporting:** Mỗi service phải có `responsibleRole` (`barber` hoặc `skinner`). Khi tạo/sửa visit, backend phải snapshot tên, giá và role phụ trách của service/combo vào `visit_services`. Với combo, lưu một dòng cho từng service con, phân bổ `allocatedPrice` theo tỷ lệ `combo.price / sum(service.price)`, làm tròn từng dòng và để dòng cuối nhận chênh lệch để tổng phân bổ bằng giá combo. Giá combo cao hơn tổng giá dịch vụ lẻ chỉ cảnh báo ở UI, không chặn backend. Nếu visit thiếu nhân viên tương ứng, doanh thu phân bổ thuộc nhóm báo cáo "Chưa xác định". Báo cáo phải dùng `allocatedPrice` và snapshot fields, không tính bằng giá/tên service/combo hiện tại.

**Every screen must have:** Loading state · Empty state · Error state.
Loading/empty/error UI bắt buộc reuse global primitives như `Skeleton`, `EmptyState`, `InlineAlert` khi phù hợp.

**Success feedback:** Runtime app notifications must render through the global Feedback notification flow. Dispatch success feedback before `router.push` so the notification is not lost during navigation. Keep `src/components/global/Toast.tsx` as a design-system component; do not use it for runtime success/error/warning notifications.

**Tables:** Desktop only. Dùng cho Services · Combos · Staff · Branches · Reports. Có search + sort + pagination.

**Navigation:** Follow `docs/ui/navigation.md`. Không thêm menu item chưa được document.

**Screen structure:** Follow `docs/SCREENS.md`. Không tự thêm section.

**Route pages:** `page.tsx` giữ route orchestration và page-level semantics/view. Không tạo single-use wrapper/container chỉ để render toàn bộ page body từ nơi khác; inline page body vào route file. Trong một page/component file chỉ có một module-scope function là function trả JSX của page/component đó. Handler/helper riêng của page/component có thể khai báo bên trong function component. Helper thuần hoặc reusable ở ngoài component phải đưa vào `src/utils/`. Nếu cần nhiều component functions, tách mỗi component sang file riêng trong `src/components/screens/` hoặc `src/components/modules/`. `/design-system` được exempt vì là reference page.

---

## API Pattern

```typescript
// Hook structure
const ENTITY_RESPONSE_DATA_KEY = "entity";

function getEntityResponseData(result: EntityApiResponse): Entity {
  if (
    !hasResponseData<typeof ENTITY_RESPONSE_DATA_KEY, Entity>(
      result,
      ENTITY_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? entityTexts.errors.generic);
  }
  return result.entity;
}

export function useEntity() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["entity"],
    queryFn: () => fetchClient(API_ROUTES.entity),
  });
  const createMutation = useMutation({
    mutationFn: async (input: EntityInput) => {
      const result = await fetchClient<EntityApiResponse>(API_ROUTES.entity, {
        method: "POST",
        headers: DEFAULT_JSON_HEADERS,
        body: JSON.stringify(input),
      });
      return getEntityResponseData(result);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entity"] }),
  });
  return {
    entities: query.data ?? [],
    isLoading: query.isLoading,
    createEntity: createMutation.mutateAsync,
  };
}
```

**fetchClient** — Client Components. Redirects: 401→login · 403→dashboard · 404→not-found. Throws on 500.
**fetchServer** — Server Components. `notFound()` on 404. Throws on error.
**TanStack Query default** — không refetch khi browser/window focus lại. Page data chỉ fetch khi truy cập page, reload trình duyệt, query key thay đổi, hoặc có invalidate/refetch chủ động sau mutation/action.

---

## Routes Pattern

```typescript
// appRoutes.ts — Link, router.push, redirect only
export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  notFound: "/not-found",
  visits: "/visits",
  createVisit: "/visits/create",
  visitDetail: (id: string) => `/visits/${id}`,
  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  reports: "/reports",
  ownerServices: "/owner/services",
  ownerCombos: "/owner/combos",
  ownerStaff: "/owner/staff",
  ownerBranches: "/owner/branches",
};

// apiRoutes.ts — fetchClient, fetchServer only
export const API_ROUTES = {
  visits: "/api/visits",
  visitDetail: (id: string) => `/api/visits/${id}`,
  customers: "/api/customers",
};
```

Khi thêm route mới: cập nhật cả hai files. Tối đa 2 cấp.

---

## Types & Texts Pattern

```typescript
// src/types/visits.ts
export type VisitStatus = "pending" | "in_progress" | "completed";
export interface Visit {
  id: string;
  status: VisitStatus;
  totalPrice: number;
}

// src/types/index.ts — export * from "./visits"

// src/constants/texts/visits.ts
export const visitTexts = {
  list: { title: "Danh sách visits" },
  errors: { generic: "Có lỗi xảy ra" },
};

// src/constants/texts/index.ts — export * from "./visits"
```

Shared cross-module constants live in `src/constants/common/` and must be
exported from `src/constants/common/index.ts`.
Known finite values such as statuses, roles, modes, and item types must be
declared as constants/enums before use instead of scattered raw literals.
Role checks, role arrays, role-keyed records, and role labels must use exported
role constants/types from `src/constants/common/roles.ts`.

---

## Setup & Environment

- Node v22+. Prisma v6. npm only (no global installs). Node v20 gây hang khi `prisma db seed`.
- Supabase: `DATABASE_URL` = Transaction pooler port 6543. `DIRECT_URL` = Session pooler port 5432. Không dùng Direct connection string.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

```bash
npm install && cp .env.example .env.local
npx prisma migrate deploy && npm run dev
```

Prisma: `migrate dev --name x` · `migrate deploy` · `generate` · `db seed` · `studio`

---

## Test Pattern

```typescript
describe("ComponentName", () => {
  it("should render correctly", () => { ... })
  it("should handle user action", () => { ... })
})
// Targeted run: npx vitest run src/hooks/useVisits.test.tsx
```
