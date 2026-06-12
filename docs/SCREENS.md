# Screens Specification

> Spec chi tiết từng màn hình MVP để AI agent (Codex, Claude, Cursor) implement.
> Đây là tài liệu nguồn hợp nhất cho toàn bộ UI screen spec.
>
> Trước khi code, đọc theo thứ tự trong `AGENTS.md`:
> `AGENTS.md` → `CONTEXT.md` → `docs/SCREENS.md`.
>
> Bản preview trực quan (responsive, Geist theme) của toàn bộ màn hình này được
> dựng bằng v0; dùng nó như reference layout, KHÔNG copy code preview vào repo
> vì preview không tuân theo các convention `ROUTES` / `fetchClient` / `texts`.

## Quy ước áp dụng cho mọi màn hình

Tham chiếu `AGENTS.md` — các điểm liên quan trực tiếp tới UI:

- Điều hướng dùng hằng số `ROUTES`; gọi API dùng `API_ROUTES`. Không hardcode path.
- Điều hướng client phải dùng Next navigation (`router.push`, `router.replace`, `redirect`, hoặc `Link`). Tuyệt đối không dùng `window.location`, `window.location.href`, hoặc `window.location.assign`.
- Client Component / hook dùng `fetchClient` từ `@/lib/fetchClient`. Server Component dùng `fetchServer` từ `@/lib/fetchServer`. Không gọi `fetch` trực tiếp.
- Mọi chuỗi UI đặt trong `src/constants/texts/`. Không hardcode text trong component.
- Mọi thao tác thành công phải hiển thị success toast; nếu có điều hướng sau thành công, toast phải được dispatch trước khi điều hướng bằng app router.
- Type/interface dùng chung đặt trong `src/types/`. Không định nghĩa trong component.
- Dùng shadcn/ui khi có thể. TypeScript strict, không dùng `any`.
- Mỗi bảng thuộc tenant phải enforce `shop_id`.
- Roles: `superadmin`, `owner`, `manager`, `receptionist`, `barber`, `skinner`.
- Visit status: `pending`, `in_progress`, `completed`.
- Sửa barber/skinner chỉ trong vòng 3 giờ sau `completed_at`.
- Cảnh báo khi visit có dịch vụ `is_haircut = true` mà chưa có ảnh.

## Design system

- Theme: Geist neutral (light/dark). Nền neutral/gray là chủ đạo; gold chỉ là accent rất hạn chế.
- Font: system (`font-sans`). Border thay cho shadow. Bo góc tối đa `rounded-xl`.
- Status color: amber = pending, blue = in_progress, green = completed, red = lỗi/destructive.
- Chi tiết: `CONTEXT.md`, `docs/ui/component-spec.md`, `docs/ui/navigation.md`.

## Responsive

- Một codebase responsive. Màn tác nghiệp của nhân viên ưu tiên mobile; màn quản lý (owner) ưu tiên desktop.
- Mỗi spec bên dưới ghi `Ưu tiên` để biết breakpoint nào quan trọng nhất.

---

## 1. Login

- **Route:** `/login` (`ROUTES.login`)
- **Roles:** tất cả (chưa đăng nhập)
- **Ưu tiên:** mobile
- **Sections:** logo/brand, form đăng nhập
- **Fields:** `username` (text, required), `password` (password, required)
- **Actions:** Submit → đăng nhập
- **States:** idle, submitting, error (sai thông tin đăng nhập)
- **Notes:** auth username/password only. Sau khi đăng nhập, nếu là lần đầu của nhân viên → ép sang `/change-password` (`ROUTES.changePassword`). Superadmin → Landing.

## 2. Change Password

- **Route:** `/change-password` (`ROUTES.changePassword`)
- **Roles:** mọi user cần đổi mật khẩu (bắt buộc lần đầu với nhân viên)
- **Ưu tiên:** mobile
- **Fields:** `newPassword` (required), `confirmPassword` (required)
- **Validation:** độ mạnh mật khẩu; `newPassword === confirmPassword`
- **Actions:** Submit → đổi mật khẩu, redirect sau khi thành công
- **States:** idle, validating, submitting, error

---

## 3. Customer Search

- **Route:** `/customers` (`ROUTES.customers`)
- **Roles:** receptionist, barber, skinner, manager, owner
- **Ưu tiên:** desktop (quầy) + mobile
- **Sections:** ô search, danh sách khách hàng
- **Fields:** search input (tên hoặc số điện thoại)
- **Actions:** Search theo tên, Search theo SĐT, Tạo khách hàng (mở modal Customer Create), Mở Customer Detail, Tạo visit nhanh
- **States:** mặc định hiển thị page 1 gồm 10 khách do nhân viên hiện tại tạo, kết quả search, không có kết quả, loading
- **Data:** danh sách customer (name, phone, số lượt visit, ngày ghé gần nhất)

## 4. Customer Create

- **Trình bày:** modal mở từ Customer Search (route nền `/customers`, `ROUTES.customers`)
- **Roles:** như Customer Search
- **Ưu tiên:** responsive
- **Fields:** `name` (required), `phone` (required)
- **Validation:** name bắt buộc; phone bắt buộc; phone unique theo `shop_id`
- **Actions:** Lưu khách hàng → đóng modal, chọn khách vừa tạo
- **States:** idle, validating (phone trùng), submitting, error

## 5. Customer Detail

- **Route:** `/customers/:id` (`ROUTES.customerDetail(id)`)
- **Roles:** như Customer Search
- **Ưu tiên:** responsive
- **Spec chi tiết:** xem mục Customer Detail trong tài liệu này.
- **Sections:** Profile header, Metrics, Suggestions (gợi ý dịch vụ/thợ), Recent hair photos, Completed visit history, Edit customer modal
- **Actions:** Create Visit, Edit customer info
- **Data:** thông tin khách, dịch vụ/thợ quen, ảnh kiểu tóc gần đây, lịch sử visit hoàn thành
- **States:** loading, loaded, edit modal open

## 6. Create Visit

- **Route:** `/visits/create` (`ROUTES.createVisit`)
- **Roles:** receptionist, barber, skinner, manager, owner
- **Ưu tiên:** responsive (nhân viên dùng mobile)
- **Sections:** Customer, Services, Combos, Barber, Skinner, Total Price
- **Actions:** Save Visit
- **Data:** chọn dịch vụ lẻ hoặc combo, gán barber/skinner, tạm tính tổng tiền
- **States:** new visit → tạo ở trạng thái `pending`
- **Business:** chọn combo sẽ bỏ chọn toàn bộ dịch vụ lẻ; chọn dịch vụ lẻ sẽ bỏ chọn toàn bộ combo. Total price = tổng nhóm đang được chọn.

## 7. Visit Detail

- **Route:** `/visits/:id` (`ROUTES.visitDetail(id)`)
- **Roles:** như Create Visit
- **Ưu tiên:** responsive
- **Sections:** Visit Information, Services, Combos, Barber, Skinner, Photos
- **Actions:** Upload Photo (chỉ role `barber`), Edit Barber, Edit Skinner
- **Warning:** dịch vụ haircut (`is_haircut = true`) chưa có ảnh → hiển thị cảnh báo
- **Business:** edit barber/skinner chỉ trong 3 giờ sau `completed_at`; ngoài cửa sổ này khoá chỉnh sửa và hiển thị thông báo. Chỉ role `barber` được upload ảnh kiểu tóc.
- **States:** pending, in_progress, completed; locked (quá 3h)
- **API:** cần `GET /api/visits/:id` để load standalone. Hiện có `GET /api/visits`, `POST /api/visits`, `PATCH /api/visits/:id`. Nếu chưa có `GET /api/visits/:id`, phải thêm backend trước khi build route này.

## 8. Visit List

- **Route:** `/visits` (`ROUTES.visits`)
- **Roles:** như Create Visit
- **Ưu tiên:** desktop
- **Sections:** filter trạng thái, danh sách visit
- **Filter:** `pending`, `in_progress`, `completed`
- **Actions:** mở Visit Detail, tạo visit mới
- **Indicator:** badge cảnh báo thiếu ảnh trên các visit haircut chưa có ảnh
- **States:** loading, danh sách, empty

---

## 9. Dashboard

- **Route:** `/dashboard` (`ROUTES.dashboard`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Widgets:** Revenue, Total Visits, New Customers, Returning Customers
- **Charts:** Revenue Trend, Top Barbers, Top Skinners, Top Services, Top Combos
- **Backend:** phụ thuộc report/dashboard APIs; dùng placeholder/mock cho đến khi backend xong
- **States:** loading, loaded, mock/placeholder

## 10. Services

- **Route:** `/owner/services` (`ROUTES.ownerServices`)
- **Roles:** owner
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, price, duration, active
- **States:** list, create modal, edit modal, confirm delete

## 11. Combos

- **Route:** `/owner/combos` (`ROUTES.ownerCombos`)
- **Roles:** owner
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, danh sách dịch vụ thành phần, price, active
- **States:** list, create modal, edit modal, confirm delete

## 12. Staff

- **Route:** `/owner/staff` (`ROUTES.ownerStaff`)
- **Roles:** owner
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, role, branch, active/inactive
- **States:** list, create modal, edit modal, confirm delete

## 13. Branches

- **Route:** `/owner/branches` (`ROUTES.ownerBranches`)
- **Roles:** owner
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, address, số nhân viên, active
- **States:** list, create modal, edit modal, confirm delete

## 14. Reports

- **Route:** `/reports` (`ROUTES.reports`)
- **Roles:** owner (phạm vi dữ liệu theo role)
- **Ưu tiên:** desktop
- **Sections:** Revenue, Branch Analytics, Top Employees, Top Services, Top Combos
- **Backend:** Report API chưa implement → giữ placeholder/mock cho đến khi có backend
- **States:** loading, loaded, mock/placeholder

## 14b. Báo cáo cá nhân

- **Trình bày:** view cá nhân cho nhân viên (trong khu báo cáo)
- **Roles:** barber, skinner, receptionist
- **Ưu tiên:** mobile
- **Sections:** số dịch vụ đã làm, số combo đã làm, dịch vụ thực hiện nhiều nhất trong kỳ
- **States:** loading, loaded

---

## 15. Superadmin Landing

- **Trình bày:** màn đích sau khi superadmin đăng nhập
- **Roles:** superadmin
- **Ưu tiên:** desktop
- **Actions:** "Quản trị hệ thống", "Xem theo tiệm"

---

## 16. Trial Expiry Popup

- **Trình bày:** overlay toàn cục
- **Roles:** owner (hiển thị trong workspace của tiệm)
- **Ưu tiên:** responsive
- **Hiển thị:** trong 7 ngày cuối của bản dùng thử (`trial_expires_at`)
- **Nội dung:** số ngày còn lại, ngày hết hạn, CTA nâng cấp
- **Business:** shop status `active` / `expired`; khi `expired` → khoá thao tác
