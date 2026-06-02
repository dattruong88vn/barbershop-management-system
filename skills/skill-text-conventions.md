# Skill: Text & Constants Conventions

## Mục đích

Quy ước quản lý text và constants trong dự án. Tham khảo file này trước khi thêm text mới vào component.

---

## Quy tắc

- **Không hard code text trong component** — tất cả text phải được đặt vào file riêng trong `/src/constants/texts/`
- Mỗi module có file text riêng
- Import text vào component từ file constants

---

## Cấu trúc thư mục

```
src/
└── constants/
    └── texts/
        ├── auth.ts        # text cho login, change-password...
        ├── visits.ts      # text cho visits
        ├── customers.ts   # text cho customers
        ├── dashboard.ts   # text cho dashboard
        └── index.ts       # export tất cả
```

---

## Ví dụ

```typescript
// src/constants/texts/auth.ts
export const authTexts = {
  login: {
    title: "Đăng nhập",
    username: "Tên đăng nhập",
    password: "Mật khẩu",
    submit: "Đăng nhập",
    error: "Sai tên đăng nhập hoặc mật khẩu",
  },
  changePassword: {
    title: "Đổi mật khẩu",
    newPassword: "Mật khẩu mới",
    confirmPassword: "Xác nhận mật khẩu",
    submit: "Cập nhật",
  },
};
```

```typescript
// src/constants/texts/index.ts
export * from "./auth";
export * from "./visits";
export * from "./customers";
export * from "./dashboard";
```

```typescript
// Trong component
import { authTexts } from "@/constants/texts"

export default function LoginPage() {
  return <h1>{authTexts.login.title}</h1>
}
```

---

## Lưu ý

- Mỗi khi thêm module mới, tạo file text tương ứng trong `/src/constants/texts/`
- Export file mới trong `index.ts`
- Không dùng string trực tiếp trong JSX hay logic
