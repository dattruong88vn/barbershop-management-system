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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";

const VISITS_QUERY_KEY = ["visits"] as const;
const VISIT_RESPONSE_DATA_KEY = "visit";

function getVisitResponseData(result: VisitApiResponse): Visit {
  if (
    !hasResponseData<typeof VISIT_RESPONSE_DATA_KEY, Visit>(
      result,
      VISIT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? visitTexts.errors.generic);
  }

  return result.visit;
}

async function getVisits() {
  return fetchClient(API_ROUTES.visits);
}

async function createVisit(input: VisitFormInput) {
  const result = await fetchClient<VisitApiResponse>(API_ROUTES.visits, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getVisitResponseData(result);
}

export function useVisits() {
  const queryClient = useQueryClient();
  const visitsQuery = useQuery({
    queryKey: VISITS_QUERY_KEY,
    queryFn: getVisits,
  });
  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VISITS_QUERY_KEY }),
  });

  return {
    visits: visitsQuery.data ?? [],
    error: visitsQuery.error,
    isCreating: createVisitMutation.isPending,
    isLoading: visitsQuery.isLoading,
    createVisit: createVisitMutation.mutateAsync,
  };
}
```

### Ví dụ dùng trong component

```typescript
// Client Component
"use client"
import { useVisits } from "@/hooks/useVisits"

export default function VisitsList() {
  const { visits, isLoading, error } = useVisits()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error...</div>

  return <div>{visits.map(...)}</div>
}
```

---

## Entity Hook Convention

- Mỗi entity có hook riêng trong `/src/hooks/`
- Với mỗi entity hook, ưu tiên export một hook duy nhất
- Hook duy nhất đó gom query state và các mutation function tương ứng với API
- Các helper request nội bộ trong hook không export ra ngoài
- Query key đặt trong hook module dưới dạng private constant và phải nhất quán, mô tả rõ data đang fetch
- Response data key đặt trong hook module dưới dạng private constant, ví dụ `const VISIT_RESPONSE_DATA_KEY = "visit"`
- Khi nhiều mutation trong cùng hook cần lấy response data optional, tạo private function ngay trong hook module để check, throw error và return data, ví dụ `getVisitResponseData`
- Private function trong hook dùng `hasResponseData` từ `src/lib/apiResponse.ts`; không lặp block `if (!hasResponseData(...))` trong từng mutation
- Không hardcode response data key string lặp lại trong `hasResponseData` calls

Ví dụ return shape:

```typescript
return {
  branches,
  error,
  isCreating,
  isDeleting,
  isLoading,
  isUpdating,
  createBranch,
  deleteBranch,
  updateBranch,
};
```

---

## Default Request/Response Config

- Các default config dùng chung cho request/response đặt trong file riêng, ví dụ `src/lib/apiConfig.ts`
- Không khai báo default config trong từng hook hoặc module entity cụ thể
- Nếu nhiều request dùng JSON body, import default headers/config dùng chung thay vì lặp object inline
- Các helper response dùng chung đặt trong file riêng, ví dụ `src/lib/apiResponse.ts`

Ví dụ:

```typescript
// src/lib/apiConfig.ts
export const DEFAULT_JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;
```

```typescript
// src/lib/apiResponse.ts
export function hasResponseData<TKey extends string, TValue>(
  response: Partial<Record<TKey, TValue>>,
  key: TKey,
): response is Record<TKey, TValue> {
  return typeof response[key] === "object" && response[key] !== null;
}
```

```typescript
// src/hooks/useServices.ts
import { API_ROUTES } from "@/constants/routes";
import { serviceTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";

const SERVICE_RESPONSE_DATA_KEY = "service";

function getServiceResponseData(result: ServiceApiResponse): Service {
  if (
    !hasResponseData<typeof SERVICE_RESPONSE_DATA_KEY, Service>(
      result,
      SERVICE_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? serviceTexts.ownerServices.errors.generic);
  }

  return result.service;
}

const result = await fetchClient<ServiceApiResponse>(API_ROUTES.services, {
  method: "POST",
  headers: DEFAULT_JSON_HEADERS,
  body: JSON.stringify(input),
});

return getServiceResponseData(result);
```

---

## Lưu ý

- Không dùng `fetch` trong Client Component — dùng TanStack Query thay thế
- Không dùng TanStack Query trong Server Component
- Không hardcode API URL trong hook — dùng `API_ROUTES` từ `@/constants/routes`
- Client hook phải dùng `fetchClient`, không gọi `fetch` trực tiếp
