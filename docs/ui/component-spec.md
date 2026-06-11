# UI Component Spec

Đây là design system và component spec cho toàn bộ giao diện Barber Shop SaaS.
Tất cả màn hình phải tham khảo file này trước khi build — không tự định nghĩa lại style.

Shared primitives and reusable UI components live in `src/components/global/`.
Shared mobile navigation/components live in `src/components/mobile/`.
Module components should only compose module-specific layouts or behavior, and must build on global components instead of redefining base visuals.
For modules with multiple pages, keep module-shared components at `src/components/modules/<module>/` root and move page-specific components into `src/components/screens/<module-or-route>/` when they are not reused by the module.

**Design system tham khảo:** [Vercel Geist](https://vercel.com/geist/introduction)
**Theme:** Light + Dark — tự đổi theo `prefers-color-scheme` của hệ thống
**Font:** System font qua `font-sans`. Không import custom font.

---

## 1. Setup

### Font

Dùng Tailwind `font-sans` theo `CONTEXT.md`. Không import `geist/font` hoặc custom font khác trong MVP.

### Theme

Dùng `class="dark"` trên `<html>` theo system preference. Không build toggle theme trong MVP.

```typescript
// src/app/layout.tsx — detect system preference
<html className={resolvedTheme}>
```

Tất cả màu dùng CSS variables của Geist — tự động đổi giữa light/dark.

---

## 2. Design Tokens

Không hardcode hex. Dùng CSS variables của Geist — chúng tự adapt theo theme.

### Màu nền

| Token               | Dùng cho                            |
| ------------------- | ----------------------------------- |
| `bg-background-100` | Nền trang chính                     |
| `bg-background-200` | Nền thứ cấp, subtle differentiation |
| `bg-gray-100`       | Component background mặc định       |
| `bg-gray-200`       | Hover background                    |
| `bg-gray-300`       | Active background                   |
| `bg-gray-700`       | High contrast background            |
| `bg-gray-800`       | Hover high contrast                 |

### Màu border

| Token             | Dùng cho              |
| ----------------- | --------------------- |
| `border-gray-400` | Border mặc định       |
| `border-gray-500` | Hover border          |
| `border-gray-600` | Active border / focus |

### Màu chữ

| Token            | Dùng cho                         |
| ---------------- | -------------------------------- |
| `text-gray-1000` | Primary text                     |
| `text-gray-900`  | Secondary text, labels           |
| `text-gray-700`  | Muted text, placeholder, caption |

### Màu trạng thái

| Token                             | Dùng cho              |
| --------------------------------- | --------------------- |
| `text-blue-900` / `bg-blue-100`   | Info, in_progress     |
| `text-green-900` / `bg-green-100` | Success, completed    |
| `text-amber-900` / `bg-amber-100` | Warning, pending      |
| `text-red-900` / `bg-red-100`     | Error, danger, delete |

---

## 3. Typography

Dùng system font qua `font-sans` cho UI. Dùng Tailwind class từ typography scale hiện có.

| Tên             | Class             | Dùng cho                               |
| --------------- | ----------------- | -------------------------------------- |
| `heading-1`     | `text-heading-32` | Tên trang lớn                          |
| `heading-2`     | `text-heading-24` | Tiêu đề card, section                  |
| `heading-3`     | `text-heading-20` | Sub-heading                            |
| `heading-4`     | `text-heading-16` | Tiêu đề nhỏ, label nổi bật             |
| `label-default` | `text-label-14`   | Label input, menu item, nội dung chính |
| `label-sm`      | `text-label-13`   | Secondary label, badge text            |
| `label-xs`      | `text-label-12`   | Caption, hint, timestamp               |
| `body`          | `text-copy-14`    | Nội dung nhiều dòng                    |
| `body-sm`       | `text-copy-13`    | Nội dung phụ, space-constrained        |
| `button`        | `text-button-14`  | Button text                            |
| `button-sm`     | `text-button-12`  | Button nhỏ                             |

---

## 4. Button

Tham khảo: [Geist Button](https://vercel.com/geist/button)

### Variants

| Variant             | Dùng cho                                |
| ------------------- | --------------------------------------- |
| `primary` (default) | Hành động chính: Lưu, Xác nhận, Tạo mới |
| `secondary`         | Hành động phụ: Chỉnh sửa, Xem thêm      |
| `error`             | Hành động huỷ không thể hoàn tác: Xoá   |
| `ghost` (nếu có)    | Hủy, thoát, trung tính                  |

### Sizes

| Size               | Dùng cho               |
| ------------------ | ---------------------- |
| `large`            | CTA nổi bật            |
| `medium` (default) | Hầu hết các trường hợp |
| `small`            | Trong bảng, compact UI |

### Quy tắc

- Loading state: dùng prop `loading` — không tự thêm spinner
- Disabled: chỉ khi action thực sự không khả dụng — kèm Tooltip giải thích
- Label: Title Case, mô tả action + đối tượng: "Tạo Visit", "Xoá Nhân Viên"
- Full width: thêm `className="w-full"` khi dùng trong form card
- Dùng `ButtonLink` cho navigation, `Button` cho action thay đổi state

---

## 5. Input

Tham khảo: [Geist Input](https://vercel.com/geist/input)

### Variants

**Text input** — tên, số điện thoại, tìm kiếm thông thường

**Password input**

- Có icon toggle show/hide bên phải
- Icon: `Eye` / `EyeOff` từ geist icons hoặc lucide-react, size 16px

**Search input**

- Prefix icon kính lúp bên trái

### Label

- Dùng `text-label-14`, màu `text-gray-900`
- Bắt buộc (`*`): thêm dấu `*` màu `text-red-900` sau label text

### Helper / Error text

- Helper: `text-copy-13`, màu `text-gray-700`
- Error: `text-copy-13`, màu `text-red-900` — hiện khi blur hoặc submit

---

## 6. Badge

Tham khảo: [Geist Badge](https://vercel.com/geist/badge)

### Role badges

| Role           | Variant                                 |
| -------------- | --------------------------------------- |
| `superadmin`   | `gray`                                  |
| `owner`        | `gray` (hoặc `purple` nếu Geist hỗ trợ) |
| `manager`      | `blue`                                  |
| `receptionist` | `gray`                                  |
| `barber`       | `gray`                                  |
| `skinner`      | `teal` (nếu có) hoặc `blue`             |

### Visit status badges

| Status        | Variant | Label          |
| ------------- | ------- | -------------- |
| `pending`     | `amber` | Chờ xử lý      |
| `in_progress` | `blue`  | Đang thực hiện |
| `completed`   | `green` | Hoàn thành     |

---

## 7. Card / Surface

Tham khảo: [Geist Materials](https://vercel.com/geist/materials)

| Loại            | Class            | Dùng cho                              |
| --------------- | ---------------- | ------------------------------------- |
| Default card    | `material-base`  | Container nội dung thông thường, form |
| Elevated card   | `material-small` | Card nổi nhẹ                          |
| Modal / Dialog  | `material-modal` | Overlay content                       |
| Menu / Dropdown | `material-menu`  | Dropdown, popover                     |

**Metric card** (dashboard):

- Dùng `material-base`
- Cấu trúc: Label (`text-label-12`) → Value (`text-heading-24`) → Trend (`text-label-13`)

---

## 8. Avatar

Tham khảo: [Geist Avatar](https://vercel.com/geist/avatar)

- Hiển thị 2 chữ cái viết tắt (VD: "TN")
- Size: `small` (28px), `medium` (36px, default), `large` (44px)
- Màu: dùng variant mặc định của Geist — không custom theo role ở MVP

---

## 9. Alert / Toast

Tham khảo: [Geist Toast](https://vercel.com/geist/toast)

| Type    | Dùng cho                                  |
| ------- | ----------------------------------------- |
| success | Thao tác thành công                       |
| error   | Có lỗi xảy ra                             |
| warning | Cảnh báo (trial sắp hết, ảnh chưa upload) |

**Toast:** Góc phải dưới, tự dismiss sau 3 giây.

- Surface: dark `bg-gray-200` theo theme, border `border-gray-500`, radius `rounded-md`, shadow nhẹ
- Layout: icon variant bên trái, title `text-label-14`, description `text-copy-13`, close icon `X` bên phải
- Accent: border-left 4px theo variant
  - success: `CheckCircle2`, `border-l-green-900`, icon `text-green-900`
  - error: `XCircle`, `border-l-red-900`, icon `text-red-900`
  - warning: `AlertTriangle`, `border-l-amber-900`, icon `text-amber-900`

**Inline Alert:** Full-width trong page/form, dùng [Geist Note](https://vercel.com/geist/note).

---

## 10. Modal / Dialog

Tham khảo: [Geist Modal](https://vercel.com/geist/modal)

Dùng `material-modal`. Cấu trúc chuẩn:

```
[Title]                    [X]
────────────────────────────
[Content / form]

            [Secondary]  [Primary]
```

- Close khi click backdrop hoặc Escape — trừ modal bắt buộc (VD: trial expired)
- Action buttons: align right, Secondary trước Primary sau

---

## 11. Desktop-only Notice

Hiển thị khi `owner`, `manager`, hoặc `superadmin` truy cập trên màn hình < 1024px.

```
Layout: flex column, căn giữa toàn màn hình
Background: bg-background-100
```

**Nội dung:**

- Icon: `Monitor` từ lucide-react, size 48px, màu `text-gray-700`
- Heading: "Vui lòng dùng máy tính" — `text-heading-24`
- Body: "Trang này chỉ hỗ trợ màn hình desktop (từ 1024px trở lên)." — `text-copy-14`, màu `text-gray-700`
- Không có button, không có link

---

## 12. Navigation

### Sidebar (Desktop — owner, manager, superadmin)

```
Width: 220px
Background: bg-background-100
Border-right: border-gray-400
Padding: p-3
```

**Brand area:**

- Logo + Text "BarberOS", `text-label-16` strong
- Divider bên dưới

**Nav item:**

- `text-label-14`, màu `text-gray-900` (default), `text-gray-1000` (active)
- Active: background `bg-gray-200`, border-left `2px solid` `border-gray-1000`
- Icon: lucide-react, size 16px

### Bottom Nav (Mobile — barber, skinner, receptionist)

```
Position: fixed bottom
Background: bg-background-100
Border-top: border-gray-400
Height: 56px
```

- Tối đa 4 tab
- Label: `text-label-12`
- Active: màu `text-gray-1000` / Inactive: `text-gray-700`

### Top Nav (Tablet — receptionist)

```
Background: bg-background-100
Border-bottom: border-gray-400
Height: 52px
```

Dùng [Geist Tabs](https://vercel.com/geist/tabs).

---

## 13. Empty State

Tham khảo: [Geist Empty State](https://vercel.com/geist/empty-state)

- Icon: lucide-react, size 40px, màu `text-gray-700`
- Text: `text-copy-14`, màu `text-gray-700`
- Button (tuỳ): `secondary` button bên dưới

---

## Quy tắc chung

- **Không hardcode màu hex** — chỉ dùng CSS variables / Tailwind classes của Geist
- **Không mix icon library** — chỉ dùng `lucide-react`
- **Không hardcode px trong className** — dùng Tailwind spacing scale
- **Border radius:** Theo Geist materials — `6px` (base/small), `12px` (medium/large/modal)
- **Theme:** Không build toggle, chỉ follow system preference
- **Font:** Dùng `font-sans`; không import custom font
