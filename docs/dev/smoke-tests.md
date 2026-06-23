# Smoke Tests

Smoke test là script kiểm tra nhanh một flow quan trọng trên dev server thật. Mục tiêu là giúp dev tự tin rằng luồng chính còn chạy được sau khi sửa code, nhưng không thay thế unit test, integration test, hoặc QC thủ công.

## Cách chạy

- Start dev server trước, thường là `npm run dev -- -p 3000`.
- Chạy toàn bộ smoke tuần tự bằng `npm run smoke:all`.
- Chạy smoke script bằng npm script tương ứng, ví dụ `npm run smoke:auth`, `npm run smoke:management`, hoặc `npm run smoke:visits`.
- Playwright UI smoke dùng `npm run smoke:ui:visits`, `npm run smoke:ui:manager-branch`, hoặc `npm run smoke:ui:staff-form`.
- Nếu cần trỏ sang server khác, dùng `SMOKE_BASE_URL`.
- Nếu cần cố định shop, branch, service, hoặc combo, dùng các biến môi trường riêng của script như `SMOKE_SHOP_ID`, `SMOKE_BRANCH_ID`, `SMOKE_SERVICE_ID`, `SMOKE_COMBO_ID`.
- Runbook nâng cao nằm ở `docs/dev/smoke-runbook.md`.

## Runner tổng

`npm run smoke:all` chạy các smoke hiện có theo thứ tự API trước, UI sau:

- `smoke:auth`
- `smoke:management`
- `smoke:visits`
- `smoke:ui:manager-branch`
- `smoke:ui:staff-form`
- `smoke:ui:visits`

Các flag hữu ích:

- `npm run smoke:all -- --api-only`: chỉ chạy API smoke.
- `npm run smoke:all -- --ui-only`: chỉ chạy Playwright UI smoke.
- `npm run smoke:all -- --continue-on-failure`: gom lỗi của nhiều smoke trong một lần chạy.
- `npm run smoke:all -- --list`: xem danh sách smoke mà không chạy.

Runner tổng chạy tuần tự từng script để hạn chế dữ liệu smoke và cleanup đụng nhau. Khi chạy full, giữ dev server ở một terminal riêng để đọc log API song song với output runner.

Quy trình khuyến nghị trước commit lớn:

1. `npm run dev -- -p 3000`.
2. `npm run smoke:all -- --list` để xác nhận danh sách flow.
3. `npm run smoke:all`.
4. Nếu fail, sửa lỗi đầu tiên rồi chạy lại script riêng trước, ví dụ `npm run smoke:auth` hoặc `npm run smoke:ui:visits`.
5. Khi script riêng pass, chạy lại `npm run smoke:all` một lần.

## Quy ước viết file smoke

- File smoke đặt trong `scripts/smoke/`.
- Mỗi file smoke phải có npm script trong `package.json` theo dạng `smoke:<module>`.
- Mỗi function trong file smoke phải có comment tiếng Việt ngay phía trên function, giải thích function đó phục vụ bước nào trong flow.
- Comment nên nói mục đích nghiệp vụ hoặc lý do kỹ thuật, không lặp lại từng dòng code.
- Smoke script phải gọi API thật bằng `API_ROUTES` và `DEFAULT_JSON_HEADERS` khi có thể.
- Không dùng `any`; response từ API nên đọc qua type guard hoặc helper nhận `unknown`.
- Không hardcode id dữ liệu seed nếu có thể tự tìm dữ liệu active từ DB. Nếu cần override, dùng biến môi trường.
- Dữ liệu tạo bởi smoke phải có prefix rõ ràng, ví dụ `SMOKE Visit`, để dễ nhận diện trong DB dev.
- Không hard delete dữ liệu business sau smoke nếu dữ liệu đó ảnh hưởng audit, report, visit, customer, service, combo hoặc staff history.

## Visit Smoke

`npm run smoke:visits` kiểm tra luồng visit API chính:

- tạo customer
- tạo visit bằng service
- chặn visit trộn service và combo
- kiểm quyền upload ảnh haircut
- start và complete visit
- kiểm rule khóa ảnh/item sau khi complete
- kiểm sửa staff trong cửa sổ cho phép
- tạo và complete combo visit

## Auth Smoke

`npm run smoke:auth` kiểm tra luồng auth chính:

- login sai mật khẩu bị từ chối
- user first-login đăng nhập được nhưng bị redirect sang đổi mật khẩu
- đổi mật khẩu cập nhật DB và mật khẩu cũ không còn dùng được
- user đã đổi mật khẩu vào được workspace theo role
- user `branch_suspended` đăng nhập được nhưng bị đưa sang màn chi nhánh ngừng hoạt động
- user `inactive` không đăng nhập được

## Management Smoke

`npm run smoke:management` kiểm tra các flow quản lý hiện tại:

- manager bắt buộc có active branch context
- manager không dùng được branch không được assign
- manager branch list chỉ trả branch được assign
- manager tạo, sửa, soft delete service
- service đã xoá xuất hiện ở tab deleted
- combo rỗng bị chặn
- manager tạo, sửa, soft delete combo
- combo đã xoá xuất hiện ở tab deleted
- manager tạo được staff thường trong active branch
- manager không tạo được manager account
- owner tạo manager account và assign nhiều branch
- owner đổi manager thành staff thường, đồng thời gỡ branch manager assignment cũ
- owner tạo/sửa/ngừng/kích hoạt lại branch
- branch inactive bị chặn edit
- branch còn open visit bị chặn ngừng hoạt động
- ngừng branch chuyển staff active sang `branch_suspended`
- owner transfer staff sang branch active và restore status active
- staff còn open visit bị chặn transfer
- owner/manager bị redirect khỏi workspace sai role
- staff không gọi được management API
- owner không đọc được branch thuộc shop khác
- location provinces/wards yêu cầu auth và validate province code

## Playwright UI Smoke

Các smoke UI dùng Playwright để kiểm phần thao tác browser mà API smoke không thấy được:

- `npm run smoke:ui:visits`: mở form tạo visit trên mobile, chọn service rồi combo để kiểm hai nhóm tự clear nhau, chọn staff và submit.
- `npm run smoke:ui:manager-branch`: mở màn chọn chi nhánh của manager có nhiều branch, kiểm card branch và chọn một branch vào dashboard.
- `npm run smoke:ui:staff-form`: mở form tạo staff desktop, kiểm province cache chỉ gọi một lần, chọn province để load wards, và form required fields sẵn sàng submit.

Các script này cần dev server đang chạy, Chromium Playwright đã được install, và DB dev có owner active. Script tự tạo dữ liệu `SMOKE UI ...` và cleanup sau khi chạy.
