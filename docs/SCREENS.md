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
- Client data dùng TanStack Query không được tự refetch khi browser/window focus lại. Dữ liệu chỉ fetch khi vào page, reload browser, query key thay đổi, hoặc được invalidate/refetch chủ động sau mutation/action.
- Mọi chuỗi UI đặt trong `src/constants/texts/`. Không hardcode text trong component.
- Mọi thao tác thành công phải hiển thị success feedback qua global Feedback notification flow; nếu có điều hướng sau thành công, feedback phải được dispatch trước khi điều hướng bằng app router.
- Type/interface dùng chung đặt trong `src/types/`. Không định nghĩa trong component.
- Dùng shadcn/ui khi có thể. TypeScript strict, không dùng `any`.
- Header của mọi page chỉ hiển thị title. Không render description/subtitle trong page header.
- Dropdown/select phải dùng global `Select` primitive. Padding trái của text và padding phải của icon phải cân nhau về thị giác; phần phải vẫn phải đủ rộng để icon không đè text.
- Table phải dùng global table primitives và hiển thị đủ line ngang giữa row + line dọc giữa cell để phân tách ô rõ ràng.
- Mỗi bảng thuộc tenant phải enforce `shop_id`.
- Roles: `superadmin`, `owner`, `manager`, `receptionist`, `barber`, `skinner`.
- Visit status: `pending`, `in_progress`, `completed`.
- Sửa barber/skinner chỉ trong vòng 3 giờ sau `completed_at`.
- Cảnh báo khi visit có dịch vụ `is_haircut = true` mà chưa có ảnh.

## Design system

- Theme: Geist neutral (light/dark). Nền neutral/gray là chủ đạo; gold chỉ là accent rất hạn chế.
- Font: system (`font-sans`). Border thay cho shadow. Bo góc tối đa `rounded-xl`.
- Status color: amber = pending, blue = in_progress, green = completed, red = lỗi/destructive.
- Chi tiết: `CONTEXT.md`, `docs/ui/design-system.md`, `docs/ui/navigation.md`.

## Responsive

- Một codebase responsive. Màn tác nghiệp của nhân viên ưu tiên mobile; màn quản lý (owner) ưu tiên desktop.
- Với role nhân viên (`receptionist`, `barber`, `skinner`), desktop (1024px+) không hiển thị UI thao tác. Thay vào đó dùng fallback toàn cục "Chỉ hỗ trợ trên điện thoại"; mobile/tablet tiếp tục dùng workflow nhân viên.
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
- **Ưu tiên:** manager/owner desktop (quầy) + staff mobile/tablet
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Customer Search UI khi viewport từ 1024px.
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
- **Ưu tiên:** manager/owner responsive + staff mobile/tablet
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Customer Detail UI khi viewport từ 1024px.
- **Spec chi tiết:** xem mục Customer Detail trong tài liệu này.
- **Sections:** Profile header, Metrics, Suggestions (gợi ý dịch vụ/thợ), Recent hair photos, Completed visit history, Edit customer modal
- **Actions:** Create Visit nằm cạnh tên khách hàng trong profile summary và chỉ hiển thị khi khách không có visit `pending`/`in_progress`; Edit customer info dùng icon bút chì trực tiếp trên header.
- **Data:** thông tin khách, dịch vụ/thợ quen, ảnh kiểu tóc gần đây, lịch sử visit hoàn thành
- **States:** loading, loaded, edit modal open

## 6. Create Visit

- **Route:** `/visits/create` (`ROUTES.createVisit`)
- **Roles:** receptionist, barber, skinner, manager, owner
- **Ưu tiên:** manager/owner responsive + staff mobile/tablet
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Create Visit UI khi viewport từ 1024px.
- **Sections:** Customer, Services, Combos, Barber, Skinner, Total Price
- **Actions:** Save Visit
- **Data:** chọn dịch vụ lẻ hoặc combo, gán barber/skinner, tạm tính tổng tiền
- **States:** new visit → tạo ở trạng thái `pending`
- **Navigation:** route có thể nhận `origin=customer` hoặc `origin=visits`. Nếu đi từ Customer Detail, back link quay về chi tiết khách; nếu đi từ Visit List, back link quay về `/visits`; mặc định không có origin thì quay về `/customers`.
- **Business:** chọn combo sẽ bỏ chọn toàn bộ dịch vụ lẻ; chọn dịch vụ lẻ sẽ bỏ chọn toàn bộ combo. Total price = tổng nhóm đang được chọn.
- **Reporting snapshot:** khi lưu visit, backend snapshot tên/giá/role phụ trách của service hoặc combo. Với combo, backend tách combo thành các dòng service con và phân bổ doanh thu theo tỷ lệ `combo.price / sum(service.price)` tại thời điểm visit.

## 7. Visit Detail

- **Route:** `/visits/:id` (`ROUTES.visitDetail(id)`)
- **Roles:** như Create Visit
- **Ưu tiên:** manager/owner responsive + staff mobile/tablet
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Visit Detail UI khi viewport từ 1024px.
- **Sections:** Visit Information, Services, Combos, Barber, Skinner, Photos
- **Actions:** Upload Photo (chỉ role `barber`), Edit Barber, Edit Skinner
- **Warning:** dịch vụ haircut (`is_haircut = true`) chưa có ảnh → hiển thị cảnh báo
- **Business:** edit barber/skinner chỉ trong 3 giờ sau `completed_at`; ngoài cửa sổ này khoá chỉnh sửa và hiển thị thông báo. Chỉ role `barber` được upload ảnh kiểu tóc. Khi hoàn thành visit, điều hướng về Customer Detail bằng `returnToCustomerId` hoặc `visit.customer.id`.
- **States:** pending, in_progress, completed; locked (quá 3h)
- **API:** cần `GET /api/visits/:id` để load standalone. Hiện có `GET /api/visits`, `POST /api/visits`, `PATCH /api/visits/:id`. Nếu chưa có `GET /api/visits/:id`, phải thêm backend trước khi build route này.

## 8. Visit List

- **Route:** `/visits` (`ROUTES.visits`)
- **Roles:** như Create Visit
- **Ưu tiên:** manager/owner desktop + staff mobile/tablet
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Visit List UI khi viewport từ 1024px.
- **Header:** chỉ hiển thị title, không hiển thị description/subtitle.
- **Sections:** filter trạng thái, danh sách visit
- **Filter:** thứ tự `completed`, `in_progress`, `pending`; mặc định `completed`.
- **Actions:** mở Visit Detail, tạo visit mới
- **Indicator:** badge cảnh báo thiếu ảnh trên các visit haircut chưa có ảnh
- **States:** loading, danh sách, empty

---

## 9. Tổng quan

- **Route:** `/dashboard` (`ROUTES.dashboard`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Purpose:** overview nhanh + action alerts. Tổng quan dùng để scan tình hình vận hành hiện tại/kỳ đang xem và nhắc việc cần xử lý ngay, không thay thế báo cáo chi tiết.
- **Header:** chỉ hiển thị title `Tổng quan`, không hiển thị description/subtitle.
- **Filter:** dùng 3 tabs `Tháng`, `Năm hiện tại`, `Tất cả thời gian`. Mặc định chọn `Tháng` của tháng hiện tại. Khi tab `Tháng` active, hiển thị badge action `Chọn tháng` để mở month picker; chọn tháng xong vẫn giữ tab `Tháng`.
- **Content layout:** toàn bộ widgets/charts/alerts bên dưới filter nằm trong một global card chung. Card title là kỳ đang chọn: tên tháng được chọn, `Năm hiện tại`, hoặc `Tất cả thời gian`.
- **Title casing:** tất cả title trên Tổng quan phải viết hoa chữ đầu, bao gồm page title, section title, card title, chart title và title kỳ được chọn.
- **Widgets:** Revenue, Total Visits, New Customers, Returning Customers
- **Charts:** Revenue Trend, Top Barbers, Top Skinners, Top Services, Top Combos
- **Alerts:** haircut visit thiếu ảnh kiểu tóc
- **Backend:** `GET /api/dashboard?period=month|year|all&month=YYYY-MM` đã implement cho `owner` và `manager`, scoped theo `shop_id`
- **States:** loading, loaded, empty, error

## 10. Services

- **Route:** `/owner/services` (`ROUTES.ownerServices`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, price, responsibleRole (`barber` hoặc `skinner`), duration, active
- **Reporting:** mỗi service phải có `responsibleRole` để phân bổ doanh thu báo cáo.
- **States:** list, create modal, edit modal, confirm delete

## 11. Combos

- **Route:** `/owner/combos` (`ROUTES.ownerCombos`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, danh sách dịch vụ thành phần, price, active
- **Business:** giá combo do owner nhập độc lập với tổng giá dịch vụ lẻ. Nếu giá combo cao hơn tổng giá dịch vụ lẻ thì chỉ cảnh báo ở UI, không chặn backend.
- **States:** list, create modal, edit modal, confirm delete

## 12. Staff

- **Route:** `/owner/staff` (`ROUTES.ownerStaff`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Header:** chỉ hiển thị title, không hiển thị description/subtitle.
- **Sections:** bộ lọc, danh sách nhân viên dạng table, modal chi tiết, modal tạo/sửa, confirm modal ngưng làm.
- **Filter:** tìm kiếm theo tên/username, vai trò, trạng thái; owner có thêm chi nhánh, manager không có filter chi nhánh vì bị scope theo chi nhánh hiện tại. Filter chỉ áp dụng khi bấm `Áp dụng`.
- **Status filter:** `Tất cả trạng thái`, `Khởi tạo`, `Đang làm`.
- **Actions:** List, Create, Edit, soft Delete/ngưng làm.
- **Fields:** username, role, branch, display status, createdAt.
- **Display status:** `Khởi tạo` = `status: active` + `isFirstLogin: true`; `Đang làm` = `status: active` + `isFirstLogin: false`; nhân viên `inactive` là đã nghỉ và không hiển thị trong danh sách active.
- **Badge:** `Khởi tạo` dùng danger, `Đang làm` dùng info. Vai trò: skinner success, barber info, receptionist warning.
- **Business:** owner xem/tạo/sửa nhân viên toàn shop. Manager chỉ xem/tạo/sửa/ngưng làm nhân viên thuộc `branch_id` của manager; khi tạo/sửa, branch bị ép theo chi nhánh của manager.
- **Detail popup:** click tên nhân viên mở modal chi tiết dạng table 2 cột; không hiển thị riêng thông tin đổi mật khẩu vì đã được thể hiện bằng trạng thái `Khởi tạo`.
- **States:** loading, empty, error, list, create modal, edit modal, detail modal, confirm delete.

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
- **Purpose:** audit + analysis. Reports dùng để phân tích sâu, đối soát doanh thu phân bổ, xem bảng/biểu đồ chi tiết và drill-down theo kỳ/nhân sự/dịch vụ.
- **Sections:** Revenue, Branch Analytics, Top Employees, Top Services, Top Combos
- **Backend:** Report API chưa implement → giữ placeholder/mock cho đến khi có backend
- **States:** loading, loaded, mock/placeholder
- **Reporting data:** báo cáo doanh thu phải dùng `visit_services.allocated_price` và các field snapshot, không dùng giá/tên service hoặc combo hiện tại.

## 14b. Báo cáo cá nhân

- **Trình bày:** view cá nhân cho nhân viên (trong khu báo cáo)
- **Roles:** barber, skinner, receptionist
- **Ưu tiên:** mobile
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Báo cáo cá nhân khi viewport từ 1024px.
- **Header:** chỉ hiển thị title, không hiển thị description/subtitle.
- **Sections:** thông tin nhân viên, bộ lọc kỳ, Thông tin chung, Dịch vụ thực hiện nhiều nhất, Khách phục vụ nhiều nhất
- **Backend:** `GET /api/reports/personal?period=month|year|all&month=YYYY-MM` đã implement, chỉ tính visit `completed` theo `shop_id` và user hiện tại (`barberId`, `skinnerId`, hoặc `createdBy` theo role). Response có `metrics`, `topItems`, và `topCustomers`.
- **Filter:** mặc định tháng hiện tại; bộ chọn gồm checkbox Tháng/Năm hiện tại/Tất cả thời gian. Khi chọn Tháng, hiển thị month picker chỉ cho chọn từ 12 tháng gần nhất đến tháng hiện tại.
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
