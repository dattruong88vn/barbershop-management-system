# Skill: Routes Conventions

## Mục đích

Quy ước định nghĩa và sử dụng routes trong dự án. Tham khảo file này trước khi thêm route mới.

---

## Quy tắc

- **Không hardcode URL string trong component** — tất cả routes phải được định nghĩa trong file constants
- **Không dùng `window.location`, `window.location.href`, hoặc `window.location.assign` để điều hướng** — dùng `Link`, `router.push`, `router.replace`, hoặc `redirect` của Next.
- Tất cả route constants đặt trong folder `src/constants/routes/`
- Tách file theo mục đích: `appRoutes.ts` cho frontend, `apiRoutes.ts` cho API endpoints
- Export qua `src/constants/routes/index.ts` để import từ `@/constants/routes`

---

## ROUTES — điều hướng frontend

Dùng trong `Link`, `redirect`, `router.push`:

```typescript
// src/constants/routes/appRoutes.ts
export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  visits: "/visits",
  visitDetail: (id: string) => `/visits/${id}`,
  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  reports: "/reports",
  ownerServices: "/owner/services",
  ownerCombos: "/owner/combos",
  ownerStaff: "/owner/staff",
  ownerBranches: "/owner/branches",
};
```

---

## API_ROUTES — API endpoints

Dùng trong `fetchClient`, `fetchServer`:

```typescript
// src/constants/routes/apiRoutes.ts
export const API_ROUTES = {
  visits: "/api/visits",
  visitDetail: (id: string) => `/api/visits/${id}`,
  customers: "/api/customers",
  customerDetail: (id: string) => `/api/customers/${id}`,
  branches: "/api/branches",
  services: "/api/services",
  combos: "/api/combos",
  staff: "/api/staff",
  reports: "/api/reports",
};
```

---

## App Router Folder Structure

`src/app/` chỉ chứa route files. Không đặt component module hoặc reusable component trong route folder.

Route folder chỉ nên có các file route chuẩn:

- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- `route.ts` cho API route
- test cạnh route file khi cần

Nếu UI route cần component phụ:

- Route-only orchestration đặt trực tiếp trong `page.tsx`.
- Component theo module đặt trong `src/components/<module>/`.
- Component dùng chung toàn app đặt trong `src/components/design-system/`.

```
src/app/
├── login/page.tsx
├── change-password/page.tsx
├── dashboard/page.tsx
├── visits/
│   ├── page.tsx
│   └── [id]/page.tsx
├── customers/
│   ├── page.tsx
│   └── [id]/page.tsx
├── reports/page.tsx
├── owner/
│   ├── services/page.tsx
│   ├── combos/page.tsx
│   ├── staff/page.tsx
│   └── branches/page.tsx
└── api/
    ├── visits/route.ts
    ├── customers/route.ts
    ├── branches/route.ts
    ├── services/route.ts
    ├── combos/route.ts
    ├── staff/route.ts
    └── reports/route.ts
```

> Tên folder trong `/app` phải khớp với URL trong `ROUTES` và `API_ROUTES`.

---

## Ví dụ sử dụng

```typescript
import { API_ROUTES, ROUTES } from "@/constants/routes"

// Frontend navigation
<Link href={ROUTES.visits}>Danh sách visits</Link>
<Link href={ROUTES.visitDetail(visit.id)}>Chi tiết</Link>
redirect(ROUTES.dashboard)

// API calls
fetchClient(API_ROUTES.visits)
fetchClient(API_ROUTES.visitDetail(id))
```

---

## Lưu ý

- `ROUTES` — chỉ dùng cho điều hướng, không dùng để gọi API
- `API_ROUTES` — chỉ dùng trong `fetchClient` hoặc `fetchServer`, không dùng trong `Link` hay `redirect`
- Khi thêm route mới, cập nhật cả `ROUTES` và `API_ROUTES` nếu cần
- Route động dùng function: `visitDetail: (id: string) => \`/visits/${id}`
- Tối đa 2 cấp để giữ đơn giản
