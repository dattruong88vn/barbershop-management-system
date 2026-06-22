# Shared Data Database

Shared Data DB lưu các bộ dữ liệu dùng chung cho nhiều dự án. Module đầu tiên là location, gồm danh mục tỉnh/thành và phường/xã Việt Nam. Barbershop application không giữ connection string của database này; Barbershop Postgres đọc dữ liệu qua `postgres_fdw`.

Checklist kết nối một application environment mới vào Shared Data DB xem [new-environment-runbook.md](new-environment-runbook.md).

## Ownership Boundary

- `prisma/`: chỉ thuộc Barbershop DB.
- `infrastructure/shared-location-db/`: schema, migration và sync pipeline location trong Shared Data DB.
- Barbershop DB chỉ lưu location codes trên `users`; không sao chép bảng `provinces` hoặc `wards`.
- Runtime application chỉ dùng `DATABASE_URL` và `DIRECT_URL` của Barbershop.

## Shared DB Setup

1. Tạo Supabase project riêng.
2. Copy `.env.shared-data.example` thành `.env.shared-data`.
3. Điền `SHARED_DATABASE_URL` bằng transaction pooler cho sync runtime và `SHARED_DIRECT_URL` bằng direct/session connection dành cho migration.
4. Chọn source URLs location và tăng `LOCATION_SOURCE_VERSION` khi dataset hành chính thay đổi.
5. Chạy:

```bash
npm run shared:generate
npm run shared:migrate
npm run shared:sync-location
npm run shared:verify-location
```

`shared:sync-location` tải JSON, validate code duy nhất, validate ward thuộc province, bulk-create code mới, chỉ update record thay đổi, deactivate code không còn trong dataset và ghi checksum vào `dataset_versions`. Các thao tác ghi được chia thành batch ngắn để tránh interactive transaction timeout; script không hard delete đơn vị hành chính cũ.

Source mặc định là Province Open API v2 hậu sáp nhập: `/api/v2/p/` cho tỉnh/thành và `/api/v2/w/` cho phường/xã. API trả code dạng number; sync pipeline chuẩn hóa province code thành 2 chữ số và ward code thành 5 chữ số trước khi validate/upsert.

### Supabase Project Checklist

Shared Data DB cần là một Supabase project riêng với password riêng. Không dùng chung connection string của Barbershop DB.

1. Tạo project mới trong Supabase Dashboard, ví dụ `shared-data-db`.
2. Vào Project Settings → Database → Connection string.
3. Copy transaction pooler port `6543` vào `SHARED_DATABASE_URL`.
4. Copy session pooler port `5432` vào `SHARED_DIRECT_URL`.
5. Chạy `npm run shared:migrate` để tạo bảng `provinces`, `wards`, `dataset_versions`.
6. Chạy `npm run shared:sync-location` để kéo dataset tỉnh/thành, phường/xã.
7. Chạy `npm run shared:verify-location` để kiểm tra số lượng active và dataset mới nhất.
8. Chạy `infrastructure/shared-location-db/sql/01-shared-db-readonly-role.sql` trên Shared DB để tạo user chỉ đọc.
9. Lấy Shared DB project ref từ Dashboard URL hoặc Session pooler username, rồi chạy `infrastructure/shared-location-db/sql/02-barbershop-fdw.sql` trên Barbershop DB để import `reference_data.provinces` và `reference_data.wards`.
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

- `01-shared-db-readonly-role.sql`: chạy trên Shared Data DB để tạo role chỉ đọc.
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

Chạy bằng SQL Editor trên từng consumer database, bao gồm Barbershop DB. Thay placeholder bằng Session pooler endpoint và read-only credentials của Shared DB. Có thể dùng template `infrastructure/shared-location-db/sql/02-barbershop-fdw.sql`.

Supabase Shared Pooler (Supavisor) cần project ref để xác định tenant. Vì vậy username trong user mapping phải có dạng `<shared-location-readonly-user>.<shared-project-ref>`, không chỉ là tên read-only role. Lấy project ref từ URL `https://supabase.com/dashboard/project/<shared-project-ref>` hoặc phần sau dấu chấm trong Session pooler username `postgres.<shared-project-ref>`.

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
    user '<shared-location-readonly-user>.<shared-project-ref>',
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

FDW tables là infrastructure-owned, không thuộc Prisma Migrate của Barbershop. Read-only models được khai báo riêng trong `prisma/reference-data.prisma` và generate thành client riêng; không thêm schema này vào migration path của Barbershop.

Generate client bằng:

```bash
npm run reference:generate
```

`npm run dev` và `npm run build` tự generate client này trước khi chạy Next.js. Runtime không dùng `$queryRaw`; location API query foreign tables qua read-only Prisma client trong `src/lib/referenceDataPrisma.ts`.

Internal endpoints:

- `GET /api/locations/provinces`: trả danh sách tỉnh/thành active.
- `GET /api/locations/wards?provinceCode=<code>`: validate province rồi trả danh sách phường/xã active.

Hai endpoint yêu cầu session hợp lệ. Staff create/update cũng validate province và quan hệ ward-province qua cùng read-only client trước khi ghi location codes vào `users`.

## Failure Behavior

- Nếu Shared DB hoặc FDW unavailable, location lookup API trả error state; không ảnh hưởng các bảng nghiệp vụ hiện có.
- Form vẫn cho phép bỏ trống location vì toàn bộ field location là optional.
- Không tự chuyển free-text legacy thành province/ward code.

## Dataset Update Runbook

1. Cập nhật source/version trong `.env.shared-data`.
2. Chạy sync trên staging Shared DB.
3. Kiểm tra count và diff code active/inactive.
4. Duyệt thủ công nếu số lượng thay đổi bất thường.
5. Chạy sync production.
6. Kiểm tra query qua FDW từ mỗi consumer database.
