# Component Rules

`docs/ui/component-spec.md` là nguồn chuẩn cho visual style, token, state và variant của component.

File này mô tả quy tắc hành vi và cách dùng component theo màn hình. Nếu chi tiết styling khác nhau, luôn theo `docs/ui/component-spec.md`.

## Component Placement

Ưu tiên viết component tái sử dụng vào:

- `src/components/design-system/`

Component trong folder module chỉ dùng khi component có đặc điểm cụ thể của module như layout composition, data shape, hoặc behavior riêng.

Component module phải kế thừa/compose từ design-system primitives/components, không tự định nghĩa lại visual base.

Component size:

- Tách component màn hình/module lớn thành child components theo section, panel, list, row và form field.
- Route/view component chỉ nên quản lý orchestration, state wiring và layout cấp cao.
- Không để một file component mới chứa toàn bộ header, form, list, sidebar, modal/lightbox và row rendering nếu các phần đó có thể tách theo ownership rõ ràng.

Với module có nhiều page, phân loại component theo page folder:

- Component dùng chung trong cả module đặt ở root module, ví dụ `src/components/customers/CustomerAvatar.tsx`.
- Component chỉ phục vụ Customer Search đặt trong `src/components/customers/search/`.
- Component chỉ phục vụ Customer Profile/Customer Detail đặt trong `src/components/customers/profile/`.
- Không đặt page-specific component ở root module nếu component chỉ dùng cho một page.

Ví dụ:

- `Skeleton` primitive nằm trong `src/components/design-system/`.
- Skeleton riêng của Customer Profile có thể nằm trong customer module nếu nó chỉ mô tả bố cục từng vùng của màn đó, nhưng phải dùng `Skeleton` primitive.

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

## Success Feedback

- Mọi thao tác người dùng hoàn tất thành công phải hiển thị success toast.
- Nếu thao tác thành công điều hướng sang màn hình khác, dispatch toast trước khi điều hướng bằng app router để toast không bị mất do full page reload.

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

Upload permission:

- Chỉ role `barber` được thấy và dùng action upload ảnh kiểu tóc.
- Các role khác chỉ được xem ảnh/cảnh báo ảnh.

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
