# Page Specifications

## Data Fetching

- Client page data dùng TanStack Query không refetch khi browser/window focus lại.
- Mặc định page fetch dữ liệu khi user truy cập page hoặc reload browser.
- Chỉ refetch thêm khi query key thay đổi, mutation/action invalidate query, hoặc UI gọi refetch chủ động.

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
- Backend snapshot tên, giá và `responsibleRole` của service/combo vào `visit_services`.
- Với combo, backend lưu từng service con và phân bổ doanh thu theo `combo.price / sum(service.price)`; dòng cuối nhận chênh lệch làm tròn.

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

Roles:

- `owner`, `manager`

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
- Responsible Role (`barber` hoặc `skinner`)
- Is Haircut

Validation:

- Name bắt buộc.
- Price bắt buộc.
- Responsible Role bắt buộc.

---

## Combos List

Route:

- `/owner/combos` (`ROUTES.ownerCombos`)

Roles:

- `owner`, `manager`

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
- Giá combo lớn hơn tổng giá dịch vụ lẻ chỉ cảnh báo ở UI, không chặn backend.

---

## Staff List

Route:

- `/owner/staff` (`ROUTES.ownerStaff`)

Roles:

- `owner`, `manager`

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

Purpose:

- Reports là audit + analysis: dùng để phân tích sâu, đối soát doanh thu phân bổ, xem bảng/biểu đồ chi tiết và drill-down theo kỳ/nhân sự/dịch vụ.
- Tổng quan không thay thế Reports; tổng quan chỉ hiển thị overview nhanh và action alerts.

UI hiện tại:

- Staff roles (`receptionist`, `barber`, `skinner`) dùng dữ liệu thật từ personal report API, có section thông tin nhân viên và dropdown kỳ báo cáo.
- Bộ chọn kỳ báo cáo mặc định tháng hiện tại, gồm các lựa chọn Tháng/Năm hiện tại/Tất cả thời gian. Khi chọn Tháng, hiển thị month picker giới hạn từ 12 tháng gần nhất đến tháng hiện tại.
- Owner/manager vẫn là placeholder.

Widgets tương lai:

- Revenue
- Revenue by Branch
- Top Barbers
- Top Skinners
- Top Services
- Top Combos

Reporting data:

- Reports phải dùng `visit_services.allocated_price` và snapshot fields.
- Không tính report bằng tên/giá service hoặc combo hiện tại.
- Doanh thu thiếu barber/skinner tương ứng hiển thị trong nhóm `Chưa xác định`.

---

## Tổng quan

Route:

- `/dashboard` (`ROUTES.dashboard`)

Trạng thái backend:

- Tổng quan API đã có: `GET /api/dashboard?period=month|year|all&month=YYYY-MM`.
- API chỉ cho `owner` và `manager`, scoped theo `shop_id`, và dùng `visit_services.allocated_price` + snapshot fields.

Purpose:

- Tổng quan là overview nhanh + action alerts: dùng để scan tình hình vận hành hiện tại/kỳ đang xem và nhắc việc cần xử lý ngay.
- Tổng quan không dùng cho đối soát chi tiết; phần đó thuộc Reports.

UI hiện tại:

- Page header chỉ hiển thị title `Tổng quan`, không hiển thị description/subtitle.
- Bộ chọn kỳ dùng 3 tabs: `Tháng`, `Năm hiện tại`, `Tất cả thời gian`.
- Mặc định chọn tab `Tháng` với tháng hiện tại.
- Khi tab `Tháng` active, hiển thị badge action `Chọn tháng` để mở month picker; month picker chỉ cho chọn từ 12 tháng gần nhất đến tháng hiện tại.
- Toàn bộ phần dữ liệu bên dưới filter nằm trong một global card chung, không lồng global card bên trong global card.
- Card dữ liệu dùng title theo kỳ đang chọn: tên tháng được chọn, `Năm hiện tại`, hoặc `Tất cả thời gian`.
- Tất cả title trong Tổng quan phải viết hoa chữ đầu, bao gồm title kỳ được chọn.

Widgets:

- Revenue
- Visits
- New Customers
- Returning Customers
- Revenue Trend
- Top Barbers
- Top Skinners
- Top Services
- Top Combos
- Haircut visits missing photos

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
