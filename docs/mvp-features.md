# MVP Features

## Roles

| Role            | Tên hệ thống   | Mô tả                                                       |
| --------------- | -------------- | ----------------------------------------------------------- |
| **Superadmin**  | `superadmin`   | Toàn quyền hệ thống, hỗ trợ xử lý sự cố tài khoản chủ tiệm  |
| **Chủ tiệm**    | `owner`        | Quản lý dịch vụ, combo, nhân viên, chi nhánh                |
| **Quản lý**     | `manager`      | Quản lý cấp chi nhánh, xem báo cáo chi nhánh được phân công |
| **Lễ tân**      | `receptionist` | Tra cứu & lưu thông tin khách                               |
| **Thợ cắt tóc** | `barber`       | Tra cứu & lưu thông tin khách, upload ảnh                   |
| **Skinner**     | `skinner`      | Tra cứu & lưu thông tin khách                               |

> Chỉ role `barber` được upload ảnh kiểu tóc. Receptionist và skinner có thể tra cứu, xem ảnh/cảnh báo ảnh, nhưng không được upload ảnh.

---

## Tính năng theo nhóm

### 1. Khách hàng

- Lưu SĐT, lịch sử dịch vụ (giá, ngày giờ, chi nhánh, thợ cắt, skinner)
- Tra cứu nhanh theo tên hoặc SĐT
- Gợi ý dịch vụ, thợ cắt, skinner từ lần sử dụng trước
- Barber upload ảnh kiểu tóc vào session của khách sau khi phục vụ
- Hiển thị ảnh kiểu tóc lần trước nếu khách không nhớ
- Cho phép cập nhật SĐT khi khách đổi số — lịch sử visit không bị ảnh hưởng

### 2. Chủ tiệm (owner)

- Quản lý dịch vụ lẻ + giá (cắt, gội, ráy tai...)
- Quản lý combo (gộp nhiều dịch vụ lẻ + giá combo, có mô tả)
- Quản lý nhân viên (thợ cắt + skinner), phân công chi nhánh
- Nhân viên nghỉ làm được set inactive — không xoá khỏi DB, không hiển thị khi chọn barber/skinner mới
- Quản lý chi nhánh (phân nhân viên theo chi nhánh, doanh thu theo chi nhánh)

### 3. Nhân viên

- Đăng nhập bằng username/password do chủ tiệm tạo
- Đổi mật khẩu sau lần đăng nhập đầu tiên
- Tra cứu & lưu thông tin khách
- Chỉ barber được upload ảnh kiểu tóc sau khi phục vụ

---

## Visit & Trạng thái

| Trạng thái    | Trigger                             | Người thực hiện      |
| ------------- | ----------------------------------- | -------------------- |
| `pending`     | Khách chọn dịch vụ hoặc combo       | Bất kỳ nhân viên nào |
| `in_progress` | Bắt đầu phục vụ                     | Barber hoặc skinner  |
| `completed`   | Thu tiền, chọn tên barber + skinner | Bất kỳ nhân viên nào |

- Barber/skinner có thể chọn trước hoặc chỉnh sửa sau khi completed
- Chỉnh sửa barber/skinner trong vòng **3 tiếng kể từ completed_at**, không gia hạn
- Log lại người thay đổi thông tin visit lần cuối (`last_updated_by`)
- Một visit chỉ được chọn **dịch vụ lẻ** hoặc **combo**, không chọn cả hai nhóm cùng lúc
- Trong UI tạo visit, chọn combo sẽ bỏ chọn toàn bộ dịch vụ lẻ; chọn dịch vụ lẻ sẽ bỏ chọn toàn bộ combo
- **Dữ liệu lịch sử bất biến** — sau 3 tiếng, không được phép thay đổi giá tiền hay dịch vụ đã dùng

**Warning ảnh:**

- Hiển thị nếu visit có dịch vụ cắt tóc nhưng chưa có ảnh
- Hiển thị cho người tạo visit, barber, skinner và owner — ở cả danh sách lẫn chi tiết visit
- Chỉ role `barber` được upload ảnh kiểu tóc; các role khác chỉ xem ảnh/cảnh báo

---

## Báo cáo

| Role           | Phạm vi báo cáo                              |
| -------------- | -------------------------------------------- |
| `superadmin`   | Toàn hệ thống (xem mục Superadmin bên dưới)  |
| `owner`        | Tất cả chi nhánh của tiệm mình               |
| `manager`      | Chỉ chi nhánh được phân công                 |
| `receptionist` | Số lượng dịch vụ/combo bản thân đã thực hiện |
| `barber`       | Số lượng dịch vụ/combo bản thân đã thực hiện |
| `skinner`      | Số lượng dịch vụ/combo bản thân đã thực hiện |

**Báo cáo dành cho owner & manager:**

- Tổng doanh thu: tháng hiện tại, 3 tháng, 6 tháng, 1 năm, tất cả thời gian
- Biểu đồ doanh thu theo chi nhánh: chọn 1 hoặc nhiều tháng
- Top 10 barber, skinner có visits cao nhất
- Top 3 combo, top 3 dịch vụ được sử dụng nhiều nhất

---

## Superadmin

Khi đăng nhập, màn hình đầu tiên hiển thị 2 button lớn giữa màn hình:

- **"Quản trị hệ thống"** — xem tổng quan toàn hệ thống _(phát triển sau)_
- **"Xem theo tiệm"** — chọn tên tiệm, vào với quyền y hệt owner của tiệm đó

---

## Trial & Billing

- Superadmin tạo tài khoản chủ tiệm thủ công
- Trial 30 ngày — DB lưu `trial_expires_at` và `status` (active/expired)
- 7 ngày cuối trước khi hết hạn — hiện popup giữa màn hình mỗi khi đăng nhập
- Hết hạn → khoá tài khoản
- Thanh toán thủ công — superadmin kích hoạt lại sau khi nhận tiền

---

## Giao diện

- **Responsive design** — một codebase, tự adapt mobile/desktop
- **Mobile** — barber, skinner, receptionist dùng khi phục vụ khách trực tiếp
- **Desktop** — receptionist tại quầy, owner và manager dùng laptop quản lý
