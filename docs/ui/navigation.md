# Navigation

## Mobile Navigation

Roles:

- `receptionist`
- `barber`
- `skinner`

Bottom navigation:

1. Hôm nay → `/visits` (`ROUTES.visits`)
2. Tìm → `/customers` (`ROUTES.customers`)
3. Báo cáo → `/reports` (`ROUTES.reports`)
4. Đăng xuất → NextAuth `signOut`, redirect `/login`

Ghi chú:

- MVP không có menu Photos độc lập.
- Mobile bottom navigation không có item `Tạo`; tạo visit là action trong Customer Detail hoặc Visit List.
- Hair photos được xử lý trong Customer Detail và Visit Detail.

---

## Desktop Navigation

Owner role:

- `owner`

Sidebar:

- Tổng quan
- Báo cáo
  - Doanh thu
  - Nhân viên
  - Dịch vụ
  - Combo
  - Chi nhánh
- Dịch vụ
- Combo
- Nhân viên
- Chi nhánh

Manager role:

- `manager`
- MVP business scope là branch-level reporting.
- Manager có quyền quản lý dịch vụ, combo, và nhân viên. Branch management remains owner-only.
- Sidebar:
  - Tổng quan
  - Báo cáo
    - Doanh thu
    - Nhân viên
    - Dịch vụ
    - Combo
  - Dịch vụ
  - Combo
  - Nhân viên

---

## Superadmin Navigation

Landing page.

Buttons:

- Quản trị hệ thống
- Xem theo tiệm
