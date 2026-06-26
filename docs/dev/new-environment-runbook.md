# New Environment Runbook

Checklist triển khai Barber Shop application và database vào một môi trường mới. Shared Data DB được dùng chung giữa các môi trường; không tạo hoặc sync lại Shared Data DB nếu môi trường mới chỉ là một consumer mới.

## Current Demo Setup

Trong giai đoạn chưa có khách hàng thật, có thể dùng Dev Barbershop DB để chạy demo:

```txt
Demo app -> Dev Barbershop DB -> Shared Data DB
```

Quy ước này chỉ dành cho demo và kiểm thử nội bộ:

- Không nhập dữ liệu khách hàng thật, CCCD thật, hoặc dữ liệu nhân sự thật.
- Không gọi môi trường demo là production trong tài liệu vận hành.
- Không dùng chung dữ liệu demo với dữ liệu khách hàng trả phí.
- Không chạy seed hoặc smoke test phá dữ liệu ngay trước buổi demo nếu dữ liệu demo đã được chuẩn bị thủ công.
- R2 bucket dùng cho demo chỉ chứa dữ liệu giả hoặc dữ liệu đã được phép dùng để demo.

Khi có khách hàng mua sản phẩm, phải tạo Production Barbershop DB riêng trước khi onboarding:

```txt
Production app -> Production Barbershop DB -> Shared Data DB
```

Production Barbershop DB có thể là Supabase project mới hoặc Supabase Pro project.
Không dùng Dev Barbershop DB làm production khi đã có dữ liệu thật.

## 1. Chuẩn bị

- Xác định tên môi trường và Supabase project Barbershop DB tương ứng.
- Xác nhận Shared Data DB hiện tại đã sync và verify thành công.
- Chuẩn bị Node.js v22+ và npm.
- Chuẩn bị Cloudflare R2 private bucket cho dữ liệu nhạy cảm.
- Không copy hoặc commit password thật vào repo.

## 2. Cấu hình application

Tạo biến môi trường của application từ `.env.example`:

- `DATABASE_URL`: Barbershop DB transaction pooler, port `6543`.
- `DIRECT_URL`: Barbershop DB session pooler, port `5432`.
- `NEXTAUTH_URL`: URL của application trong môi trường mới.
- `NEXTAUTH_SECRET`: secret riêng cho môi trường.
- `R2_PRIVATE_BUCKET_NAME` và các R2 credentials cần thiết.

Application runtime không giữ `SHARED_DATABASE_URL`, `SHARED_DIRECT_URL` hoặc read-only password của Shared Data DB. Barbershop DB đọc location qua `postgres_fdw`.

## 3. Triển khai Barbershop DB

Checkout đúng revision code sẽ deploy, sau đó chạy:

```bash
npm install
npx prisma generate
npm run reference:generate
npx prisma migrate deploy
```

Không dùng `prisma migrate dev` trên staging hoặc production. Chỉ chạy `npx prisma db seed` khi môi trường mới thực sự cần seed data và đã duyệt dữ liệu seed.

## 4. Kết nối Shared Data DB

Thực hiện trong Supabase SQL Editor.

1. Nếu consumer chưa có read-only role riêng, chạy `infrastructure/shared-location-db/sql/01-shared-db-readonly-role.sql` trên Shared Data DB.
2. Lấy hostname Session pooler port `5432` và project ref của Shared Data DB.
3. Trên Barbershop DB mới, thay placeholder rồi chạy `infrastructure/shared-location-db/sql/02-barbershop-fdw.sql`.
4. Khi dùng Supabase Shared Pooler, user mapping phải có dạng `<readonly-role>.<shared-project-ref>`.
5. Chạy `infrastructure/shared-location-db/sql/03-barbershop-fdw-verify.sql` trên Barbershop DB mới.

Mỗi consumer nên có read-only role riêng để có thể rotate hoặc revoke độc lập. Không add schema `reference_data` vào Supabase Data API exposed schemas.

## 5. Deploy code

1. Cấu hình toàn bộ environment variables trên nền tảng deploy.
2. Deploy cùng revision đã dùng để chạy migration.
3. Xác nhận application khởi động không có lỗi thiếu bảng, cột hoặc Prisma Client.
4. Không chạy Shared Data DB sync như một phần application build hoặc deploy.

Với setup hai branch hiện tại:

- `develop`: nhánh phát triển chính, deploy để kiểm thử nội bộ khi cần.
- `main`: nhánh ổn định, có thể deploy làm demo cho khách xem trước khi có production DB riêng.

Nếu `main` đang trỏ tới Dev Barbershop DB để demo, không nhập dữ liệu thật vào môi trường này.
Khi chuyển sang production thật, đổi environment variables của production deploy sang Production Barbershop DB và R2 bucket production.

## 6. Xác minh sau deploy

- Mở application và kiểm tra đăng nhập.
- Kiểm tra API nghiệp vụ đọc/ghi được Barbershop DB đúng tenant.
- Xác nhận query FDW trả về province và ward active.
- Kiểm tra ward trả về thuộc đúng province.
- Xác nhận read-only role không thể insert, update hoặc delete trên Shared Data DB.
- Kiểm tra location lookup failure không làm hỏng các bảng nghiệp vụ; location fields vẫn optional.
- Kiểm tra upload và signed URL của R2 private bucket nếu môi trường sử dụng ảnh CCCD.

## 7. Khi schema hoặc code thay đổi về sau

Triển khai migration trước hoặc cùng revision code tương thích:

```bash
npx prisma migrate deploy
npx prisma generate
npm run reference:generate
```

Sau đó deploy code và chạy smoke check liên quan. Foreign tables trong `reference_data` thuộc infrastructure, không để Prisma Migrate tạo hoặc xóa chúng.

## 8. Chuyển từ demo sang production thật

Thực hiện checklist này trước khi khách hàng thật sử dụng hệ thống:

1. Tạo Production Barbershop DB riêng.
2. Tạo R2 private bucket riêng cho production.
3. Cấu hình `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `R2_PRIVATE_BUCKET_NAME` và R2 credentials cho production.
4. Chạy `npx prisma migrate deploy` trên Production Barbershop DB.
5. Chạy `npx prisma generate` và `npm run reference:generate` cùng revision code sẽ deploy.
6. Kết nối Production Barbershop DB với Shared Data DB bằng FDW theo mục 4.
7. Verify province/ward lookup, auth, tenant write, upload và signed URL.
8. Tạo dữ liệu shop/branch/staff ban đầu cho khách hàng thật.
9. Không copy dữ liệu demo sang production nếu dữ liệu chưa được duyệt hoặc làm sạch.

## 9. Khi cần tạo Shared Data DB mới

Chỉ dùng phần này khi thay thế hoặc tạo một Shared Data DB độc lập, không phải khi thêm Barbershop environment mới.

1. Tạo `.env.shared-data` từ `.env.shared-data.example`.
2. Cấu hình `SHARED_DATABASE_URL`, `SHARED_DIRECT_URL` và location source/version.
3. Chạy:

```bash
npm run shared:generate
npm run shared:migrate
npm run shared:sync-location
npm run shared:verify-location
```

4. Tạo lại read-only roles và FDW user mappings cho từng consumer.
5. Verify dữ liệu từ từng Barbershop DB trước khi chuyển traffic.

Chi tiết schema, sync pipeline và security xem [shared-location-db.md](shared-location-db.md).
