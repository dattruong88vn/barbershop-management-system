# UI Screens: Auth

Màn hình xác thực — dùng chung cho tất cả roles.

**Thiết bị:** Desktop, Tablet, Mobile (responsive)
**Route:** `/login`, `/change-password`
**Tham khảo component:** `ui-component-spec`

---

## 1. Login — `/login`

### Layout

Toàn màn hình, căn giữa dọc và ngang. Nền `bg-background-100`.

```
┌─────────────────────────────────┐
│                                 │
│          [Logo / Brand]         │
│                                 │
│  ┌─────────────────────────┐    │
│  │       Login Card        │    │
│  │                         │    │
│  │  Username ____________  │    │
│  │  Password ____________  │    │
│  │                         │    │
│  │  [    Đăng nhập      ]  │    │
│  │                         │    │
│  │  [error message]        │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### Components

**Brand area** (trên card, margin-bottom 32px):

- Icon `Scissors` từ lucide-react, size 40px, màu `text-gray-1000`
- Text "BarberOS" — dùng `text-heading-24`, màu `text-gray-1000`

**Card** — dùng `material-base`, `max-w-sm w-full`

**Heading** — "Đăng nhập", dùng `text-heading-20`, margin-bottom 24px

**Input: Tên đăng nhập** — dùng `Text input`

- Label: "Tên đăng nhập"
- Placeholder: "Nhập tên đăng nhập"

**Input: Mật khẩu** — dùng `Password input`

- Label: "Mật khẩu"
- Placeholder: "Nhập mật khẩu"

**Button** — dùng `primary`, size `medium`, `w-full`

- Label: "Đăng nhập"
- Loading state khi đang submit

**Error message** — dùng `Inline Alert` (Geist Note) variant `error`, hiện bên dưới button

- Nội dung: "Tên đăng nhập hoặc mật khẩu không đúng"
- Chỉ hiện khi có lỗi từ server — không highlight riêng từng input

### Behavior

- Submit bằng Enter hoặc click button
- Sau khi đăng nhập thành công:
  - `force_password_change = true` → redirect `ROUTES.changePassword`
  - Ngược lại → redirect `ROUTES.dashboard`
- Nếu trial còn ≤ 7 ngày → redirect `ROUTES.dashboard` nhưng hiện trial warning Toast

---

## 2. Change Password — `/change-password`

### Khi nào hiển thị

- Bắt buộc sau lần đăng nhập đầu tiên (`force_password_change = true`)
- Không thể bỏ qua — không có link thoát, không back được về dashboard

### Layout

Giống Login — toàn màn hình, căn giữa, nền `bg-background-100`.

```
┌─────────────────────────────────┐
│                                 │
│          [Logo / Brand]         │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Change Password Card   │    │
│  │                         │    │
│  │  [subtext]              │    │
│  │                         │    │
│  │  Mật khẩu mới _________ │    │
│  │  Xác nhận lại _________ │    │
│  │                         │    │
│  │  [   Đặt mật khẩu    ]  │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

### Components

**Brand area** — giống Login

**Card** — dùng `material-base`, `max-w-sm w-full`

**Heading** — "Đặt mật khẩu mới", dùng `text-heading-20`

**Subtext** — "Đây là lần đầu bạn đăng nhập. Vui lòng đặt mật khẩu mới trước khi tiếp tục."

- Dùng `text-copy-13`, màu `text-gray-700`, margin-bottom 24px

**Input: Mật khẩu mới** — dùng `Password input`

- Label: "Mật khẩu mới" (bắt buộc)
- Validation khi blur: tối thiểu 8 ký tự
- Error text: "Mật khẩu phải có ít nhất 8 ký tự"

**Input: Xác nhận mật khẩu** — dùng `Password input`

- Label: "Xác nhận mật khẩu" (bắt buộc)
- Validation khi blur: phải khớp với input trên
- Error text: "Mật khẩu không khớp"

**Button** — dùng `primary`, size `medium`, `w-full`

- Label: "Đặt mật khẩu"
- Disabled nếu form chưa hợp lệ
- Loading state khi đang submit

**Error message** — dùng `Inline Alert` (Geist Note) variant `error`, hiện bên dưới button

- Chỉ hiện khi có lỗi từ server (VD: trùng mật khẩu cũ)

### Behavior

- Không cho phép dùng lại mật khẩu cũ (mật khẩu do owner/superadmin tạo ban đầu)
- Sau khi thành công → set `force_password_change = false` → redirect `ROUTES.dashboard`
