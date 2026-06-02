# Skill: Git & Branch Conventions

## Mục đích

Quy ước đặt tên branch, commit message và git workflow cho dự án Barber Shop SaaS. Tham khảo file này khi tạo branch mới hoặc commit code.

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

## Quy tắc đặt tên commit message

Format:

```
type: mô tả ngắn gọn
```

Các type được dùng:

| Type       | Khi nào dùng                                    |
| ---------- | ----------------------------------------------- |
| `feat`     | Thêm tính năng mới                              |
| `fix`      | Sửa bug                                         |
| `chore`    | Update docs, skills, config, dependencies       |
| `refactor` | Refactor code, không thêm tính năng hay sửa bug |
| `style`    | Thay đổi UI, styling                            |
| `test`     | Thêm hoặc sửa test                              |

Ví dụ:

- `feat: setup nextauth with JWT strategy`
- `feat: add is_first_login redirect flow`
- `fix: login redirect issue`
- `chore: update skill-text-conventions`
- `chore: add onboarding guide`
- `refactor: extract auth logic to lib`

---

## Quy trình tạo branch mới

**Bắt buộc pull develop mới nhất trước khi tạo branch:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/tên-tính-năng
```

> ⚠️ Không bao giờ tạo branch mới từ develop mà không pull trước — sẽ gây conflict sau này.

---

## Quy trình commit và push

### Chỉ commit (không push)

Khi được yêu cầu chỉ commit:

1. Commit với message đúng convention
2. Dừng lại — không push, không tạo PR

```bash
git add .
git commit -m "type: mô tả"
```

### Commit và push (tạo PR)

Khi được yêu cầu push code:

1. Commit với message đúng convention
2. Push lên branch hiện tại
3. Tạo PR vào `develop`

```bash
git add .
git commit -m "type: mô tả"
git push origin tên-branch
# Tạo PR vào develop
```

---

## Git flow tổng quát

```
develop → feature/* / fix/* / chore/* → merge vào develop → staging → main
```

- Tất cả branch đều checkout từ `**develop**`
- Merge thẳng, không cần pull request review (solo developer)
- Không commit trực tiếp lên `main` hoặc `staging`
