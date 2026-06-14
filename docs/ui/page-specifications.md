# Page Specifications

## Login

Spec chi tiết:

- `docs/SCREENS.md`

Route:

- `/login` (`ROUTES.login`)

API:

- `POST /api/auth/[...nextauth]`

Trạng thái:

- Loading: disable submit button.
- Error: username/password không hợp lệ.
- Success: redirect.
- Nếu `is_first_login = true`, redirect về `/change-password` (`ROUTES.changePassword`).
- Nếu không, dùng callback/default route đã resolve.

---

## Change Password

Spec chi tiết:

- `docs/SCREENS.md`

Route:

- `/change-password` (`ROUTES.changePassword`)

API:

- `POST /api/change-password`

Trạng thái:

- Loading: disable submit button.
- Validation: password mismatch.
- Success: redirect theo `redirectTo` do `POST /api/change-password` trả về.
- Implementation hiện tại redirect staff roles về `/customers` (`ROUTES.customers`), các role khác về `/dashboard` (`ROUTES.dashboard`).

---

## Customer Search

Spec chi tiết:

- `docs/SCREENS.md`

Route:

- `/customers` (`ROUTES.customers`)

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

Spec chi tiết:

- `docs/SCREENS.md`

Route:

- `/customers/:id` (`ROUTES.customerDetail(id)`)

API:

- `GET /api/customers/:id/visits`
- `PATCH /api/customers/:id`

Sections:

- Header / Breadcrumb
- Profile header
- Metric cards
- Suggestions from last visit
- Recent hair photos
- Completed visit history
- Edit customer modal

Trạng thái:

- Loading
- Empty
- Error

Quy tắc:

- Visit history chỉ hiển thị visit `completed`.
- Chu kỳ ghé tính từ khoảng cách trung bình giữa các visit completed.
- Sửa SĐT khách không ảnh hưởng lịch sử visit vì visit liên kết bằng `customer_id`.

---

## Create Visit

Route:

- `/visits/create` (`ROUTES.createVisit`)

Ghi chú route:

- Route dùng hằng số `ROUTES.createVisit`.

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
- Không được chọn đồng thời service và combo trong cùng visit.
- Khi chọn combo, UI phải tự uncheck toàn bộ service đã chọn.
- Khi chọn service, UI phải tự uncheck toàn bộ combo đã chọn.

Thành công:

- Navigate đến Visit Detail.

---

## Visit Detail

Route:

- `/visits/:id` (`ROUTES.visitDetail(id)`)

API:

- `GET /api/visits/:id`
- `PATCH /api/visits/:id`

Trạng thái backend:

- `GET /api/visits/:id` là bắt buộc để load standalone Visit Detail.
- Backend hiện có `GET /api/visits`, `POST /api/visits`, và `PATCH /api/visits/:id`.
- Nếu chưa có `GET /api/visits/:id`, phải implement backend trước khi build màn hình này như một standalone route.
- Photo upload API chưa có.
- Action Upload Photo phải chờ backend/R2 upload support và chỉ hiển thị/cho phép với role `barber`.

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
- Chỉ role `barber` được upload ảnh kiểu tóc.
- Receptionist, skinner, manager và owner chỉ được xem ảnh/cảnh báo ảnh, không được upload ảnh.

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

- `/owner/services` (`ROUTES.ownerServices`)

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

- `/owner/combos` (`ROUTES.ownerCombos`)

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

- `/owner/staff` (`ROUTES.ownerStaff`)

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

- `/owner/branches` (`ROUTES.ownerBranches`)

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

- `/reports` (`ROUTES.reports`)

Trạng thái backend:

- Personal report cho nhân viên đã có: `GET /api/reports/personal?period=month|year|all&month=YYYY-MM`.
- Owner/manager report API chưa có.

UI hiện tại:

- Staff roles (`receptionist`, `barber`, `skinner`) dùng dữ liệu thật từ personal report API, có section thông tin nhân viên và dropdown kỳ báo cáo.
- Bộ chọn kỳ báo cáo mặc định tháng hiện tại, gồm checkbox Tháng/Năm hiện tại/Tất cả thời gian. Khi chọn Tháng, hiển thị month picker giới hạn từ 12 tháng gần nhất đến tháng hiện tại.
- Owner/manager vẫn là placeholder.

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

- `/dashboard` (`ROUTES.dashboard`)

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

- Chưa có route constant trong `ROUTES`; không hardcode route cho đến khi `src/constants/routes/appRoutes.ts` được cập nhật.

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
