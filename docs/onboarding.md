# Onboarding Guide

Hướng dẫn chi tiết cho developer mới join dự án hoặc setup môi trường mới.

---

## Yêu cầu

- **Node.js latest (v22+)** — KHÔNG dùng v20, sẽ bị treo khi chạy seed
- **Prisma v6** — KHÔNG dùng version mới hơn, không tương thích với Next.js + Supabase
- Tài khoản Supabase
- Tài khoản Cloudflare (cho R2 storage)

---

## Setup từ đầu

### Bước 1 — Clone repo & cài dependencies

```bash
git clone repo-url
cd project
npm install
```

### Bước 2 — Tạo Supabase project

1. Vào [supabase.com](https://supabase.com), tạo project mới trong Organization **Barbershop**
2. Vào **Database → Settings → Connection string**
3. Copy **Transaction pooler** (port 6543) — dùng cho `DATABASE_URL`
4. Copy **Session pooler** (port 5432) — dùng cho `DIRECT_URL`

> ⚠️ Không dùng Direct connection string — phải dùng pooler khi có Prisma

### Bước 3 — Setup biến môi trường

```bash
cp .env.example .env.local
```

Điền đầy đủ các giá trị trong `.env.local`.

### Bước 4 — Cấu hình Prisma schema

Đảm bảo `prisma/schema.prisma` có đúng cấu hình:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Bước 5 — Chạy migration

```bash
npx prisma migrate deploy
```

### Bước 6 — Seed data mẫu (tuỳ chọn)

```bash
npx prisma db seed
```

### Bước 7 — Chạy dev server

```bash
npm run dev
```

---

## Cấu trúc thư mục quan trọng

```
src/
├── app/                  # Next.js App Router pages & API routes
├── components/           # Reusable UI components
├── constants/
│   ├── routes/
│   │   ├── appRoutes.ts  # Frontend navigation URLs
│   │   ├── apiRoutes.ts  # API endpoint URLs
│   │   └── index.ts
│   └── texts/            # UI text strings
├── hooks/                # TanStack Query hooks
├── lib/
│   ├── apiConfig.ts      # Default request config
│   ├── fetchClient.ts    # Fetch wrapper cho Client Components
│   ├── fetchServer.ts    # Fetch wrapper cho Server Components
│   └── queryClient.ts    # TanStack Query config
└── types/                # TypeScript types & interfaces
```

---

## Chạy tests

```bash
npx vitest run          # Chạy tất cả test một lần
npx vitest              # Watch mode
npx vitest run --coverage  # Coverage report
```

---

## Git Flow

Tham khảo [git-flow.md](git-flow.md) để biết quy trình làm việc và quy tắc đặt tên branch.

## Tài liệu dự án

- [MVP Features](mvp-features.md) — tính năng và roles
- [Data Model](data-model.md) — thiết kế database
- [Tech Stack](tech-stack.md) — công nghệ sử dụng

## Conventions cho AI Agent

Tham khảo thư mục `/skills` trước khi làm việc với Codex hoặc Claude Code.
