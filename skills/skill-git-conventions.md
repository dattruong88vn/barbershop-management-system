# Skill: Git & Branch Conventions

## Mục đích

Quy ước đặt tên branch và git flow cho dự án Barber Shop SaaS. Tham khảo file này khi tạo branch mới.

---

## Quy tắc đặt tên branch

- Dùng **chữ thường**, **dấu gạch ngang** thay khoảng trắng
- Tên ngắn gọn, đủ hiểu — không cần quá chi tiết
- Tiếng Anh cho nhất quán với codebase

### Feature

```
feature/tên-tính-năng
```

Ví dụ:

- `feature/auth-setup`
- `feature/owner-manage-services`
- `feature/staff-create-visit`

### Bug fix

```
fix/mô-tả-lỗi
```

Ví dụ:

- `fix/login-wrong-password`
- `fix/visit-photo-warning`

### Chore (docs, skills, config...)

```
chore/mô-tả-công-việc
```

Ví dụ:

- `chore/update-data-model`
- `chore/add-git-conventions`
- `chore/update-agents`

---

## Quy trình

```
develop → feature/* / fix/* / chore/* → merge vào develop → staging → main
```

- Tất cả branch đều checkout từ `**develop**`
- Merge thẳng, không cần pull request (solo developer)
- Không code trực tiếp lên `main` hoặc `staging`
