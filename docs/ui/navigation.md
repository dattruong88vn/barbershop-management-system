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

- Phần đầu sidebar hiển thị `Xin chào, <họ tên đầy đủ>`; fallback về username cho tài khoản cũ chưa có họ tên.

- Tổng quan → `/dashboard`
- Báo cáo (collapse, mặc định đóng)
  - Doanh thu → `/reports/revenue`
  - Nhân viên → `/reports/staff`
  - Dịch vụ/Combo → `/reports/services`
  - Chi nhánh → `/reports/branches`
- Quản lý dịch vụ → `/owner/services`
- Quản lý combo → `/owner/combos`
- Quản lý nhân viên → `/owner/staff`
  - Thêm nhân viên → `/owner/staff/new`
  - Cập nhật nhân viên → `/owner/staff/:id/edit`
- Quản lý chi nhánh → `/owner/branches`

Manager role:

- `manager`
- Manager management routes use `/manager/*`.
- Manager must not access `/owner/*`; middleware redirects forbidden routes to the post-auth default.
- Sau đăng nhập, manager đi qua `/manager/select-branch`. Màn này không có sidebar.
- Nếu chỉ có một branch active, hệ thống tự chọn; nếu có nhiều branch, manager phải chọn trước khi vào workspace.
- Branch đã chọn được lưu trong session là `active_branch_id` và là context cho toàn bộ dữ liệu/API trong phiên làm việc.
- Manager có quyền quản lý dịch vụ, combo, và nhân viên. Quản lý chi nhánh chỉ dành cho owner.
- Trong màn Nhân viên, manager chỉ thấy và tạo/sửa nhân viên thuộc branch active đã chọn.
- Sidebar:
  - Tổng quan → `/dashboard`
  - Báo cáo (collapse, mặc định đóng)
    - Doanh thu → `/reports/revenue`
    - Nhân viên → `/reports/staff`
    - Dịch vụ/Combo → `/reports/services`
  - Quản lý dịch vụ → `/manager/services`
  - Quản lý combo → `/manager/combos`
  - Quản lý nhân viên → `/manager/staff`
    - Thêm nhân viên → `/manager/staff/new`
    - Cập nhật nhân viên → `/manager/staff/:id/edit`
  - Đổi chi nhánh → `/manager/select-branch` (chỉ hiển thị khi manager quản lý nhiều hơn một branch)

`Đổi chi nhánh` quay lại màn chọn không có sidebar. Sau khi chọn branch mới, ứng dụng xoá/invalidate cache dữ liệu branch cũ và mặc định quay về Tổng quan.

Nếu user không phải owner ở trạng thái `branch_suspended`, middleware đưa về `/branch-unavailable` để hiển thị thông báo chi nhánh đã ngừng hoạt động. Manager có nút đăng xuất tại màn này để đăng nhập bằng tài khoản khác. Owner vẫn được vào workspace owner để kích hoạt lại chi nhánh hoặc điều phối nhân viên.

---

## Superadmin Navigation

Landing page.

Buttons:

- Quản trị hệ thống
- Xem theo tiệm
