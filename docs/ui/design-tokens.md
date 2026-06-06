# Design Tokens

`docs/ui/component-spec.md` là nguồn chuẩn cho token UI và style component.

File này chỉ là mục lục nhanh. Nếu thiếu giá trị hoặc có điểm mơ hồ, luôn theo `docs/ui/component-spec.md`.

## Theme

- UI sản phẩm dùng Geist-style light/dark theme, tự đổi theo `prefers-color-scheme`.
- Neutral/gray là nền tảng chính cho layout, surface, border và text.
- Gold không phải màu chủ đạo của UI. Chỉ dùng gold như accent rất hạn chế khi có yêu cầu riêng về brand hoặc marketing surface.
- Không dùng trắng thuần (`#FFFFFF`) làm background chủ đạo của UI. Nếu cần màu sáng, dùng token Geist tương ứng như `bg-gray-100`, `bg-background-100`, `text-gray-1000`.
- Dùng system font stack mặc định của Tailwind (`font-sans`). Không import custom font.

## Màu Sắc

### Geist Neutral Scale

Luôn ưu tiên các token trong `docs/ui/component-spec.md`:

- Background: `bg-background-100`, `bg-background-200`, `bg-gray-100`, `bg-gray-200`, `bg-gray-300`
- Border: `border-gray-400`, `border-gray-500`, `border-gray-600`
- Text: `text-gray-1000`, `text-gray-900`, `text-gray-700`

Không dùng trực tiếp `dark-*`, `text-primary`, `text-secondary`, hoặc `text-muted` cho màn hình app mới nếu token Geist đã đáp ứng được.

### Status Colors

Status color phải theo mục trạng thái trong `component-spec.md`:

- Success / completed: `text-green-900`, `bg-green-100`
- Info / in_progress: `text-blue-900`, `bg-blue-100`
- Warning / pending / missing photo: `text-amber-900`, `bg-amber-100`
- Error / danger: `text-red-900`, `bg-red-100`

`amber` là warning/status color, không phải brand gold.

### Legacy Gold Accent

Các biến `gold-*` hiện vẫn tồn tại trong `globals.css` để tránh phá vỡ code cũ, nhưng không dùng làm mặc định cho app surface, heading, button, badge hoặc warning mới.

Nếu cần dùng gold, giới hạn ở các trường hợp:

- Brand highlight nhỏ
- Illustration/marketing surface
- Asset hoặc motif có yêu cầu rõ ràng từ design

## Typography

- Heading chính: dùng Geist typography class (`text-heading-*`) với `text-gray-1000`.
- Label/body phụ: dùng `text-label-*` hoặc `text-copy-*` với `text-gray-900` / `text-gray-700`.
- Không dùng gold cho heading mặc định.

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
