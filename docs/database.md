# Database

## Công nghệ
- **PostgreSQL** — relational database, phù hợp data model có nhiều quan hệ
- **Prisma** — ORM type-safe, migration có version control

---

## Multi-tenancy
Sử dụng **Shared database, shared schema** — tất cả tiệm dùng chung table, phân biệt bằng `shop_id`.

- Chi phí DB do chủ sản phẩm chịu, tính vào giá SaaS hàng tháng
- Khách hàng đăng ký xong dùng luôn, không cần setup thêm
- Onboarding nhanh, vận hành đơn giản

---

## Subscription Plan
- Mỗi tenant (tiệm) có trường `plan` trong DB ngay từ đầu
- Các giá trị: `basic`, `pro`, `pro_max`
- MVP tất cả tiệm mặc định là `basic`
- Logic feature flag (active/deactive tính năng theo plan) sẽ được build khi Phase 2 chuẩn bị ra mắt

---

## MVP
Chỉ cần đảm bảo 2 việc:
- **Automatic backup hàng ngày** — Railway hoặc Render có sẵn tính năng này
- **Monitoring cơ bản** — nhận alert qua email khi DB có vấn đề

---

## Deploy cho MVP
- **Vercel** + **Supabase free tier** — dùng cho giai đoạn development và thử nghiệm
- Dùng cronjob ping DB định kỳ để tránh Supabase auto-pause sau 7 ngày
- Khi có khách dùng thật → nâng lên Supabase Pro ($25/tháng) hoặc chuyển sang Railway

---

## Phase sau (khi số lượng khách hàng tăng)
Các giải pháp cần xem xét khi scale:
- **PostgreSQL replication** — primary + replica, tránh single point of failure
- **Multi-region failover** — đảm bảo uptime khi một region gặp sự cố
- **Uptime SLA** — cam kết với khách hàng về thời gian hoạt động (ví dụ 99.9%)
- **Connection pooling** — PgBouncer hoặc Supabase để xử lý nhiều kết nối đồng thời