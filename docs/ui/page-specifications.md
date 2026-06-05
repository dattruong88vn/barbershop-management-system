# Page Specifications

## Login

Spec chi tiết:

- `docs/ui/screens/auth-screens.md`

Route:

- `/login`

API:

- `POST /api/auth/[...nextauth]`

Trạng thái:

- Loading: disable submit button.
- Error: username/password không hợp lệ.
- Success: redirect.
- Nếu `is_first_login = true`, redirect về `/change-password`.
- Nếu không, dùng callback/default route đã resolve.

---

## Change Password

Spec chi tiết:

- `docs/ui/screens/auth-screens.md`

Route:

- `/change-password`

API:

- `POST /api/change-password`

Trạng thái:

- Loading: disable submit button.
- Validation: password mismatch.
- Success: redirect theo `redirectTo` do `POST /api/change-password` trả về.
- Implementation hiện tại redirect staff roles về `/customers`, các role khác về `/dashboard`.

---

## Customer Search

Spec chi tiết:

- `docs/ui/screens/customer-search-screen.md`

Route:

- `/customers`

API:

- `GET /api/customers?search=`

Trạng thái:

- Loading: skeleton cards.
- Empty: không tìm thấy khách hàng.
- Error: không load được customers.

Hành động:

- Open customer.
- Create customer.

---

## Customer Create

API:

- `POST /api/customers`

Validation:

- Name bắt buộc.
- Phone bắt buộc.
- Phone unique.

Thành công:

- Navigate đến Customer Detail.

---

## Customer Detail

Route:

- `/customers/:id`

API:

- `GET /api/customers/:id/visits`

Sections:

- Customer Info
- Hair Photos
- Suggestions
- Visit History

Trạng thái:

- Loading
- Empty
- Error

---

## Create Visit

Route:

- TBD

Ghi chú route:

- Phải align với hằng số `ROUTES` trước khi implement.

API:

- `GET /api/visits`
- `POST /api/visits`

Data bắt buộc:

- Services
- Combos
- Barbers
- Skinners

Validation:

- Phải chọn ít nhất một service hoặc combo.

Thành công:

- Navigate đến Visit Detail.

---

## Visit Detail

Route:

- `/visits/:id`

API:

- `GET /api/visits/:id`
- `PATCH /api/visits/:id`

Trạng thái backend:

- `GET /api/visits/:id` là bắt buộc để load standalone Visit Detail.
- Backend hiện có `GET /api/visits`, `POST /api/visits`, và `PATCH /api/visits/:id`.
- Nếu chưa có `GET /api/visits/:id`, phải implement backend trước khi build màn hình này như một standalone route.
- Photo upload API chưa có.
- Action Upload Photo phải chờ backend/R2 upload support.

Sections:

- Visit Info
- Status
- Services
- Combos
- Barber
- Skinner
- Photos

Quy tắc:

- Chỉ được edit barber/skinner trong vòng 3 giờ.

Warning:

Hiển thị warning khi:

```text
Haircut Service
AND
No Photo
```

---

## Services List

Route:

- `/owner/services`

API:

- `GET /api/services`

Trạng thái:

- Loading
- Empty
- Error

Hành động:

- Create
- Edit
- Delete

---

## Service Form

API:

- `POST /api/services`
- `PATCH /api/services/:id`

Fields:

- Name
- Price
- Is Haircut

Validation:

- Name bắt buộc.
- Price bắt buộc.

---

## Combos List

Route:

- `/owner/combos`

API:

- `GET /api/combos`

Hành động:

- Create
- Edit
- Delete

---

## Combo Form

API:

- `POST /api/combos`
- `PATCH /api/combos/:id`

Fields:

- Name
- Description
- Price
- Services

Validation:

- Phải chọn ít nhất một service.

---

## Staff List

Route:

- `/owner/staff`

API:

- `GET /api/staff`

Hành động:

- Create
- Edit
- Delete

---

## Staff Form

API:

- `POST /api/staff`
- `PATCH /api/staff/:id`

Fields:

- Username
- Password
- Role
- Branch

Validation:

- Password >= 8 ký tự.

---

## Branch List

Route:

- `/owner/branches`

API:

- `GET /api/branches`

Hành động:

- Create
- Edit
- Delete

---

## Branch Form

API:

- `POST /api/branches`
- `PATCH /api/branches/:id`

Fields:

- Name
- Address

Validation:

- Name bắt buộc.

---

## Reports

Route:

- `/reports`

Trạng thái backend:

- Chưa implement.
- Report API chưa có.

UI hiện tại:

- Placeholder.

Widgets tương lai:

- Revenue
- Revenue by Branch
- Top Barbers
- Top Skinners
- Top Services
- Top Combos

---

## Dashboard

Route:

- `/dashboard`

Trạng thái backend:

- Phụ thuộc report APIs.
- Dashboard API chưa có.
- Chỉ dùng placeholder hoặc mock data cho đến khi có backend support.

UI hiện tại:

- Cho phép mock data.

Widgets:

- Revenue
- Visits
- New Customers
- Returning Customers

Charts:

- Revenue Trend
- Top Employees
- Top Services

---

## Superadmin Landing

Route:

- `/superadmin`

Hành động:

- Quản trị hệ thống
- Xem theo tiệm

Phạm vi tương lai:

- Chờ backend implementation.

---

## Trial Warning

Trạng thái backend:

- Trial warning cần session/API data cho `trialExpiresAt` và shop `status`.
- Data này chưa được xác nhận có trong UI/session contract hiện tại.
- Chỉ implement sau khi có backend/session support.

Điều kiện:

- Hiển thị warning khi trial còn 7 ngày hoặc ít hơn.

Hiển thị:

- Center modal sau khi login thành công.
