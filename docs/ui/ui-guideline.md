# UI Guideline

## Design Principles

### Mobile First

Ưu tiên trải nghiệm cho:

- Receptionist
- Barber
- Skinner

Mọi màn hình phải thiết kế mobile trước.

Desktop là phiên bản mở rộng.

---

## Speed First

Mục tiêu:

- Tìm khách < 3 giây
- Tạo visit < 10 giây
- Upload ảnh < 5 giây

Mọi quyết định UI phải phục vụ mục tiêu này.

---

## Consistency

Không tự tạo style riêng cho từng màn hình.

Toàn bộ app sử dụng:

- Design Tokens
- Component Rules
- Navigation Rules

---

## Layout Rules

### Mobile

```text
Header

Content

Sticky Action Area
```

Padding:

```text
16px
```

---

### Desktop

```text
Sidebar
|
|-- Page Header
|-- Content
```

Padding:

```text
24px
```

---

## Form Rules

### Labels

Luôn hiển thị phía trên input.

Đúng:

Tên khách hàng
[input]

Sai:

[input placeholder="Tên khách hàng"]

---

### Validation

Hiển thị ngay dưới field.

Ví dụ:

```text
Số điện thoại đã tồn tại.
```

---

### Required Fields

Dùng dấu \*

Ví dụ:

```text
Tên khách hàng *
```

---

## Search Rules

Search luôn nằm trên cùng màn hình.

Không được đặt trong modal.

Search phải:

- Auto focus trên mobile
- Debounce 300ms
- Clear button

---

## Card Rules

Card là component chính của mobile.

Card phải:

- Border nhẹ
- Radius 12px
- Padding 16px

Không dùng table trên mobile.

---

## Table Rules

Chỉ dùng cho desktop.

Modules:

- Services
- Combos
- Staff
- Branches
- Reports

---

## Status Rules

Pending

- Gray Badge

In Progress

- Blue Badge

Completed

- Green Badge

---

## Warning Rules

Haircut Service

-

No Photo

↓

Hiển thị warning.

Ưu tiên màu Amber.

---

## Dialog Rules

Cho phép:

- Create
- Edit
- Confirm Delete

Không cho phép:

- Nested Dialog
- Multi-step Dialog

---

## Empty State

Mọi màn hình phải có:

- Loading State
- Empty State
- Error State

---

## Responsive Rules

Mobile

0-767px

Tablet

768-1023px

Desktop

1024px+

---

## Accessibility

Touch Target

> = 44px

Text

> = 14px

Interactive Components

Keyboard Accessible
