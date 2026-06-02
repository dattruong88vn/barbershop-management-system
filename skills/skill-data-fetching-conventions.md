# Skill: Data Fetching Conventions

## Mục đích

Quy ước fetch data trong dự án. Tham khảo file này trước khi viết bất kỳ logic fetch data nào.

---

## Nguyên tắc chung

| Component type       | Cách fetch        | Lý do                                             |
| -------------------- | ----------------- | ------------------------------------------------- |
| **Server Component** | `fetch` trực tiếp | Tận dụng SSR, caching của Next.js                 |
| **Client Component** | TanStack Query    | Quản lý state, caching, refetching, loading/error |

---

## Server Component — dùng fetch trực tiếp

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await fetch("https://...", {
    cache: "no-store", // hoặc next: { revalidate: 60 }
  }).then(res => res.json())

  return <Dashboard data={data} />
}
```

---

## Client Component — dùng TanStack Query

### Cấu trúc hooks

```
src/
└── hooks/
    ├── useVisits.ts
    ├── useCustomers.ts
    ├── useServices.ts
    └── ...
```

### Ví dụ hook

```typescript
// src/hooks/useVisits.ts
import { useQuery } from "@tanstack/react-query";

export function useVisits() {
  return useQuery({
    queryKey: ["visits"],
    queryFn: () => fetch("/api/visits").then((res) => res.json()),
  });
}
```

### Ví dụ dùng trong component

```typescript
// Client Component
"use client"
import { useVisits } from "@/hooks/useVisits"

export default function VisitsList() {
  const { data, isLoading, error } = useVisits()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error...</div>

  return <div>{data.map(...)}</div>
}
```

---

## Lưu ý

- Không dùng `fetch` trong Client Component — dùng TanStack Query thay thế
- Không dùng TanStack Query trong Server Component
- Mỗi entity có hook riêng trong `/src/hooks/`
- Query key phải nhất quán và mô tả rõ data đang fetch
