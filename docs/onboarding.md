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

### Bước 2 — Tạo branch làm việc

Luôn pull `develop` mới nhất trước khi tạo branch.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ten-tinh-nang
```

Dùng `feature/*` cho tính năng mới, `fix/*` cho bug fix, và `chore/*` cho docs, config hoặc maintenance.

### Bước 3 — Tạo Supabase project

1. Vào [supabase.com](https://supabase.com), tạo project mới trong Organization **Barbershop**
2. Vào **Database → Settings → Connection string**
3. Copy **Transaction pooler** (port 6543) — dùng cho `DATABASE_URL`
4. Copy **Session pooler** (port 5432) — dùng cho `DIRECT_URL`

> ⚠️ Không dùng Direct connection string — phải dùng pooler khi có Prisma

### Bước 4 — Setup biến môi trường

```bash
cp .env.example .env.local
```

Điền đầy đủ các giá trị trong `.env.local`.

### Bước 5 — Cấu hình Prisma schema

Đảm bảo `prisma/schema.prisma` có đúng cấu hình:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Bước 6 — Chạy migration

```bash
npx prisma migrate deploy
```

### Bước 7 — Seed data mẫu (tuỳ chọn)

```bash
npx prisma db seed
```

### Bước 8 — Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Nếu port `3000` đang được dùng, Next.js sẽ in URL localhost khác trong terminal.

---

## Start source code hằng ngày

Dùng phần này khi project đã được clone và `.env.local` đã có sẵn.

### 1. Tạo branch làm việc

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ten-tinh-nang
```

Đổi prefix branch theo loại công việc: `feature/*`, `fix/*`, hoặc `chore/*`.

### 2. Kiểm tra Node.js

```bash
node -v
```

Phải dùng Node.js v22 trở lên.

### 3. Cài hoặc cập nhật dependencies

```bash
npm install
```

Nếu gặp lỗi thiếu native package như `lightningcss.darwin-arm64.node`, cài lại dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. Kiểm tra biến môi trường

File `.env.local` cần có tối thiểu:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

`DATABASE_URL` dùng Supabase Transaction pooler port `6543`. `DIRECT_URL` dùng Supabase Session pooler port `5432`.

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Apply migration

```bash
npx prisma migrate deploy
```

### 7. Chạy source code

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

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
│   ├── apiResponse.ts    # Shared response helpers
│   ├── fetchClient.ts    # Fetch wrapper cho Client Components
│   ├── fetchServer.ts    # Fetch wrapper cho Server Components
│   └── queryClient.ts    # TanStack Query config
└── types/                # TypeScript types & interfaces
```

---

## Chạy tests

Chỉ viết hoặc update unit test khi user yêu cầu rõ ràng. Khi verify test sau khi viết hoặc sửa, chỉ chạy những test file mới tạo hoặc vừa update, không chạy toàn bộ test suite nếu không được yêu cầu.

```bash
npx vitest run src/app/api/customers/route.test.ts
npx vitest run src/hooks/useCustomers.test.tsx src/app/customers/page.test.tsx
```

Chỉ chạy toàn bộ project khi user yêu cầu rõ ràng hoặc khi thay đổi chạm vào shared behavior lớn:

```bash
npx vitest run
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
