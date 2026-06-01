# Tech Stack

## Frontend
- **Next.js 14+** (App Router) — SSR/SSG, SEO tốt, deploy dễ
- **Tailwind CSS** — utility-first CSS, styling nhanh
- **shadcn/ui** — component library xây dựng trên Tailwind, copy trực tiếp vào project, toàn quyền tuỳ chỉnh

## Backend
- **Next.js API Routes** — toàn stack trong một project, phù hợp build một mình, đủ cho MVP và mục tiêu khách hàng nhỏ lẻ

## Database
- **PostgreSQL** — relational database, phù hợp data model có nhiều quan hệ
- **Prisma** — ORM type-safe, migration có version control

## Auth
- **NextAuth.js + Credentials Provider** — tự quản lý username/password, miễn phí, tích hợp tốt với Next.js + Prisma
- Chủ tiệm tạo tài khoản cho nhân viên trong app
- Nhân viên đổi mật khẩu sau lần đăng nhập đầu tiên
- Người đi cắt tóc không có tài khoản — chỉ là dữ liệu, tra cứu bằng tên hoặc SĐT

## File Storage
- **Cloudflare R2** — lưu ảnh kiểu tóc
- Free tier: 10GB storage, 1 triệu upload, 10 triệu lượt đọc/tháng — đủ dùng cho MVP
- Sau free tier: $0.015/GB/tháng, egress hoàn toàn miễn phí

## Deploy
- **Vercel** — Next.js (Frontend + API Routes), free tier đủ dùng cho giai đoạn thử nghiệm
- **Supabase free tier** — PostgreSQL, dùng cronjob ping DB định kỳ để tránh auto-pause sau 7 ngày
- Khi có khách dùng thật → nâng lên Supabase Pro ($25/tháng) hoặc chuyển sang Railway