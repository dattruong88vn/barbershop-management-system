# Navigation

## Mobile Navigation

Roles:

- `receptionist`
- `barber`
- `skinner`

Bottom navigation:

1. Customers
2. Visits
3. Create Visit
4. Account

Ghi chú:

- MVP không có menu Photos độc lập.
- Hair photos được xử lý trong Customer Detail và Visit Detail.

---

## Desktop Navigation

Owner role:

- `owner`

Sidebar:

- Dashboard
- Services
- Combos
- Staff
- Branches
- Reports
- Account

Manager role:

- `manager`
- MVP business scope là branch-level reporting.
- Manager navigation không được giả định có quyền vào Services, Combos, Staff hoặc Branches nếu backend permissions chưa implement.
- Sidebar manager đề xuất hiện tại: Dashboard, Reports, Account.

---

## Superadmin Navigation

Landing page.

Buttons:

- Quản trị hệ thống
- Xem theo tiệm
