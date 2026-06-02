# Skill: Types & Interfaces Conventions

## Mục đích

Quy ước quản lý TypeScript types và interfaces trong dự án. Tham khảo file này trước khi định nghĩa type mới.

---

## Quy tắc

- **Không định nghĩa type/interface trong component** — tất cả types phải được đặt vào file riêng trong `/src/types/`
- Mỗi module có file types riêng
- Export types từ `index.ts` để import dễ dàng

---

## Cấu trúc thư mục

```
src/
└── types/
    ├── auth.ts        # types cho auth, user, session
    ├── visits.ts      # types cho visits
    ├── customers.ts   # types cho customers
    ├── services.ts    # types cho services, combos
    └── index.ts       # export tất cả
```

---

## Ví dụ

```typescript
// src/types/auth.ts
export interface User {
  id: string;
  username: string;
  role:
    | "superadmin"
    | "owner"
    | "manager"
    | "receptionist"
    | "barber"
    | "skinner";
  shopId: string | null;
  branchId: string | null;
}

export interface SessionUser extends User {
  isFirstLogin: boolean;
}
```

```typescript
// src/types/visits.ts
export type VisitStatus = "pending" | "in_progress" | "completed";

export interface Visit {
  id: string;
  customerId: string;
  branchId: string;
  barberId: string | null;
  skinnerId: string | null;
  status: VisitStatus;
  totalPrice: number;
  completedAt: Date | null;
}
```

```typescript
// src/types/index.ts
export * from "./auth";
export * from "./visits";
export * from "./customers";
export * from "./services";
```

```typescript
// Trong component hoặc hook
import { Visit, VisitStatus } from "@/types";
```

---

## Lưu ý

- Mỗi khi thêm module mới, tạo file types tương ứng trong `/src/types/`
- Export file mới trong `index.ts`
- Không dùng `any` — luôn định nghĩa type rõ ràng
- Prisma tự generate types từ schema — chỉ tạo thêm types cho những gì Prisma không cover (ví dụ response API, session payload)
