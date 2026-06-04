# Skill: Unit Test Conventions

## Mục đích

Quy ước viết unit test trong dự án. Codex chỉ viết hoặc update unit test khi user yêu cầu rõ ràng; khi chỉ nhận yêu cầu implement thì chỉ code tính năng trước.

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

### Khi implement tính năng

1. Khi nhận yêu cầu implement, Codex chỉ viết code tính năng trước
2. Không tự động viết hoặc update unit test trong cùng lượt implement, trừ khi user yêu cầu rõ ràng
3. Sau khi code xong, báo rõ unit test chưa được viết/cập nhật và chờ user xác nhận bước test

### Khi user yêu cầu viết unit test

1. Codex viết hoặc update unit test cho tất cả file liên quan đến tính năng đã được confirm
2. Test file đặt cạnh file được test theo convention ở trên
3. Chạy Vitest targeted cho **những test file mới tạo hoặc vừa update**, không chạy toàn bộ test suite của project nếu user không yêu cầu
4. Nếu test runner bị lỗi môi trường, báo rõ blocker và command đã chạy

Ví dụ:

```bash
npx vitest run src/app/api/customers/route.test.ts src/hooks/useCustomers.test.tsx src/app/customers/page.test.tsx
```

> Chỉ chạy `npx vitest run` toàn bộ project khi user yêu cầu rõ ràng, khi thay đổi chạm vào shared behavior có blast radius lớn, hoặc trước release/merge nếu cần kiểm tra tổng thể.

### Khi user yêu cầu commit

- Nếu code tính năng đã thay đổi nhưng unit test chưa được viết hoặc chưa được update, Codex phải nhắc user xác nhận trước khi commit
- Nếu user xác nhận vẫn commit khi chưa có test, commit theo yêu cầu và ghi rõ trong final response
- Nếu user yêu cầu commit riêng phần test, dùng message: `test: add unit tests for [tên tính năng]`

---

## Lệnh thường dùng

```bash
npx vitest run path/to/file.test.ts  # Chạy targeted test file mới/sửa
npx vitest              # Watch mode
npx vitest run          # Chạy tất cả test khi được yêu cầu rõ ràng
npx vitest run --coverage  # Coverage report khi được yêu cầu
```
