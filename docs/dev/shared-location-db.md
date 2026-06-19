# Shared Location Database

Shared Location DB lưu danh mục tỉnh/thành và phường/xã Việt Nam để nhiều dự án dùng chung. Barbershop application không giữ connection string của database này; Barbershop Postgres đọc dữ liệu qua `postgres_fdw`.

## Ownership Boundary

- `prisma/`: chỉ thuộc Barbershop DB.
- `infrastructure/shared-location-db/`: schema, migration và sync pipeline của Shared Location DB.
- Barbershop DB chỉ lưu location codes trên `users`; không sao chép bảng `provinces` hoặc `wards`.
- Runtime application chỉ dùng `DATABASE_URL` và `DIRECT_URL` của Barbershop.

## Shared DB Setup

1. Tạo Supabase project riêng.
2. Copy `.env.shared-location.example` thành `.env.shared-location`.
3. Điền `LOCATION_DATABASE_URL` bằng transaction pooler cho sync runtime và `LOCATION_DIRECT_URL` bằng direct/session connection dành cho migration.
4. Chọn source URLs và tăng `LOCATION_SOURCE_VERSION` khi dataset thay đổi.
5. Chạy:

```bash
npm run location:generate
npm run location:migrate
npm run location:sync
npm run location:verify
```

`location:sync` tải JSON, validate code duy nhất, validate ward thuộc province, upsert dữ liệu active, deactivate code không còn trong dataset và ghi checksum vào `dataset_versions`. Script không hard delete đơn vị hành chính cũ.

### Supabase Project Checklist

Shared Location DB cần là một Supabase project riêng với password riêng. Không dùng chung connection string của Barbershop DB.

1. Tạo project mới trong Supabase Dashboard, ví dụ `shared-location-db`.
2. Vào Project Settings → Database → Connection string.
3. Copy transaction pooler port `6543` vào `LOCATION_DATABASE_URL`.
4. Copy session pooler port `5432` vào `LOCATION_DIRECT_URL`.
5. Chạy `npm run location:migrate` để tạo bảng `provinces`, `wards`, `dataset_versions`.
6. Chạy `npm run location:sync` để kéo dataset tỉnh/thành, phường/xã.
7. Chạy `npm run location:verify` để kiểm tra số lượng active và dataset mới nhất.
8. Chạy `infrastructure/shared-location-db/sql/01-shared-db-readonly-role.sql` trên Shared DB để tạo user chỉ đọc.
9. Chạy `infrastructure/shared-location-db/sql/02-barbershop-fdw.sql` trên Barbershop DB để import `reference_data.provinces` và `reference_data.wards`.
10. Chạy `infrastructure/shared-location-db/sql/03-barbershop-fdw-verify.sql` trên Barbershop DB để xác nhận Barbershop DB đọc được dữ liệu qua FDW.

## Shared Schema

### `provinces`

- `code`: official code, primary key.
- `name`, `full_name`, `type`.
- `is_active`.
- `effective_from`, `effective_to`.
- `created_at`, `updated_at`.

### `wards`

- `code`: official code, primary key.
- `province_code`: FK tới `provinces.code`.
- `name`, `full_name`, `type`.
- `is_active`.
- `effective_from`, `effective_to`.
- `created_at`, `updated_at`.

### `dataset_versions`

Lưu source, version, checksum, số lượng province/ward và thời điểm import để audit mỗi lần đồng bộ.

## SQL Templates

Các file SQL template nằm trong `infrastructure/shared-location-db/sql/`:

- `01-shared-db-readonly-role.sql`: chạy trên Shared Location DB để tạo role chỉ đọc.
- `02-barbershop-fdw.sql`: chạy trên Barbershop DB để connect qua `postgres_fdw` và import foreign tables.
- `03-barbershop-fdw-verify.sql`: chạy trên Barbershop DB để kiểm tra dữ liệu đọc qua FDW.

Thay placeholder trước khi chạy. Không commit password thật vào repo.

## Read-only Role

Trên Shared DB, tạo role riêng cho mỗi consumer hoặc một role read-only dùng chung có kiểm soát. Role chỉ cần:

- `CONNECT` database.
- `USAGE` schema chứa location tables.
- `SELECT` trên `provinces`, `wards`.

Không cấp quyền ghi hoặc quyền truy cập `dataset_versions` nếu consumer không cần audit metadata.

## Configure `postgres_fdw`

Chạy bằng SQL Editor trên từng consumer database, bao gồm Barbershop DB. Thay placeholder bằng direct endpoint và read-only credentials của Shared DB. Có thể dùng template `infrastructure/shared-location-db/sql/02-barbershop-fdw.sql`.

```sql
create extension if not exists postgres_fdw with schema extensions;

create schema if not exists reference_data;

create server shared_location_server
  foreign data wrapper postgres_fdw
  options (
    host '<shared-db-host>',
    port '5432',
    dbname 'postgres',
    sslmode 'require'
  );

create user mapping for postgres
  server shared_location_server
  options (
    user '<shared-location-readonly-user>',
    password '<shared-location-readonly-password>'
  );

import foreign schema public
  limit to (provinces, wards)
  from server shared_location_server
  into reference_data;
```

Use the actual database role used by migrations/runtime instead of `postgres` when environments use a dedicated role.

## Security

- Không add `reference_data` vào Supabase Data API exposed schemas.
- FDW không cung cấp RLS; chỉ backend được query foreign tables.
- Không commit Shared DB password.
- Rotate read-only credentials định kỳ và khi consumer bị thu hồi.
- Mỗi project nên có user mapping riêng để revoke độc lập.

## Verification

Chạy trên Barbershop SQL Editor:

```sql
select count(*) from reference_data.provinces where is_active = true;

select code, name
from reference_data.wards
where province_code = '<province-code>'
  and is_active = true
order by name;
```

Xác nhận read-only user không thể insert, update hoặc delete trên Shared DB.

## Prisma Boundary

FDW tables là infrastructure-owned, không thuộc Prisma Migrate của Barbershop. Chỉ map read-only models vào Barbershop Prisma khi bắt đầu implement internal location API, và phải kiểm tra migration diff không cố tạo/xoá foreign tables.

Runtime không dùng `$queryRaw`; API phải query qua Prisma models sau khi mapping được xác nhận trên staging.

## Failure Behavior

- Nếu Shared DB hoặc FDW unavailable, location lookup API trả error state; không ảnh hưởng các bảng nghiệp vụ hiện có.
- Form vẫn cho phép bỏ trống location vì toàn bộ field location là optional.
- Không tự chuyển free-text legacy thành province/ward code.

## Dataset Update Runbook

1. Cập nhật source/version trong `.env.shared-location`.
2. Chạy sync trên staging Shared DB.
3. Kiểm tra count và diff code active/inactive.
4. Duyệt thủ công nếu số lượng thay đổi bất thường.
5. Chạy sync production.
6. Kiểm tra query qua FDW từ mỗi consumer database.
