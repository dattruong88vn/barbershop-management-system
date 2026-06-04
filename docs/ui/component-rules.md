# Component Rules

`docs/ui/component-spec.md` là nguồn chuẩn cho visual style, token, state và variant của component.

File này mô tả quy tắc hành vi và cách dùng component theo màn hình. Nếu chi tiết styling khác nhau, luôn theo `docs/ui/component-spec.md`.

## Button

Dùng các variant trong `docs/ui/component-spec.md`:

- Primary
- Secondary
- Ghost
- Danger

Quy tắc:

- Mỗi section chỉ nên có một primary action.
- Tránh dùng hơn hai primary button trong cùng một view.
- Button loading giữ nguyên text, có spinner bên trái, và disable click.

## Form

Dùng:

- React Hook Form
- Zod

Quy tắc:

- Label nằm phía trên field.
- Field bắt buộc phải được đánh dấu.
- Inline validation hiển thị dưới field liên quan.
- Password input có toggle show/hide.
- Search input có icon search.

## Table

Chỉ dùng trên desktop.

Tính năng kỳ vọng:

- Search
- Sort
- Pagination

## Customer Card

Fields:

- Avatar
- Name
- Phone
- Last Visit
- Last Barber

Hành động:

- View Detail
- Create Visit

## Visit Card

Fields:

- Customer
- Services
- Status
- Created Time

Hành động:

- Open Detail

## Haircut Warning

Điều kiện:

- Visit có dịch vụ haircut.
- Chưa upload photo.

Hiển thị:

- Dùng inline warning alert với `AlertTriangle` từ `lucide-react`.
- Text: `Chưa upload ảnh kiểu tóc`

Vị trí:

- Visit List
- Visit Detail
- Dashboard

## Service Card

Fields:

- Name
- Price
- Haircut Badge

Haircut badge hiển thị khi `isHaircut = true`.

## Combo Card

Fields:

- Name
- Description
- Price
- Included Services

## Empty State

Mỗi màn hình phải có:

- Loading state
- Empty state
- Error state

Theo style empty state trong `docs/ui/component-spec.md`.

## Dialog Rules

Được phép:

- Create
- Edit
- Confirm Delete

Không được phép:

- Nested dialog
- Dialog bên trong dialog

## Mobile Rules

- Touch target tối thiểu 44px.
- Primary CTA nên sticky bottom khi đó là hành động chính của workflow mobile.
- Search luôn hiển thị trên các màn hình search/list.

## Responsive Rules

- Mobile: 0-767px
- Tablet: 768-1023px
- Desktop: từ 1024px trở lên
- Bắt buộc thiết kế mobile first.

## Role-Based Navigation

- Owner, manager và superadmin dùng desktop sidebar.
- Barber, skinner và receptionist dùng mobile bottom navigation cho các workflow mobile được hỗ trợ.
- Receptionist có thể dùng tablet top navigation ở nơi đã document.
- Owner và manager thấy thông báo chỉ hỗ trợ desktop trên màn hình dưới 1024px.
