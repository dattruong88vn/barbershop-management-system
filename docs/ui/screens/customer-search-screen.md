# UI Screens: Customer Search

Màn hình tìm kiếm khách hàng — dùng cho receptionist, barber, skinner.

**Thiết bị:** Tablet (receptionist), Mobile (barber, skinner)
**Route:** `ROUTES.customers`
**Tham khảo component:** `ui-component-spec`

---

## Layout theo thiết bị

### Tablet — receptionist

Nằm trong top nav layout. Tab "Tìm khách" active.

```
┌─────────────────────────────────────────┐
│  [Logo]  [Hôm nay] [Tìm khách*] [Tạo]  │  ← Top nav
├─────────────────────────────────────────┤
│                                         │
│  [🔍 Tìm theo tên hoặc SĐT...]  [Tạo khách mới]  │
│                                         │
│  Tìm kiếm gần đây                       │
│  [chip] [chip] [chip]                   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Kết quả — N khách                      │
│  ┌─────────────────────────────────┐    │
│  │ [AV] Tên khách   SĐT · Lần cuối│ >  │
│  │                      [badge]   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ [AV] Tên khách   SĐT · Lần cuối│ >  │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile — barber, skinner

Màn hình riêng, có bottom nav.

```
┌──────────────────────┐
│ ←   Tìm khách    [+] │  ← Header
├──────────────────────┤
│ [🔍 Tên hoặc SĐT...] │
│                      │
│ Tìm kiếm gần đây     │
│ [chip] [chip]        │
│ ───────────────────  │
│ ┌──────────────────┐ │
│ │[AV] Tên   SĐT  > │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │[AV] Tên   SĐT  > │ │
│ └──────────────────┘ │
│                      │
├──────────────────────┤
│ [Hôm nay][Tìm*][+][📊]│  ← Bottom nav
└──────────────────────┘
```

---

## Components

### Search bar

**Input** — dùng `Search input`

- Placeholder: "Tìm theo tên hoặc số điện thoại..."
- Placeholder mobile: "Tên hoặc SĐT..."
- Tìm kiếm realtime khi user gõ — debounce 300ms
- Xoá text: hiển thị icon `X` bên phải khi có nội dung

**Button "Tạo khách mới"** — dùng `primary`, size `medium`

- Icon prefix: `UserPlus` từ lucide-react
- Label: "Tạo khách mới"
- Chỉ hiển thị trên tablet — mobile dùng icon `+` trên header
- Nhấn → mở modal tạo khách mới (xem phần Behavior)

### Recent searches

- Hiển thị tối đa 5 từ khoá tìm gần nhất, lưu trong `localStorage`
- Mỗi item là một `chip`: icon `Clock` + text từ khoá
- Nhấn chip → điền vào search input và trigger search ngay
- Section label: "Tìm kiếm gần đây" — dùng `text-label-12` uppercase
- Ẩn section này khi search input đang có nội dung

### Kết quả tìm kiếm

**Section label:** "Kết quả — N khách" — dùng `text-label-12` uppercase

**Customer card** — dùng `material-base`, full width

- Layout: `Avatar` | `Thông tin` | `Badge (nếu có)` | `ChevronRight`
- Nhấn vào card → navigate đến `ROUTES.customerDetail(id)`

Thông tin hiển thị trong card:

| Element      | Tablet                                               | Mobile                               |
| ------------ | ---------------------------------------------------- | ------------------------------------ |
| Avatar       | 36px, 2 chữ cái                                      | 32px, 2 chữ cái                      |
| Tên khách    | `text-label-14` strong                               | `text-label-13` strong               |
| SĐT          | `text-label-13`, màu `text-gray-700`                 | `text-label-12`, màu `text-gray-700` |
| Lần cuối ghé | `text-label-13`, màu `text-gray-700` (relative time) | Ẩn                                   |
| Số lần visit | Badge `gray`                                         | Ẩn                                   |
| Cảnh báo ảnh | Badge `warning` với icon `Image`                     | Icon `Image` nhỏ                     |
| Chevron      | `ChevronRight`, màu `text-gray-700`                  | `ChevronRight`                       |

**Warning badge ảnh:**

- Hiển thị nếu khách có visit chứa dịch vụ cắt tóc nhưng chưa có ảnh trong visit gần nhất
- Tablet: badge text "Chưa có ảnh", variant `warning`
- Mobile: chỉ icon `Image`, variant `warning`

### Empty states

**Chưa có từ khoá** (state mặc định khi vào trang):

- Không hiển thị danh sách
- Chỉ hiển thị recent searches (nếu có)
- Nếu không có recent searches: dùng `Empty state` — icon `Users`, text "Nhập tên hoặc số điện thoại để tìm khách"

**Không có kết quả:**

- Dùng `Empty state` — icon `SearchX`, text "Không tìm thấy khách nào"
- Button `secondary`: "Tạo khách mới" bên dưới

**Đang tìm kiếm (loading):**

- Hiển thị skeleton cards (3 rows) thay cho danh sách

---

## Modal: Tạo khách mới

Mở khi nhấn button "Tạo khách mới" hoặc button trong empty state.

Dùng `Modal / Dialog`, size `medium`.

```
Tạo khách mới                      [X]
────────────────────────────────────
Họ và tên *
[________________________]

Số điện thoại *
[________________________]

                    [Huỷ] [Tạo khách]
```

**Input: Họ và tên** — bắt buộc, `Text input`

- Validate khi submit: không được để trống

**Input: Số điện thoại** — bắt buộc, `Text input`

- Validate khi submit: đúng định dạng SĐT Việt Nam (10 số, bắt đầu bằng 0)
- Validate trùng: nếu SĐT đã tồn tại → hiển thị inline error "Số điện thoại đã được đăng ký" + link đến hồ sơ khách đó

**Button "Huỷ"** — `ghost`, đóng modal
**Button "Tạo khách"** — `primary`, submit form

- Loading state khi đang gọi API
- Sau khi tạo thành công → đóng modal → hiển thị success Toast title "Tạo khách thành công", description "[Tên khách] đã được thêm vào hệ thống." → chờ khoảng 1 giây để user đọc toast → navigate đến `ROUTES.customerDetail(id)` của khách vừa tạo

---

## Behavior

- Tìm kiếm realtime, debounce 300ms — không cần nhấn Enter
- Kết quả tìm theo: tên (contains, không phân biệt hoa thường, không dấu) và SĐT (contains)
- Sau khi tìm, lưu từ khoá vào recent searches (deduplicate, giữ 5 gần nhất)
- Scroll danh sách kết quả — không phân trang ở MVP, load tối đa 20 kết quả
