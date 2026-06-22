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
- Khi hiển thị người dùng/nhân viên trong bảng, chip, dropdown, báo cáo hoặc thông tin chi tiết nghiệp vụ, ưu tiên họ tên đầy đủ (`fullName`/`full_name`); chỉ fallback về `username` cho tài khoản/dữ liệu cũ chưa có họ tên. Riêng form đăng nhập và field tên đăng nhập vẫn hiển thị `username`.
- Mọi ngày hiển thị trong UI dùng format `dd/mm/yyyy`; nếu có giờ thì hiển thị sau ngày.
- Mọi ô search text phải có nút icon `X` để xoá nhanh khi đã có nội dung.
- Mọi vùng chọn ảnh phải click/keyboard trực tiếp được để mở file picker; không hiển thị nút `Chọn ảnh` riêng bên cạnh hoặc bên dưới.
- Option mặc định thể hiện tất cả giá trị trong filter/select hiển thị `Tất cả`, không thêm tên field phía sau.
- Mọi thao tác thành công phải hiển thị success feedback qua global Feedback notification flow; nếu có điều hướng sau thành công, feedback phải được dispatch trước khi điều hướng bằng app router.
- Type/interface dùng chung đặt trong `src/types/`. Không định nghĩa trong component.
- Dùng shadcn/ui khi có thể. TypeScript strict, không dùng `any`.
- Header của mọi page chỉ hiển thị title. Không render description/subtitle trong page header.
- Dropdown/select phải dùng global `Select` primitive. Padding trái của text và padding phải của icon phải cân nhau về thị giác; phần phải vẫn phải đủ rộng để icon không đè text.
- Table phải dùng global table primitives và hiển thị đủ line ngang giữa row + line dọc giữa cell để phân tách ô rõ ràng.
- Popup/modal không đóng khi click overlay; chỉ đóng bằng nút huỷ/đóng trong modal hoặc dấu `X`.
- Thao tác blocking toàn màn hình, ví dụ auto-select branch/redirect hoặc ngừng/kích hoạt chi nhánh, dùng global `FullScreenLoading`. Overlay bán trong suốt để vẫn quan sát được nội dung phía sau và phải phủ toàn viewport, bao gồm sidebar.
- Catalog soft delete như dịch vụ/combo dùng tabs `Đang hoạt động` và `Đã xoá` phía trên filter card. Tab đã xoá mặc định chỉ để xem lại; riêng combo cho phép nhân bản từ tab đã xoá để tạo bản mới thay vì restore record cũ.
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
- **Sections:** Customer, Branch context, Services, Combos, Barber, Skinner, Total Price
- **Actions:** Save Visit
- **Data:** chọn dịch vụ lẻ hoặc combo, gán barber/skinner, tạm tính tổng tiền
- **States:** new visit → tạo ở trạng thái `pending`
- **Navigation:** route có thể nhận `origin=customer` hoặc `origin=visits`. Nếu đi từ Customer Detail, back link quay về chi tiết khách; nếu đi từ Visit List, back link quay về `/visits`; mặc định không có origin thì quay về `/customers`.
- **Business:** chọn combo sẽ bỏ chọn toàn bộ dịch vụ lẻ; chọn dịch vụ lẻ sẽ bỏ chọn toàn bộ combo. Total price = tổng nhóm đang được chọn.
- **Branch scope:** visit luôn thuộc một chi nhánh active. Staff dùng `branch_id` của tài khoản; manager dùng branch đã chọn ở `/manager/select-branch`; owner dùng branch context do flow tạo visit cung cấp khi triển khai owner đa chi nhánh.
- **Reporting snapshot:** khi lưu visit, backend snapshot tên/địa chỉ chi nhánh và tên/giá/role phụ trách của service hoặc combo. Với combo, backend tách combo thành các dòng service con và phân bổ doanh thu theo tỷ lệ `combo.price / sum(service.price)` tại thời điểm visit.

## 7. Visit Detail

- **Route:** `/visits/:id` (`ROUTES.visitDetail(id)`)
- **Roles:** như Create Visit
- **Ưu tiên:** manager/owner responsive + staff mobile/tablet
- **Desktop staff fallback:** receptionist, barber, skinner thấy fallback toàn cục thay vì Visit Detail UI khi viewport từ 1024px.
- **Sections:** Visit Information, Services, Combos, Barber, Skinner, Photos
- **Actions:** Upload Photo (chỉ role `barber`), Edit Barber, Edit Skinner
- **Warning:** dịch vụ haircut (`is_haircut = true`) chưa có ảnh → hiển thị cảnh báo
- **Photo picker:** click hoặc dùng bàn phím trực tiếp trên tile/vùng upload ảnh để mở file picker; không hiển thị nút `Chọn ảnh` riêng.
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
- **Filter:** tab Hôm nay hiển thị visit tạo trong ngày hiện tại hoặc visit chưa hoàn thành từ các ngày trước. Thứ tự status filter là `pending` hiển thị `Khởi tạo`, `in_progress` hiển thị `Đang làm`, `completed` hiển thị `Hoàn thành`; mặc định `pending`.
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

- **Route:** owner `/owner/services` (`ROUTES.ownerServices`), manager `/manager/services` (`ROUTES.managerServices`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit, Delete
- **Fields:** name, price, responsibleRole (`barber` hoặc `skinner`), active
- **Reporting:** mỗi service phải có `responsibleRole` để phân bổ doanh thu báo cáo.
- **States:** list, create modal, edit modal, confirm delete

## 11. Combos

- **Route:** owner `/owner/combos` (`ROUTES.ownerCombos`), manager `/manager/combos` (`ROUTES.managerCombos`)
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Actions:** List, Create, Edit khi combo chưa có visit, Duplicate, Soft delete
- **Fields:** name, description, danh sách dịch vụ thành phần, price, scope, creator, createdAt, deletedAt
- **Tabs:** `Đang hoạt động`, `Đã xoá`; tab đã xoá không restore, chỉ cho xem lại và nhân bản combo.
- **Business:** giá combo do owner nhập độc lập với tổng giá dịch vụ lẻ. Nếu giá combo cao hơn tổng giá dịch vụ lẻ thì chỉ cảnh báo ở UI, không chặn backend.
- **Duplicate:** dùng để chỉnh sửa gián tiếp combo đã có visit hoặc tạo lại combo đã xoá. Tên bản sao thêm suffix `- copy`; chỉ dịch vụ đang hoạt động và còn thuộc scope hiện tại được checked sẵn. Nếu một phần dịch vụ gốc không thể copy, hiển thị warning tổng quát; nếu không còn dịch vụ nào hợp lệ, hiển thị warning yêu cầu chọn dịch vụ mới.
- **States:** list, deleted list, create modal, edit modal, duplicate modal, confirm delete

## 12. Staff

- **List route:** owner `/owner/staff` (`ROUTES.ownerStaff`), manager `/manager/staff` (`ROUTES.managerStaff`)
- **Create route:** owner `/owner/staff/new`, manager `/manager/staff/new`.
- **Edit route:** owner `/owner/staff/:id/edit`, manager `/manager/staff/:id/edit`.
- **Roles:** owner, manager
- **Ưu tiên:** desktop
- **Header:** chỉ hiển thị title, không hiển thị description/subtitle.
- **Sections:** bộ lọc, danh sách nhân viên dạng table, modal chi tiết, confirm modal ngưng làm; tạo/cập nhật nhân viên dùng route riêng.
- **Implementation:** owner và manager dùng chung staff list screen và staff form screen với `mode="owner" | "manager"`; route page chỉ pass mode vào shared component.
- **Filter:** tìm kiếm theo tên/username, vai trò, trạng thái; owner có thêm chi nhánh, manager không có filter chi nhánh vì bị scope theo chi nhánh hiện tại. Filter chỉ áp dụng khi bấm `Áp dụng`.
- **Status filter:** `Tất cả`, `Khởi tạo`, `Đang làm`.
- **Actions:** List, Create, Edit, soft Delete/ngưng làm.
- **Fields:** tên nhân viên hiển thị bằng họ tên đầy đủ, role, branch hoặc danh sách chi nhánh quản lý, display status, createdAt.
- **Create/Edit form:** bắt buộc tên đăng nhập, mật khẩu khi tạo, họ tên đầy đủ, số điện thoại, ngày tháng năm sinh, giới tính, vai trò và phân công chi nhánh; quê quán, nơi ở hiện tại, ảnh CCCD mặt trước và ảnh CCCD mặt sau không bắt buộc. Label field bắt buộc hiển thị dấu `*` màu đỏ; field không bắt buộc chỉ hiển thị label, không thêm hậu tố `(không bắt buộc)`. Owner được chọn role `manager`, `receptionist`, `barber`, `skinner`; không cho tạo `owner` hoặc `superadmin` từ màn nhân viên. Manager chỉ được tạo staff thường trong branch context hiện tại.
- **CCCD upload:** ảnh CCCD chỉ được chọn từ file trên máy tính; không dùng camera/capture. Click hoặc dùng bàn phím trực tiếp trên vùng upload/preview để chọn hoặc thay ảnh, không có nút `Chọn ảnh` riêng. Ảnh lưu trong R2 private và UI chỉ nhận URL xem tạm thời có thời hạn, không lưu hoặc hiển thị public URL.
- **CCCD replacement:** khi thay một mặt CCCD, upload object mới trước; chỉ sau khi cập nhật object key mới vào DB thành công mới xoá object cũ. Nếu upload hoặc lưu DB thất bại, giữ nguyên ảnh cũ và dọn object mới chưa được sử dụng.
- **Edit loading:** khi chuyển vào route edit mà API staff chưa hoàn tất, vẫn hiển thị page header/nút quay lại và render skeleton theo ba section `Thông tin cá nhân`, `Ảnh CCCD`, `Tài khoản và phân công`. Skeleton giữ cùng grid/aspect ratio với form thật để tránh layout shift.
- **Display status:** `Khởi tạo` = `status: active` + `isFirstLogin: true`; `Đang làm` = `status: active` + `isFirstLogin: false`; `branch_suspended` = tạm treo do chi nhánh ngừng hoạt động; nhân viên `inactive` là đã nghỉ và không hiển thị trong danh sách active.
- **Badge:** `Khởi tạo` dùng danger, `Đang làm` dùng info. Vai trò: skinner success, barber info, receptionist warning.
- **Manager role creation:** owner có thể tạo user role `manager`. Khi role là manager, form ẩn field chi nhánh làm việc của staff thường và hiển thị field chọn một hoặc nhiều chi nhánh active để manager quản lý. Field này dùng searchable multi-select/dropdown và chỉ hiển thị chi nhánh active. Một manager có thể quản lý nhiều chi nhánh, nhưng mỗi chi nhánh chỉ có một manager tại một thời điểm. Nếu gán manager mới vào branch đã có manager, manager cũ bị thay thế ở branch đó.
- **Role switch on edit:** nếu đổi staff thường sang `manager`, bỏ/không dùng `users.branch_id` cho phân quyền quản lý và yêu cầu chọn danh sách chi nhánh quản lý. Nếu đổi `manager` sang staff thường, phải chọn một branch làm việc và gỡ các branch manager assignment cũ.
- **Business:** owner xem/tạo/sửa nhân viên toàn shop. Manager chỉ xem/tạo/sửa/ngưng làm nhân viên thuộc branch active đã chọn; khi tạo/sửa staff thường, branch bị ép theo branch context hiện tại của manager.
- **Route guard:** owner không được truy cập `/manager/*`; manager không được truy cập `/owner/*`.
- **Detail popup:** click tên nhân viên mở modal chi tiết dạng table 2 cột; không hiển thị riêng thông tin đổi mật khẩu vì đã được thể hiện bằng trạng thái `Khởi tạo`.
- **States:** section skeleton loading, empty, error, list, create route, edit route, uploading identity image, submit success/error, detail modal, confirm delete.

## 13. Branches

- **Route:** `/owner/branches` (`ROUTES.ownerBranches`)
- **Roles:** owner
- **Ưu tiên:** desktop
- **List:** tìm theo tên hoặc địa chỉ; lọc `Tất cả`, `Đang hoạt động`, `Ngừng hoạt động`; table hiển thị tên, địa chỉ, manager, trạng thái, ngày tạo và thao tác.
- **Create route:** `/owner/branches/new`; nhập tên, địa chỉ, manager. Section nhân viên hiển thị yêu cầu lưu chi nhánh trước.
- **Detail route:** `/owner/branches/:id`; click tên chi nhánh từ table để mở. Dùng chung bố cục thông tin với create/edit, hiển thị manager và danh sách nhân viên.
- **Edit route:** `/owner/branches/:id/edit`; chỉnh tên, địa chỉ, manager. Chi nhánh inactive chỉ được xem, phải active lại trước khi chỉnh sửa.
- **Manager:** một chi nhánh có tối đa một manager; một manager có thể quản lý nhiều chi nhánh. Dropdown manager hiển thị/tìm theo họ tên đầy đủ, fallback username, và có `Chưa phân công`.
- **Staff:** staff thường chỉ thuộc một chi nhánh. Nút `Điều chuyển nhân viên` nằm ở danh sách nhân viên trong detail; owner chọn nhân viên, mở popup chọn chi nhánh active đích, rồi chuyển hàng loạt. Chỉ được chuyển khi toàn bộ nhân viên được chọn không còn visit `pending` hoặc `in_progress`; lịch sử visit/report không thay đổi.
- **Delete:** không hỗ trợ xoá chi nhánh.
- **Inactive:** owner có thể ngừng/kích hoạt lại chi nhánh. Ngừng hoạt động chỉ cho phép khi chi nhánh không còn visit `pending` hoặc `in_progress`; sau khi bấm action phải đóng băng màn hình bằng `FullScreenLoading` cho đến khi API hoàn tất. Sau khi ngừng thì khoá thao tác vận hành, lưu audit `deactivatedAt/deactivatedBy`, và đưa staff/manager liên quan về `branch_suspended`. Chi nhánh inactive chỉ được xem; phải active lại trước khi chỉnh sửa. Khi active lại, service/combo còn dữ liệu nhưng nhân viên phải được owner thêm/chuyển lại.
- **States:** loading, empty, filtered-empty, error, detail not found, create, detail, edit.

## 13b. Manager Branch Selection

- **Route:** `/manager/select-branch` (`ROUTES.managerSelectBranch`)
- **Roles:** manager
- **Sidebar:** không hiển thị sidebar trên màn chọn. Chỉ sau khi chọn branch mới đi vào management workspace. Trong workspace, nhóm `Báo cáo` là collapse mặc định đóng; các item quản lý hiển thị `Quản lý dịch vụ`, `Quản lý combo`, `Quản lý nhân viên`.
- **Behavior:** nếu manager chỉ có một branch active thì hiển thị `FullScreenLoading`, tự chọn branch và điều hướng vào Tổng quan; không flash màn chọn chi nhánh. Nếu có nhiều branch thì hiển thị card tên + địa chỉ để chọn; nếu không có branch active thì hiển thị empty state.
- **Switch:** khi manager quản lý nhiều branch, sidebar hiển thị `Đổi chi nhánh`; action quay lại màn chọn branch và sau khi chọn phải invalidate dữ liệu branch cũ.
- **Scope:** branch đã chọn trở thành branch context cho staff, service, combo, visit và report. API phải xác minh manager được phân quyền vào branch đó.
- **Suspended:** nếu user ở trạng thái `branch_suspended`, middleware đưa về màn thông báo chi nhánh đã ngừng hoạt động thay vì vào workspace. Manager có nút đăng xuất để đăng nhập bằng tài khoản khác.

## 14. Reports

- **Route:** `/reports` (`ROUTES.reports`)
- **Roles:** owner (phạm vi dữ liệu theo role)
- **Ưu tiên:** desktop
- **Purpose:** audit + analysis. Reports dùng để phân tích sâu, đối soát doanh thu phân bổ, xem bảng/biểu đồ chi tiết và drill-down theo kỳ/nhân sự/dịch vụ.
- **Sections:** Revenue, Branch Analytics, Top Employees, Top Services, Top Combos
- **Backend:** Report API chưa implement → giữ placeholder/mock cho đến khi có backend
- **States:** loading, loaded, mock/placeholder
- **Reporting data:** báo cáo doanh thu phải dùng `visit_services.allocated_price` và các field snapshot, bao gồm snapshot chi nhánh trên visit; không dùng giá/tên service, combo hoặc branch hiện tại.

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
