# UI Component Spec

Đây là nguồn chuẩn cho design system và style component dùng chung của Barber Shop SaaS.

Tất cả màn hình UI phải đọc file này trước khi implement. Không tự định nghĩa lại visual style trong page component.

## 1. Design Tokens

### Dark Scale

| Token | Hex | Cách dùng |
| --- | --- | --- |
| `dark-100` | `#0A0A0A` | Nền sâu nhất, sidebar |
| `dark-200` | `#111111` | Nền chính của page |
| `dark-300` | `#1A1A1A` | Card, panel |
| `dark-400` | `#222222` | Nền input, metric card |
| `dark-500` | `#2E2E2E` | Border mặc định |
| `dark-600` | `#3D3D3D` | Border input, divider |

### Gold Accent

| Token | Hex | Cách dùng |
| --- | --- | --- |
| `gold-bg` | `#2A2010` | Nền badge gold, highlight nhẹ |
| `gold-muted` | `#8B6F35` | Border accent, focus ring |
| `gold` | `#C9A84C` | Primary button, icon active, accent |
| `gold-light` | `#E8C97A` | Trạng thái hover của gold |
| `gold-pale` | `#F5E9C4` | Text trên nền gold tối |

### Màu Chữ

| Token | Hex | Cách dùng |
| --- | --- | --- |
| `text-primary` | `#F5F0E8` | Heading, nội dung chính |
| `text-secondary` | `#A89B80` | Label, subtext |
| `text-muted` | `#6B6055` | Caption, placeholder, hint |

### Màu Trạng Thái

| Token | Text | Background | Border | Cách dùng |
| --- | --- | --- | --- | --- |
| `success` | `#60B060` | `#0A1A0A` | `#3A6A3A` | Hoàn tất, active |
| `info` | `#4A9EE0` | `#0A1828` | `#185FA5` | Đang xử lý, thông tin |
| `warning` | `#C9A84C` | `#2A2010` | `#8B6F35` | Pending, cảnh báo trial |
| `danger` | `#E24B4A` | `#1A0A0A` | `#793030` | Lỗi, xóa |

## 2. Typography

Dùng system font stack mặc định của Tailwind (`font-sans`). Không import custom font.

| Tên | Size | Weight | Màu | Cách dùng |
| --- | --- | --- | --- | --- |
| `heading-1` | 22px | 500 | `text-primary` | Tên trang, brand |
| `heading-2` | 18px | 500 | `text-primary` | Tiêu đề card, section |
| `heading-3` | 15px | 500 | `gold` | Tiêu đề phụ, label nổi bật |
| `body` | 14px | 400 | `text-secondary` | Nội dung chính |
| `small` | 13px | 400 | `text-secondary` | Label input, text button |
| `caption` | 12px | 400 | `text-muted` | Timestamp, hint, helper text |
| `micro` | 11px | 400 | `text-muted` | Text badge, tag |

## 3. Button

### Variants

| Variant | Background | Text | Border | Cách dùng |
| --- | --- | --- | --- | --- |
| Primary | `#C9A84C` | `#0A0A0A` | none | Hành động chính: xác nhận, lưu, đăng nhập, tạo mới |
| Secondary | transparent | `#C9A84C` | `0.5px solid #8B6F35` | Hành động phụ: chỉnh sửa, xem chi tiết |
| Ghost | `#222222` | `#A89B80` | `0.5px solid #3D3D3D` | Hủy, đóng, hành động trung tính |
| Danger | transparent | `#E24B4A` | `0.5px solid #793030` | Xóa, hủy thao tác không thể hoàn tác |

### Sizes

| Size | Height | Padding | Font size |
| --- | --- | --- | --- |
| `sm` | 32px | `px-3` | 12px |
| `md` | 40px | `px-5` | 13px |
| `lg` | 48px | `px-6` | 15px |
| `full` | 40px | `w-full` | 13px |

### Trạng Thái

- Hover: Primary dùng `gold-light`; các variant khác sáng hơn nhẹ.
- Disabled: `opacity-40`, `cursor-not-allowed`.
- Loading: spinner icon size 16px nằm bên trái text không đổi; disable click.

## 4. Input

### Base

- Background: `#222222`
- Border: `0.5px solid #3D3D3D`
- Radius: `rounded-md`
- Padding: `px-3 py-2`, height khoảng 40px
- Font size: 13px
- Text color: `text-primary`
- Placeholder color: `text-muted`

### Trạng Thái

- Focus: border `#8B6F35`; không outline, không ring.
- Error: border `#793030`.

### Variants

- Text input: tên, số điện thoại, từ khóa search.
- Password input: eye toggle bên phải, dùng lucide `Eye` / `EyeOff`, size 16px, `text-muted`.
- Search input: icon search bên trái, dùng lucide `Search`, size 16px, `text-muted`.

### Label Và Helper Text

- Label: 13px, `text-secondary`, margin bottom 6px.
- Field bắt buộc: thêm `*` màu danger.
- Helper/error text: 12px, nằm dưới input.
- Helper color: `text-muted`.
- Error color: `#E24B4A`.

## 5. Badge

### Role Badges

| Role | Text | Background | Border |
| --- | --- | --- | --- |
| `superadmin` | `#A89B80` | `#2E2E2E` | `#3D3D3D` |
| `owner` | `#C9A84C` | `#2A2010` | `#8B6F35` |
| `manager` | `#A070E0` | `#1A1030` | `#5A3A8A` |
| `receptionist` | `#4A9EE0` | `#0A1828` | `#185FA5` |
| `barber` | `#A89B80` | `#2E2E2E` | `#3D3D3D` |
| `skinner` | `#60B060` | `#0A1A0A` | `#3A6A3A` |

### Badge Trạng Thái Visit

| Status | Text | Background | Dot |
| --- | --- | --- | --- |
| `pending` | `#C9A84C` | `#2A2010` | `#C9A84C` |
| `in_progress` | `#4A9EE0` | `#0A1828` | `#4A9EE0` |
| `completed` | `#60B060` | `#0A1A0A` | `#60B060` |

Style chung: `px-3 py-1`, `rounded-full`, 11px, font weight 500, border `0.5px`. Status badge có dot 6px trước text.

## 6. Card

### Default Card

- Background: `#1A1A1A`
- Border: `0.5px solid #2E2E2E`
- Radius: `rounded-xl`
- Padding: `p-5`
- Dùng cho container nội dung thông thường, form và list.

### Accent Card

- Background: `#1A1A1A`
- Border: `0.5px solid #8B6F35`
- Radius: `rounded-xl`
- Padding: `p-5`
- Dùng cho thông tin quan trọng, warning hoặc visit cần chú ý.

### Metric Card

- Background: `#222222`
- Radius: `rounded-lg`
- Padding: `p-4`
- Label: 12px, `text-muted`
- Value: 22px, weight 500, `text-primary`
- Sub/trend: 11px, gold nếu trend tốt, danger nếu trend xấu.

## 7. Avatar

- Size mặc định: 36px
- Small: 28px
- Large: 44px
- Radius: `rounded-full`
- Border: `1.5px solid [role border color]`
- Background và text color theo role badge.
- Text: hai chữ cái viết tắt, 13px, weight 500.

## 8. Alert Và Toast

### Toast

Vị trí: góc phải dưới; tự dismiss sau 3 giây.

| Type | Icon | Border left | Text |
| --- | --- | --- | --- |
| success | `CheckCircle` | `#60B060` | Thao tác thành công |
| error | `XCircle` | `#E24B4A` | Có lỗi xảy ra |
| warning | `AlertTriangle` | `#C9A84C` | Cảnh báo |

Style chung: background `#1A1A1A`, border `0.5px solid #2E2E2E`, border left `3px solid [type color]`, `rounded-lg`, `p-4`, min width 280px.

### Inline Alert

Dùng cùng màu với toast, full width, cho form hoặc page header. Style: `rounded-lg`, `px-4 py-3`, 13px.

## 9. Modal Và Dialog

- Backdrop: `rgba(0,0,0,0.7)`
- Background: `#1A1A1A`
- Border: `0.5px solid #2E2E2E`
- Radius: `rounded-xl`
- Padding: `p-6`
- Width: mặc định `max-w-md`, loại large dùng `max-w-lg`.

Cấu trúc:

```text
[Title]           [X button]
-----------------------------
[Content / form]

[Ghost button]  [Primary button]
```

Quy tắc:

- Title dùng `heading-2`.
- X button dùng lucide `X`, `text-muted`, hover `text-primary`.
- Actions căn phải; Ghost trước Primary.
- Đóng khi click backdrop hoặc nhấn Escape, trừ modal bắt buộc.

## 10. Thông Báo Chỉ Hỗ Trợ Desktop

Hiển thị khi `owner` hoặc `manager` truy cập page chỉ hỗ trợ desktop trên màn hình dưới 1024px.

- Layout: full screen, căn giữa dọc và ngang.
- Background: `#111111`.
- Icon: lucide `Monitor`, size 48px, gold.
- Heading: "Vui lòng dùng máy tính", `heading-2`.
- Body: "Trang này chỉ hỗ trợ màn hình desktop (từ 1024px trở lên).", body text, `text-muted`.
- Không có button và không có link.

## 11. Navigation

### Sidebar

Chỉ dùng desktop cho owner, manager, superadmin.

- Width: 220px khi expanded.
- Background: `#0A0A0A`.
- Border right: `0.5px solid #2E2E2E`.
- Padding: `p-3`.
- Brand: dot vàng 8px + "BarberOS", 14px, weight 500.
- Nav item: `px-3 py-2`, `rounded-md`, 13px, `text-muted`, `gap-2`, lucide icon size 16px.
- Active: text gold, background `gold-bg`.

### Bottom Nav

Chỉ dùng mobile cho barber, skinner, receptionist.

- Fixed bottom.
- Background: `#0A0A0A`.
- Border top: `0.5px solid #2E2E2E`.
- Height: 56px.
- Tối đa 4 tab.
- Active: icon và label gold.
- Inactive: icon và label `text-muted`.
- Label: 11px.

### Top Nav

Navigation tablet cho receptionist.

- Background: `#0A0A0A`.
- Border bottom: `0.5px solid #2E2E2E`.
- Height: 52px.
- Padding: `px-4`.
- Tab active: text gold và border bottom `2px solid gold`.
- Tab inactive: `text-muted`.

## 12. Empty State

- Layout: flex column, căn giữa, `gap-3`.
- Padding: `py-16`.
- Icon: lucide, size 40px, `text-muted`.
- Text: 14px, `text-muted`.
- Button tùy chọn: variant Secondary.

## Quy Tắc Chung

- Không dùng trắng thuần `#FFFFFF`; dùng `text-primary` (`#F5F0E8`) cho text sáng.
- Không dùng border radius lớn hơn `rounded-xl`, trừ badge và avatar dùng `rounded-full`.
- Không dùng shadow lớn; dark UI tách surface bằng border.
- Icon library: chỉ dùng `lucide-react`. Không mix nhiều icon library.
- Spacing: dùng Tailwind spacing scale. Không hardcode px trong `className`.
