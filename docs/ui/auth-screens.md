# UI Screens: Auth

Màn hình xác thực dùng chung cho tất cả roles.

Trạng thái: Clear để build UI layout và visual. Clear một phần cho hành vi redirect/business vì spec đề xuất `/dashboard`, còn code hiện tại redirect staff roles về `/customers` sau khi đổi mật khẩu lần đầu.

Thiết bị: desktop, tablet, mobile responsive.

Routes:

- `/login`
- `/change-password`

Công nghệ:

- Next.js App Router
- Tailwind CSS
- shadcn/ui

## Tài Liệu Tham Khảo

- Nguồn chuẩn giao diện: `docs/ui/component-spec.md`
- Routes: `src/constants/routes/appRoutes.ts`
- Text constants: `src/constants/texts/auth.ts`
- Source UI Auth: `src/app/(auth)`
- NextAuth config: `src/lib/auth.ts`
- API đổi mật khẩu: `src/app/api/change-password/route.ts`
- Access middleware: `src/middleware.ts`

## Design Tokens

Dùng `docs/ui/component-spec.md`. Auth screens chủ yếu dùng:

- Background: `#111111` (`dark-200`)
- Surface: `#1A1A1A` (`dark-300`)
- Border: `#2E2E2E` (`dark-500`)
- Gold accent: `#C9A84C`
- Text primary: `#F5F0E8`
- Text muted: `#6B6055`

## Quyết Định Còn Mở

- Spec màn hình ban đầu nói login và change password thành công redirect về `/dashboard`.
- Implementation hiện tại default login callback về `/customers` và change password redirect staff roles (`receptionist`, `barber`, `skinner`) về `/customers`.
- Data model và session field hiện dùng `is_first_login`; spec cũ dùng `force_password_change`. Dùng `is_first_login` trừ khi backend contract được đổi tên rõ ràng.
- Popup trial warning là behavior tương lai; session/API support cho trial warning hiện chưa implement.
- Không cho dùng lại mật khẩu cũ hiện chưa được enforce trong `POST /api/change-password` vì API chỉ nhận mật khẩu mới. Cần quyết định API trước khi implement.

## Login

Route: `/login`

### Layout

Layout toàn màn hình một cột, căn giữa dọc và ngang. Background dùng `dark-200`.

Cấu trúc:

```text
[Khu vực brand]

[Card đăng nhập]
  Tiêu đề
  Input username
  Input password
  Submit button
  Error text
```

### Brand Area

- Icon: scissors hoặc logo placeholder, gold, 40px.
- Text: `BarberOS`, 20px, medium, `text-primary`.
- Có thể hiển thị tên shop dưới brand khi có data.
- Khoảng cách dưới brand: 32px.

### Login Card

- Background: `dark-300`.
- Border: `0.5px solid dark-500`.
- Border radius: `rounded-xl`.
- Padding: `p-8`.
- Width: `w-full max-w-sm` (384px).
- Shadow: tránh shadow trang trí lớn, trừ khi màn hình này cố ý giữ theo spec riêng.

### Heading

- Text: `Đăng nhập`.
- Size: 18px.
- Weight: medium.
- Color: `text-primary`.
- Khoảng cách dưới: 24px.

### Username Input

- Label: `Tên đăng nhập`, 13px, `text-secondary`.
- Input background: `dark-400`.
- Border: `dark-600`.
- Focus border: `gold-muted`.
- Placeholder: `Nhập tên đăng nhập`.
- Không dùng icon trong input này.

### Password Input

- Label: `Mật khẩu`, 13px, `text-secondary`.
- Password input có toggle show/hide bên phải.
- Placeholder: `Nhập mật khẩu`.
- Dùng `Eye` và `EyeOff` từ `lucide-react` khi dependency đã có.

### Submit Button

- Text: `Đăng nhập`.
- Full width.
- Background: gold (`#C9A84C`).
- Text: `dark-100`.
- Height: 40px.
- Font size: 14px.
- Font weight: medium.
- Khoảng cách trên: 8px so với password input.
- Trạng thái loading: spinner nhỏ bên trái, button disabled, text không đổi.

### Error State

- Hiển thị một dòng dưới button.
- Text: `Tên đăng nhập hoặc mật khẩu không đúng`.
- Color: danger text.
- Size: 13px.
- Không highlight riêng từng field khi invalid credentials.

### Behavior

- Submit bằng Enter hoặc click submit button.
- Login thành công với `is_first_login = true` redirect về `/change-password`.
- Login thành công với `is_first_login = false` redirect về callback/default route đã resolve.
- Trial warning cho shop còn 7 ngày hoặc ít hơn đang chờ API/session support.

## Change Password

Route: `/change-password`

### Khi Nào Hiển Thị

- Bắt buộc sau lần login đầu tiên khi `is_first_login = true`.
- User không thể bỏ qua màn hình này.
- Middleware phải chặn user đi vào protected app pages trước khi đổi mật khẩu.

### Layout

Dùng cùng auth layout toàn màn hình, căn giữa như Login.

Cấu trúc:

```text
[Khu vực brand]

[Card đổi mật khẩu]
  Tiêu đề
  Subtext
  Input mật khẩu mới
  Input xác nhận mật khẩu
  Submit button
  Server error text
```

### Card

Giống Login card:

- Background: `dark-300`.
- Border: `0.5px solid dark-500`.
- Border radius: `rounded-xl`.
- Padding: `p-8`.
- Width: `w-full max-w-sm`.

### Heading

- Text: `Đặt mật khẩu mới`.
- Size: 18px.
- Weight: medium.
- Color: `text-primary`.

### Subtext

- Text: `Đây là lần đầu bạn đăng nhập. Vui lòng đặt mật khẩu mới trước khi tiếp tục.`
- Size: 13px.
- Color: `text-muted`.
- Khoảng cách dưới: 24px.

### New Password Input

- Label: `Mật khẩu mới`.
- Password input có toggle show/hide.
- Inline validation hiển thị sau blur hoặc submit.
- Validation text: `Mật khẩu phải có ít nhất 8 ký tự`.

### Confirm Password Input

- Label: `Xác nhận mật khẩu`.
- Password input có toggle show/hide.
- Inline validation hiển thị sau blur hoặc submit.
- Validation text khi mismatch: `Mật khẩu không khớp`.

### Submit Button

- Text: `Đặt mật khẩu`.
- Full width.
- Gold primary style.
- Height: 40px.
- Trạng thái loading khi submit.
- Disabled khi form invalid.

### Error States

- Password ngắn hơn 8 ký tự: hiển thị `Mật khẩu phải có ít nhất 8 ký tự` dưới new password input.
- Password mismatch: hiển thị `Mật khẩu không khớp` dưới confirm password input.
- Server error: hiển thị một dòng dưới button.

### Behavior

- Đổi mật khẩu thành công set `is_first_login = false`.
- Redirect target lấy từ `redirectTo` do `POST /api/change-password` trả về.
- Implementation hiện tại redirect staff roles về `/customers`, các role khác về `/dashboard`.
- Chặn dùng lại mật khẩu cũ cần API contract rõ ràng trước khi implement.
