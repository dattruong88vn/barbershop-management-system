# Skill: Routes Conventions

## Mục đích

Quy ước định nghĩa và sử dụng routes trong dự án. Tham khảo file này trước khi thêm route mới.

---

## Quy tắc

- **Không hardcode URL string trong component** — tất cả routes phải được định nghĩa trong `/src/constants/routes.ts`
- Import routes từ `@/constants/routes` trong components, hooks, và middleware

---

## File Routes

```typescript
// src/constants/routes.ts
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

## App Router Folder Structure

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
└── owner/
    ├── services/page.tsx
    ├── combos/page.tsx
    ├── staff/page.tsx
    └── branches/page.tsx
```

> Tên folder trong `/app` phải khớp với URL trong `ROUTES`.

---

## Ví dụ sử dụng

```typescript
import { ROUTES } from "@/constants/routes"

// Link
<Link href={ROUTES.visits}>Danh sách visits</Link>

// Dynamic route
<Link href={ROUTES.visitDetail(visit.id)}>Chi tiết</Link>

// Redirect
redirect(ROUTES.dashboard)

// Router push
router.push(ROUTES.login)
```

---

## Lưu ý

- Khi thêm route mới, cập nhật `ROUTES` trong `routes.ts` và tạo folder/page tương ứng trong `/app`
- Route động (có tham số) dùng function: `visitDetail: (id: string) => \`/visits/${id}`
- Tối đa 2 cấp để giữ đơn giản
