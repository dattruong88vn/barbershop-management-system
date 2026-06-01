# Skill: Project Setup Conventions

## Mục đích

Lưu lại các quy ước và lỗi đã gặp trong quá trình setup môi trường cho dự án Barber Shop SaaS. Tham khảo file này trước khi setup môi trường mới hoặc khi gặp lỗi liên quan.

---

## Node.js

- **Phải dùng Node latest (v22+)** — Node v20 gây treo khi chạy `npx prisma db seed`
- Nguyên nhân: `ts-node` không tương thích tốt với Node v20

---

## Prisma

- **Phải dùng Prisma v6** — version mới hơn không tương thích với Next.js + Supabase trong dự án này
- Khi dùng Prisma với Supabase, **không dùng Direct connection string** — phải dùng **Transaction pooler + Session pooler**
- Trong `schema.prisma` phải cấu hình cả `url` và `directUrl`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- `DATABASE_URL` — Transaction pooler, port **6543**, dùng cho queries hàng ngày
- `DIRECT_URL` — Session pooler, port **5432**, dùng riêng cho migration

---

## Supabase

- Tạo **Organization riêng** cho dự án (không dùng chung với project khác)
- Tạo **3 project riêng biệt** cho 3 môi trường: local, staging, production
- Mỗi môi trường có file config riêng: `.env.local`, `.env.staging`, `.env.production`
- Free tier: 2 project miễn phí per organization

---

## Setup môi trường mới (clone repo)

```bash
# 1. Clone & cài dependencies
git clone repo-url
cd project
npm install

# 2. Setup env
cp .env.example .env.local
# Điền DATABASE_URL và DIRECT_URL từ Supabase project mới

# 3. Chạy migration
npx prisma migrate deploy

# 4. Seed data (tuỳ chọn)
npx prisma db seed

# 5. Chạy dev server
npm run dev
```

---

## Các lệnh quan trọng

```bash
npx prisma migrate dev --name init   # Tạo migration mới
npx prisma migrate deploy            # Apply migration
npx prisma db seed                   # Seed sample data
npx prisma generate                  # Regenerate Prisma client
npx prisma studio                    # Mở Prisma GUI
```
