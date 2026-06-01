# Git Flow & Môi trường

## Môi trường

| Môi trường | Branch | Hosting | Database | Mô tả |
|-----------|--------|---------|----------|-------|
| **Local** | `develop`, `feature/*` | Máy local | PostgreSQL local hoặc Supabase local | Dev và chạy thử trực tiếp |
| **Staging** | `staging` | Vercel | Supabase free tier | Test trước khi release, data giả, môi trường cho khách dùng thử trial |
| **Production** | `main` | Vercel | Supabase Pro | Data thật, khách hàng thật |

---

## Branch

| Branch | Mô tả |
|--------|-------|
| `main` | Code ổn định, đang chạy production |
| `staging` | Test trước khi release |
| `develop` | Branch phát triển chính |
| `feature/tên-tính-năng` | Mỗi tính năng một branch riêng |

---

## Quy trình

```
feature/* → develop → staging → main
```

1. Tạo branch `feature/tên-tính-năng` từ `develop`
2. Code xong → merge vào `develop`
3. Merge `develop` vào `staging` → test trên môi trường staging
4. Xác nhận ổn → merge `staging` vào `main` → tự động deploy lên production

---

## Cấu hình môi trường

Mỗi môi trường có file config riêng:
- `.env.local` — Local
- `.env.staging` — Staging (config trên Vercel)
- `.env.production` — Production (config trên Vercel)