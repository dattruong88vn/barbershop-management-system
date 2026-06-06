# Skill: Naming Conventions

## Mục đích

Quy ước đặt tên file, function, variable trong dự án. Tham khảo file này trước khi viết bất kỳ code nào.

---

## File Naming

| Loại file         | Convention                | Ví dụ                      |
| ----------------- | ------------------------- | -------------------------- |
| Page, Layout      | `kebab-case`              | `change-password/page.tsx` |
| Component         | `PascalCase`              | `VisitCard.tsx`            |
| Hook              | `camelCase`, prefix `use` | `useVisits.ts`             |
| Utility / lib     | `camelCase`               | `formatDate.ts`            |
| Types             | `camelCase`               | `visits.ts`                |
| Constants / texts | `camelCase`               | `visits.ts`                |

`src/app/` route folders are reserved for route files only. Do not create PascalCase component files such as `CustomerVisitHistory.tsx` or `VisitCreateForm.tsx` inside `src/app/`.

Place component files by ownership:

- Route-only orchestration: keep directly in `page.tsx`.
- Module component: `src/components/<module>/ComponentName.tsx`.
- App-wide reusable component: `src/components/design-system/ComponentName.tsx`.

---

## Function Naming

| Loại                     | Convention                        | Ví dụ                                                |
| ------------------------ | --------------------------------- | ---------------------------------------------------- |
| Component                | `PascalCase`                      | `VisitCard()`                                        |
| Hook                     | `camelCase`, prefix `use`         | `useVisits()`                                        |
| Internal trong component | `camelCase`, prefix `handle`      | `handleSubmit()`, `handleChange()`                   |
| Export từ module khác    | `camelCase`, bắt đầu bằng động từ | `formatDate()`, `convertPrice()`, `calculateTotal()` |
| API handler              | Next.js convention                | `GET()`, `POST()`                                    |

> ⚠️ `handle` chỉ dùng cho function nội bộ trong component. Function export từ module khác phải bắt đầu bằng động từ mô tả hành động.

---

## Variable Naming

| Loại                                         | Convention                       | Ví dụ                              |
| -------------------------------------------- | -------------------------------- | ---------------------------------- |
| Internal (chỉ dùng trong component/function) | `camelCase`, prefix `_`          | `_tempData`, `_count`              |
| Export hoặc dùng bên ngoài                   | `camelCase`                      | `visitList`, `shopId`              |
| Boolean                                      | `camelCase`, prefix `is/has/can` | `isLoading`, `hasPhoto`, `canEdit` |
| Constant                                     | `UPPER_SNAKE_CASE`               | `MAX_PHOTO_SIZE`                   |
| Enum value                                   | `UPPER_SNAKE_CASE`               | `VISIT_STATUS.PENDING`             |

> ⚠️ Prefix `_` chỉ dùng cho variable khai báo nội bộ, không export ra ngoài.

---

## Ví dụ tổng hợp

```typescript
// utils/visitUtils.ts — export function
export function formatVisitDate(date: Date): string { ... }
export function calculateTotalPrice(services: Service[]): number { ... }

// hooks/useVisits.ts
export function useVisits() {
  const _rawData = useQuery(...) // internal variable
  const visitList = _rawData.data // exported/used outside
  return { visitList, isLoading: _rawData.isLoading }
}

// components/VisitCard.tsx
export default function VisitCard({ visit }: { visit: Visit }) {
  const _isExpanded = false // internal variable

  function handleClick() { ... }   // internal handler
  function handleSubmit() { ... }  // internal handler

  return <div>...</div>
}
```
