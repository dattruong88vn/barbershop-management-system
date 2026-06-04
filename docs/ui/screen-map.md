# Screen Map

## Auth

### Login

Route: `/login`

Tính năng:

- Username
- Password
- Submit

### Change Password

Route: `/change-password`

Tính năng:

- New Password
- Confirm Password
- Validation
- Redirect sau khi thành công

---

## Khu Vực Staff

### Customer Search

Route: `/customers`

Tính năng:

- Search theo tên
- Search theo số điện thoại
- Danh sách khách hàng
- Tạo khách hàng
- Mở customer detail
- Tạo visit nhanh

### Customer Create

Tính năng:

- Name
- Phone

Validation:

- Name bắt buộc
- Phone bắt buộc
- Phone unique theo shop

### Customer Detail

Route: `/customers/:id`

Sections:

- Customer Information
- Hair Photos
- Visit History
- Suggestions

Hành động:

- Create Visit

### Create Visit

Route: TBD

Ghi chú:

- Phải align với hằng số `ROUTES` trước khi implement.

Sections:

- Customer
- Services
- Combos
- Barber
- Skinner
- Total Price

Hành động:

- Save Visit

### Visit Detail

Route: `/visits/:id`

API:

- Cần `GET /api/visits/:id` để load standalone visit detail.
- Backend hiện có `GET /api/visits`, `POST /api/visits`, và `PATCH /api/visits/:id`.
- Nếu chưa implement `GET /api/visits/:id`, phải thêm backend trước khi build màn hình này như một standalone route.

Sections:

- Visit Information
- Services
- Combos
- Barber
- Skinner
- Photos

Hành động:

- Upload Photo
- Edit Barber
- Edit Skinner

Warning:

- Haircut service chưa có photo

---

## Khu Vực Owner

### Dashboard

Route: `/dashboard`

Trạng thái backend:

- Phụ thuộc report/dashboard APIs.
- UI hiện tại có thể dùng placeholder hoặc mock data cho đến khi backend APIs được implement.

Widgets:

- Revenue
- Total Visits
- New Customers
- Returning Customers

Charts:

- Revenue Trend
- Top Barbers
- Top Skinners
- Top Services
- Top Combos

### Services

- List
- Create
- Edit
- Delete

### Combos

- List
- Create
- Edit
- Delete

### Staff

- List
- Create
- Edit
- Delete

### Branches

- List
- Create
- Edit
- Delete

### Reports

Route: `/reports`

Trạng thái backend:

- Report API chưa được implement.
- Màn hình này nên giữ placeholder/mock cho đến khi có backend support.

Tính năng:

- Revenue
- Branch Analytics
- Top Employees
- Top Services
- Top Combos

---

## Superadmin

### Landing

Hành động:

- Quản trị hệ thống
- Xem theo tiệm
