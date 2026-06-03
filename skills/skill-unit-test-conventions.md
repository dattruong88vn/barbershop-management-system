# Skill: Unit Test Conventions

## Mục đích

Quy ước viết unit test trong dự án. Codex phải viết unit test sau khi mỗi tính năng được confirm hoàn thành.

---

## Testing Library

- **Vitest** — test runner
- **React Testing Library (RTL)** — test components

---

## Cấu trúc file test

File test đặt **ngay cạnh file cần test**, không tạo thư mục `__tests__` riêng:

```
src/
├── app/
│   └── api/
│       └── visits/
│           ├── route.ts
│           └── route.test.ts
├── components/
│   └── VisitCard/
│       ├── VisitCard.tsx
│       └── VisitCard.test.tsx
├── lib/
│   ├── fetchClient.ts
│   └── fetchClient.test.ts
└── utils/
    ├── formatDate.ts
    └── formatDate.test.ts
```

---

## Đặt tên test

- `describe` — tên component/function đang test
- `it` — bắt đầu bằng `should`, mô tả behavior

```typescript
describe("VisitCard", () => {
  it("should render customer name", () => { ... })
  it("should show warning when no photo", () => { ... })
  it("should disable edit after 3 hours", () => { ... })
})

describe("formatDate", () => {
  it("should format date correctly", () => { ... })
  it("should return empty string when date is null", () => { ... })
})
```

---

## Scope test theo loại

### Utility functions

- Test tất cả cases bao gồm edge cases

```typescript
describe("calculateTotalPrice", () => {
  it("should return correct total for single service", () => { ... })
  it("should return correct total for combo", () => { ... })
  it("should return 0 when no services", () => { ... })
})
```

### API routes

- Test response status và data

```typescript
describe("GET /api/visits", () => {
  it("should return 200 with visit list", () => { ... })
  it("should return 401 when not authenticated", () => { ... })
  it("should return 403 when role is not allowed", () => { ... })
})
```

### Components

- Test render và interaction

```typescript
describe("VisitCard", () => {
  it("should render customer name", () => { ... })
  it("should call handleClick when button clicked", () => { ... })
  it("should show warning icon when no photo", () => { ... })
})
```

### Hooks

- Test với `renderHook`

```typescript
describe("useVisits", () => {
  it("should return visit list on success", () => { ... })
  it("should return error on failure", () => { ... })
})
```

---

## Workflow

1. Tính năng được confirm hoàn thành
2. Codex viết unit test cho tất cả file liên quan đến tính năng đó
3. Chạy `npx vitest run` để verify tất cả test pass
4. Commit với message: `test: add unit tests for [tên tính năng]`

---

## Lệnh thường dùng

```bash
npx vitest run          # Chạy tất cả test một lần
npx vitest              # Chạy test ở watch mode
npx vitest run --coverage  # Chạy test với coverage report
```
