# Navigation

## Mobile Navigation

Roles:

- `receptionist`
- `barber`
- `skinner`

Breakpoint:

- Áp dụng cho role nhân viên trên viewport dưới desktop (`<1024px`).
- Trên desktop (`1024px+`), role nhân viên không hiển thị navigation hoặc workflow desktop; app hiển thị fallback toàn cục "Chỉ hỗ trợ trên điện thoại".

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
- Owner management routes use `/owner/*`.
- Owner must not access `/manager/*`; middleware redirects forbidden routes to the post-auth default.

Sidebar:

- Tổng quan → `/dashboard`
- Báo cáo
  - Doanh thu → `/reports/revenue`
  - Nhân viên → `/reports/staff`
  - Dịch vụ → `/reports/services`
  - Combo → `/reports/combos`
  - Chi nhánh → `/reports/branches`
- Dịch vụ → `/owner/services`
- Combo → `/owner/combos`
- Nhân viên → `/owner/staff`
- Chi nhánh → `/owner/branches`

Manager role:

- `manager`
- Manager management routes use `/manager/*`.
- Manager must not access `/owner/*`; middleware redirects forbidden routes to the post-auth default.
- MVP business scope là branch-level reporting.
- Manager có quyền quản lý dịch vụ, combo, và nhân viên. Branch management remains owner-only.
- Trong màn Nhân viên, manager chỉ thấy và tạo/sửa nhân viên thuộc chi nhánh của chính manager.
- Sidebar:
  - Tổng quan → `/dashboard`
  - Báo cáo
    - Doanh thu → `/reports/revenue`
    - Nhân viên → `/reports/staff`
    - Dịch vụ → `/reports/services`
    - Combo → `/reports/combos`
  - Dịch vụ → `/manager/services`
  - Combo → `/manager/combos`
  - Nhân viên → `/manager/staff`

---

## Superadmin Navigation

Landing page.

Buttons:

- Quản trị hệ thống
- Xem theo tiệm
