# Skill: API Client & Error Handling Conventions

## Mục đích

Quy ước xử lý API request và error tập trung trong dự án. Tham khảo file này trước khi viết bất kỳ logic fetch data nào.

---

## Nguyên tắc

- Không dùng `fetch` trực tiếp trong component hay hook
- Tất cả request đi qua wrapper function tập trung
- 2 wrapper riêng biệt: `fetchClient` cho Client Component, `fetchServer` cho Server Component
- Các default config dùng chung cho request/response đặt trong file riêng, ví dụ `src/lib/apiConfig.ts`; không khai báo trong từng hook hoặc module entity cụ thể
- Nếu nhiều request dùng JSON body, import default headers/config dùng chung thay vì lặp object inline
- Các helper response dùng chung đặt trong file riêng, ví dụ `src/lib/apiResponse.ts`
- Nếu nhiều mutation trong cùng hook cần kiểm tra response data optional, tạo private function ngay trong hook module để check, throw error và return data
- Private function trong hook dùng `hasResponseData`; không lặp block `if (!hasResponseData(...))` trong từng mutation
- Response data key phải là private constant trong hook module, không hardcode string lặp lại trong các call

---

## Error Code Convention

| Code  | Xử lý                              |
| ----- | ---------------------------------- |
| `400` | Hiển thị error message từ response |
| `401` | Redirect về `/login`               |
| `403` | Redirect về `/dashboard`           |
| `404` | Redirect về `/not-found`           |
| `500` | Hiển thị toast error               |

---

## fetchClient — dùng cho TanStack Query (Client Component)

```typescript
// src/lib/fetchClient.ts
import { ROUTES } from "@/constants/routes";

export async function fetchClient(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    window.location.href = ROUTES.login;
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    window.location.href = ROUTES.dashboard;
    throw new Error("Forbidden");
  }

  if (response.status === 404) {
    window.location.href = "/not-found";
    throw new Error("Not found");
  }

  if (response.status === 500) {
    throw new Error("Server error");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}
```

Dùng trong TanStack Query hook:

```typescript
// src/hooks/useVisits.ts
import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";

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

async function createVisit(input: VisitFormInput) {
  const result = await fetchClient<VisitApiResponse>(API_ROUTES.visits, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getVisitResponseData(result);
}
```

---

## fetchServer — dùng cho Server Component

```typescript
// src/lib/fetchServer.ts
import { notFound } from "next/navigation";

export async function fetchServer(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...options });

  if (response.status === 404) notFound();

  if (!response.ok) {
    throw new Error("Server error");
  }

  return response.json();
}
```

Dùng trong Server Component:

```typescript
// app/visits/page.tsx
import { fetchServer } from "@/lib/fetchServer"

export default async function VisitsPage() {
  const visits = await fetchServer("/api/visits")
  return <VisitsList visits={visits} />
}
```

---

## Xử lý toast error cho 500

Dùng TanStack Query `onError` callback ở QueryClient config:

```typescript
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      onError: (error: unknown) => {
        if (error instanceof Error && error.message === "Server error") {
          toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
      },
    },
  },
});
```

---

## Lưu ý

- `fetchClient` dùng `window.location.href` để redirect vì chạy ở client-side
- `fetchServer` dùng `notFound()` của Next.js vì chạy ở server-side
- Không dùng lẫn 2 wrapper này
