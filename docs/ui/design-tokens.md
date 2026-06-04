# Design Tokens

`docs/ui/component-spec.md` là nguồn chuẩn cho token UI và style component.

File này chỉ là mục lục nhanh. Nếu thiếu giá trị hoặc có điểm mơ hồ, luôn theo `docs/ui/component-spec.md`.

## Theme

- UI sản phẩm dùng dark theme với điểm nhấn gold.
- Không dùng trắng thuần (`#FFFFFF`) cho text hoặc background UI.
- Dùng system font stack mặc định của Tailwind (`font-sans`). Không import custom font.

## Màu Sắc

### Dark Scale

- `dark-100`: `#0A0A0A`
- `dark-200`: `#111111`
- `dark-300`: `#1A1A1A`
- `dark-400`: `#222222`
- `dark-500`: `#2E2E2E`
- `dark-600`: `#3D3D3D`

### Gold Accent

- `gold-bg`: `#2A2010`
- `gold-muted`: `#8B6F35`
- `gold`: `#C9A84C`
- `gold-light`: `#E8C97A`
- `gold-pale`: `#F5E9C4`

### Text

- `text-primary`: `#F5F0E8`
- `text-secondary`: `#A89B80`
- `text-muted`: `#6B6055`

### Trạng Thái

- Success: text `#60B060`, background `#0A1A0A`, border `#3A6A3A`
- Info: text `#4A9EE0`, background `#0A1828`, border `#185FA5`
- Warning: text `#C9A84C`, background `#2A2010`, border `#8B6F35`
- Danger: text `#E24B4A`, background `#1A0A0A`, border `#793030`

## Typography

- `heading-1`: 22px, weight 500, `text-primary`
- `heading-2`: 18px, weight 500, `text-primary`
- `heading-3`: 15px, weight 500, `gold`
- `body`: 14px, weight 400, `text-secondary`
- `small`: 13px, weight 400, `text-secondary`
- `caption`: 12px, weight 400, `text-muted`
- `micro`: 11px, weight 400, `text-muted`

## Bo Góc Và Spacing

- Dùng Tailwind spacing scale thay vì hardcode pixel trong class.
- Card và dialog dùng tối đa `rounded-xl`.
- Badge và avatar dùng `rounded-full`.
- Tránh shadow lớn; dùng border để tách lớp trong dark UI.

## Layout

- Sidebar desktop khi mở rộng: 220px.
- Bottom navigation trên mobile: 56px.
- Top navigation trên tablet cho receptionist: 52px.
- Breakpoint chỉ hỗ trợ desktop: từ 1024px trở lên.
