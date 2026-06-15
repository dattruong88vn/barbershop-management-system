# User Flows

## Luồng Đăng Nhập

```text
Đăng nhập
    ↓
Xác thực
    ↓
isFirstLogin?
    ├─ Có    → Đổi mật khẩu
    └─ Không → Dashboard / Customers
```

---

## Luồng Tìm Khách

```text
Customer Search
    ↓
Tìm theo tên / số điện thoại
    ↓
Tìm thấy khách?
    ├─ Có    → Customer Detail
    └─ Không → Tạo khách hàng
```

---

## Luồng Tạo Khách Hàng

```text
Customer Search
    ↓
Tạo khách hàng
    ↓
Lưu thành công
    ↓
Customer Detail
```

---

## Luồng Tạo Visit

```text
Customer Detail
    ↓
Tạo visit
    ↓
Chọn services
    ↓
Hoặc chọn combos
    ↓
Nếu chọn combos → uncheck services
Nếu chọn services → uncheck combos
    ↓
Chọn barber (không bắt buộc)
    ↓
Chọn skinner (không bắt buộc)
    ↓
Kiểm tra tổng tiền
    ↓
Tạo visit
    ↓
Backend snapshot tên/giá/role phụ trách
    ↓
Nếu là combo → phân bổ doanh thu xuống service con
    ↓
Visit Detail
```

---

## Luồng Upload Hair Photo

Backend status:

- Photo upload API chưa có.
- Chỉ implement flow này sau khi có backend/R2 upload support.
- Chỉ role `barber` được thực hiện flow upload ảnh.
- Role khác chỉ xem ảnh/cảnh báo ảnh và không thấy action upload.

```text
Visit Detail
    ↓
isBarber?
    ├─ Không → Ẩn action upload
    └─ Có
    ↓
Upload photo
    ↓
Chụp ảnh / chọn ảnh
    ↓
Preview
    ↓
Upload
    ↓
Refresh Visit Detail
```

---

## Luồng Cập Nhật Barber/Skinner

```text
Visit Detail
    ↓
Đã completed?
    ├─ Không → Ẩn action
    └─ Có
          ↓
Trong vòng 3 giờ?
          ├─ Không → Chỉ xem
          └─ Có
                ↓
                Edit
                ↓
                Save
```

---

## Luồng Quản Lý Service

```text
Services List
    ↓
Create/Edit
    ↓
Save
    ↓
Refresh list
```

---

## Luồng Quản Lý Combo

```text
Combos List
    ↓
Create/Edit
    ↓
Chọn services
    ↓
Save
    ↓
Refresh list
```

---

## Luồng Quản Lý Staff

```text
Staff List
    ↓
Create/Edit
    ↓
Gán role
    ↓
Gán branch
    ↓
Save
```

---

## Luồng Quản Lý Branch

```text
Branches List
    ↓
Create/Edit
    ↓
Save
```

---

## Luồng Report

Backend status:

- Personal report API đã implement tại `GET /api/reports/personal?period=month|year|all&month=YYYY-MM` cho `receptionist`, `barber`, `skinner`.
- Personal report dùng snapshot service/combo và `responsibleRoleSnapshot`; combo được đếm distinct theo combo trong từng visit để tránh nhân đôi do phân bổ service con.
- Bộ chọn kỳ báo cáo mặc định tháng hiện tại, gồm checkbox Tháng/Năm hiện tại/Tất cả thời gian. Khi chọn Tháng, hiển thị month picker giới hạn từ 12 tháng gần nhất đến tháng hiện tại.
- Owner/manager report API chưa implement; giữ Reports quản lý ở dạng placeholder/mock cho đến khi có backend support.
- Owner/manager report tương lai phải dùng `allocatedPrice` và snapshot fields; doanh thu thiếu nhân viên tương ứng đưa vào nhóm `Chưa xác định`.

```text
Reports
    ↓
Chọn date range
    ↓
Chọn branch
    ↓
Load data
    ↓
Charts + tables
```

---

## Luồng Trial Warning

Backend status:

- Cần session/API data cho `trialExpiresAt` và shop `status`.
- Data này chưa được xác nhận có trong UI/session contract hiện tại.

```text
Login success
    ↓
Trial <= 7 ngày?
    ├─ Không
    └─ Có
          ↓
          Warning modal
          ↓
          Tiếp tục
```

---

## Luồng Superadmin

```text
Đăng nhập
    ↓
Landing

├─ Quản trị hệ thống
└─ Xem theo tiệm

      ↓
      Chọn tiệm
      ↓
      Owner experience
```
