# New Environment Runbook

Checklist triển khai Barber Shop application và database vào một môi trường mới. Shared Data DB được dùng chung giữa các môi trường; không tạo hoặc sync lại Shared Data DB nếu môi trường mới chỉ là một consumer mới.

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

## 8. Khi cần tạo Shared Data DB mới

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
