# UI Screens: Customer Profile

Màn hình hồ sơ khách hàng — dùng cho receptionist, barber, skinner.

**Thiết bị:** Tablet (receptionist), Mobile (barber, skinner)
**Route:** `ROUTES.customerDetail(id)`
**Tham khảo component:** `ui-component-spec`

---

## Layout theo thiết bị

### Tablet — receptionist

```
┌───────────────────────────────────────────────┐
│ ← Tìm khách > Nguyễn Văn A    [Sửa] [Tạo visit] │  ← Breadcrumb + actions
├───────────────────────────────────────────────┤
│                                               │
│  [AV]  Nguyễn Văn A                          │
│        0912 345 678                           │
│        Lần cuối: hôm qua · 14:30             │
│        [12 lần] [⚠ Chưa có ảnh]             │
│                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 12       │ │ 850.000đ │ │ 14 ngày  │      │
│  │ lần visit│ │ chi tiêu │ │ chu kỳ   │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                               │
│  ────────────────────────────────────────     │
│  Gợi ý từ lần trước                          │
│  [✂ Cắt + Gội]  [👤 Barber: Tuấn]  [👤 Skinner: Minh] │
│                                               │
│  ────────────────────────────────────────     │
│  Ảnh kiểu tóc gần nhất                       │
│  [img] [img] [img] [+5]                       │
│                                               │
│  ────────────────────────────────────────     │
│  Lịch sử visit                               │
│  • Cắt tóc + Gội    hôm qua · Tuấn · 70k  > │
│  • Combo cắt+gội    14/05 · Tuấn · 100k   > │
│  • Cắt tóc          01/05 · Minh · 50k    > │
│                                               │
└───────────────────────────────────────────────┘
```

### Mobile — barber, skinner

```
┌──────────────────────┐
│ ←  Hồ sơ khách   [⋮] │  ← Header + menu
├──────────────────────┤
│ [AV] Nguyễn Văn A   │
│      0912 345 678    │
│                      │
│ [12 lần][850k][14d]  │  ← Metric row
│                      │
│ Gợi ý lần trước      │
│ [✂ Cắt+Gội] [Tuấn]  │
│                      │
│ Ảnh gần nhất         │
│ [img][img][+5]       │
│                      │
│ Lịch sử              │
│ • Cắt + Gội  70k  >  │
│ • Combo      100k >  │
│                      │
├──────────────────────┤
│ [Hôm nay][Tìm*][+][📊]│
└──────────────────────┘
```

---

## Components

### Header / Breadcrumb

**Tablet:**

- Breadcrumb: "Tìm khách" (link → `ROUTES.customers`) > "Tên khách" — dùng `text-label-13`, màu `text-gray-700` > `text-gray-1000`
- Button "Sửa" — `secondary`, size `small`, icon `Pencil`
- Button "Tạo visit" — `primary`, size `small`, icon `Plus`

**Mobile:**

- Icon `ArrowLeft` bên trái → back về `ROUTES.customers`
- Title "Hồ sơ khách" — `text-label-14` strong, căn giữa
- Icon `DotsVertical` bên phải → dropdown menu: "Sửa thông tin", "Tạo visit"

### Profile header

**Avatar** — dùng `Avatar`, size `large` (44px tablet / 40px mobile), 2 chữ cái viết tắt

**Tên khách** — `text-heading-20` (tablet) / `text-label-14` strong (mobile)

**SĐT** — `text-label-13`, màu `text-gray-700`, icon `Phone`

**Lần cuối ghé** — `text-label-13`, màu `text-gray-700`, icon `Calendar`. Format: relative time ("hôm qua", "3 ngày trước") + giờ cụ thể. Ẩn trên mobile.

**Badges:**

- Số lần visit: Badge `gray`, icon `Repeat`, text "N lần"
- Cảnh báo ảnh: Badge `warning`, icon `Photo`, text "Chưa có ảnh" — chỉ hiện nếu visit gần nhất có dịch vụ cắt tóc nhưng chưa có ảnh

### Metric cards

3 metric cards ngang nhau — dùng `Metric card`:

| Metric         | Label            | Format                                           |
| -------------- | ---------------- | ------------------------------------------------ |
| Tổng lần visit | "Tổng lần visit" | Số nguyên                                        |
| Tổng chi tiêu  | "Tổng chi tiêu"  | `N.NNNđ` (rút gọn: 850k, 1.2tr)                  |
| Chu kỳ ghé     | "Chu kỳ ghé"     | "N ngày" (trung bình khoảng cách giữa các visit) |

Nếu chưa đủ dữ liệu tính chu kỳ (< 2 visit): hiển thị "—"

### Gợi ý từ lần trước

Chips hiển thị thông tin từ visit gần nhất của khách:

- Dịch vụ/combo đã dùng — icon `Scissors`
- Barber đã phục vụ — icon `User`, text "Barber: [tên]"
- Skinner đã phục vụ (nếu có) — icon `User`, text "Skinner: [tên]"

Nếu chưa có visit nào: ẩn section này.

### Ảnh kiểu tóc gần nhất

Grid ảnh thumbnail:

- Tablet: 4 cột
- Mobile: 3 cột
- Tối đa hiển thị 3 ảnh (tablet: 3) + 1 ô "+N" nếu còn nhiều hơn
- Nhấn vào ảnh → mở lightbox xem ảnh full size
- Nhấn "+N" → xem tất cả ảnh (navigate đến tab ảnh hoặc mở modal)
- Nếu chưa có ảnh nào: dùng `Empty state` nhỏ — icon `Photo`, text "Chưa có ảnh"

### Lịch sử visit

Danh sách các visit đã completed, sắp xếp mới nhất trước.

Mỗi visit row gồm:

- Dot màu theo status (completed = success)
- Tên dịch vụ/combo — `text-label-13` strong
- Meta: ngày · barber · tổng tiền — `text-label-12`, màu `text-gray-700`
- Badge status
- Icon `ChevronRight` → navigate đến `ROUTES.visitDetail(id)`

**Tablet:** Hiển thị thêm barber name trong meta
**Mobile:** Ẩn barber name, chỉ giữ ngày + tiền

Tải 10 visit gần nhất. Có nút "Xem thêm" nếu còn nhiều hơn.

---

## Modal: Sửa thông tin khách

Mở khi nhấn button "Sửa" (tablet) hoặc menu item "Sửa thông tin" (mobile).

Dùng `Modal / Dialog`, size `medium`.

```
Sửa thông tin khách               [X]
────────────────────────────────────
Họ và tên *
[________________________]

Số điện thoại *
[________________________]

                    [Huỷ] [Lưu thay đổi]
```

**Input: Họ và tên** — prefill tên hiện tại, bắt buộc
**Input: Số điện thoại** — prefill SĐT hiện tại, bắt buộc, validate định dạng VN

- Nếu SĐT mới trùng với khách khác → error inline "Số điện thoại đã được đăng ký bởi khách khác"

**Button "Huỷ"** — `ghost`, đóng modal
**Button "Lưu thay đổi"** — `primary`, loading state khi submit

- Sau khi lưu thành công → đóng modal → toast success → cập nhật UI

---

## Behavior

- Nhấn "Tạo visit" → navigate đến trang tạo visit với customer_id được prefill
- Lịch sử visit chỉ hiển thị visit `completed` — không hiển thị `pending` hay `in_progress`
- Chu kỳ ghé tính bằng trung bình khoảng cách (ngày) giữa các visit completed
- Ảnh lấy từ tất cả visit của khách, sắp xếp mới nhất trước
