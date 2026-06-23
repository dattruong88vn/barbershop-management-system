# Smoke Tests

Smoke test là script kiểm tra nhanh một flow quan trọng trên dev server thật. Mục tiêu là giúp dev tự tin rằng luồng chính còn chạy được sau khi sửa code, nhưng không thay thế unit test, integration test, hoặc QC thủ công.

## Cách chạy

- Start dev server trước, thường là `npm run dev -- -p 3000`.
- Chạy smoke script bằng npm script tương ứng, ví dụ `npm run smoke:auth`, `npm run smoke:management`, hoặc `npm run smoke:visits`.
- Nếu cần trỏ sang server khác, dùng `SMOKE_BASE_URL`.
- Nếu cần cố định shop, branch, service, hoặc combo, dùng các biến môi trường riêng của script như `SMOKE_SHOP_ID`, `SMOKE_BRANCH_ID`, `SMOKE_SERVICE_ID`, `SMOKE_COMBO_ID`.

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
