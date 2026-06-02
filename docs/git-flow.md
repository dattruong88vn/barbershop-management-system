# Git Flow & Môi trường

## Môi trường

| Môi trường     | Branch                 | Hosting   | Database                             | Mô tả                                                                 |
| -------------- | ---------------------- | --------- | ------------------------------------ | --------------------------------------------------------------------- |
| **Local**      | `develop`, `feature/*` | Máy local | PostgreSQL local hoặc Supabase local | Dev và chạy thử trực tiếp                                             |
| **Staging**    | `staging`              | Vercel    | Supabase free tier                   | Test trước khi release, data giả, môi trường cho khách dùng thử trial |
| **Production** | `main`                 | Vercel    | Supabase Pro                         | Data thật, khách hàng thật                                            |

---

## Branch

| Branch                  | Mô tả                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| `main`                  | Code ổn định, đang chạy production                                           |
| `staging`               | Test trước khi release                                                       |
| `develop`               | Branch phát triển chính                                                      |
| `feature/tên-tính-năng` | Mỗi tính năng một branch riêng, checkout từ `develop`                        |
| `fix/mô-tả-lỗi`         | Bug fix, checkout từ `develop`                                               |
| `chore/mô-tả-công-việc` | Update docs, skills, config, và các công việc không phải feature hay bug fix |

---

## Quy tắc đặt tên branch

- Dùng **chữ thường**, **dấu gạch ngang** thay khoảng trắng
- Tên ngắn gọn, đủ hiểu
- Tiếng Anh

**Feature:**

- `feature/auth-setup`
- `feature/owner-manage-services`
- `feature/staff-create-visit`

**Bug fix:**

- `fix/login-wrong-password`
- `fix/visit-photo-warning`

**Chore (docs, skills, config...):**

- `chore/update-data-model`
- `chore/add-git-conventions`
- `chore/update-agents`

---

## Quy trình

```
develop → feature/* / fix/* / chore/* → merge vào develop → staging → main
```

1. Checkout branch từ `develop`
2. Code/update xong → merge vào `develop`
3. Merge `develop` vào `staging` → test trên môi trường staging
4. Xác nhận ổn → merge `staging` vào `main` → tự động deploy lên production

> Dự án cá nhân, solo developer — không cần pull request, merge thẳng.

---

## Cấu hình môi trường

Mỗi môi trường có file config riêng:

- `.env.local` — Local
- `.env.staging` — Staging (config trên Vercel)
- `.env.production` — Production (config trên Vercel)
