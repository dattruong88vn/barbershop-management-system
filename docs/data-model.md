# Data Model

## Bảng `shops` — thông tin tiệm

| Trường             | Kiểu      | Ghi chú                                      |
| ------------------ | --------- | -------------------------------------------- |
| `id`               | uuid      | PK                                           |
| `name`             | string    | Tên tiệm                                     |
| `address`          | string    | Địa chỉ                                      |
| `plan`             | enum      | `basic`, `pro`, `pro_max` — mặc định `basic` |
| `status`           | enum      | `active`, `expired`                          |
| `trial_expires_at` | timestamp | Ngày hết hạn trial                           |
| `created_at`       | timestamp |                                              |

---

## Bảng `branches` — chi nhánh

| Trường       | Kiểu      | Ghi chú           |
| ------------ | --------- | ----------------- |
| `id`         | uuid      | PK                |
| `shop_id`    | uuid      | FK → shops        |
| `name`       | string    | Tên chi nhánh     |
| `address`    | string    | Địa chỉ chi nhánh |
| `created_at` | timestamp |                   |

---

## Bảng `users` — tài khoản đăng nhập

| Trường           | Kiểu      | Ghi chú                                                                   |
| ---------------- | --------- | ------------------------------------------------------------------------- |
| `id`             | uuid      | PK                                                                        |
| `shop_id`        | uuid      | FK → shops (null nếu là superadmin)                                       |
| `branch_id`      | uuid      | FK → branches, có thể thay đổi bởi owner                                  |
| `username`       | string    | Unique trong phạm vi shop                                                 |
| `password_hash`  | string    |                                                                           |
| `role`           | enum      | `superadmin`, `owner`, `manager`, `receptionist`, `barber`, `skinner`     |
| `status`         | enum      | `active`, `inactive` — inactive khi nhân viên nghỉ làm, không xoá khỏi DB |
| `is_first_login` | boolean   | Bắt buộc đổi mật khẩu nếu true                                            |
| `created_at`     | timestamp |                                                                           |

> Nhân viên nghỉ làm được set `status = inactive`, không hiển thị khi chọn barber/skinner cho visit mới. Lịch sử visit vẫn giữ nguyên.

---

## Bảng `services` — dịch vụ lẻ

| Trường       | Kiểu      | Ghi chú                                                       |
| ------------ | --------- | ------------------------------------------------------------- |
| `id`         | uuid      | PK                                                            |
| `shop_id`    | uuid      | FK → shops                                                    |
| `name`       | string    | Tên dịch vụ                                                   |
| `price`      | decimal   | Giá tiền                                                      |
| `is_haircut` | boolean   | Đánh dấu nếu là dịch vụ cắt tóc — dùng để trigger warning ảnh |
| `created_at` | timestamp |                                                               |

---

## Bảng `combos` — combo dịch vụ

| Trường        | Kiểu      | Ghi chú                                    |
| ------------- | --------- | ------------------------------------------ |
| `id`          | uuid      | PK                                         |
| `shop_id`     | uuid      | FK → shops                                 |
| `name`        | string    | Tên combo                                  |
| `description` | string    | Mô tả combo                                |
| `price`       | decimal   | Giá combo, độc lập với tổng giá dịch vụ lẻ |
| `created_at`  | timestamp |                                            |

---

## Bảng `combo_services` — dịch vụ lẻ trong combo

| Trường       | Kiểu | Ghi chú       |
| ------------ | ---- | ------------- |
| `id`         | uuid | PK            |
| `combo_id`   | uuid | FK → combos   |
| `service_id` | uuid | FK → services |

> Không hỗ trợ lồng combo. Khi tạo combo mới, hệ thống gợi ý copy toàn bộ dịch vụ từ combo có sẵn.

---

## Bảng `customers` — người đi cắt tóc

| Trường       | Kiểu      | Ghi chú                                                                    |
| ------------ | --------- | -------------------------------------------------------------------------- |
| `id`         | uuid      | PK                                                                         |
| `shop_id`    | uuid      | FK → shops                                                                 |
| `name`       | string    | Tên khách                                                                  |
| `phone`      | string    | Số điện thoại, unique trong phạm vi shop, có thể cập nhật khi khách đổi số |
| `created_at` | timestamp |                                                                            |

> Lịch sử visit không bị ảnh hưởng khi cập nhật SĐT vì visit liên kết qua `customer_id`, không phải SĐT.

---

## Bảng `visits` — mỗi lần khách vào cắt tóc

| Trường            | Kiểu      | Ghi chú                                                  |
| ----------------- | --------- | -------------------------------------------------------- |
| `id`              | uuid      | PK                                                       |
| `customer_id`     | uuid      | FK → customers                                           |
| `branch_id`       | uuid      | FK → branches, chi nhánh tại thời điểm visit             |
| `barber_id`       | uuid      | FK → users, nullable, có thể chọn sau hoặc chỉnh sửa     |
| `skinner_id`      | uuid      | FK → users, nullable                                     |
| `status`          | enum      | `pending`, `in_progress`, `completed`                    |
| `total_price`     | decimal   | Tổng tiền                                                |
| `created_by`      | uuid      | FK → users, người tạo visit                              |
| `completed_at`    | timestamp | Thời điểm hoàn thành, dùng tính cửa sổ chỉnh sửa 3 tiếng |
| `last_updated_by` | uuid      | FK → users, người thay đổi thông tin visit lần cuối      |
| `created_at`      | timestamp |                                                          |

> Cho phép chỉnh sửa barber/skinner trong vòng 3 tiếng kể từ `completed_at`, không gia hạn dù chỉnh bao nhiêu lần. Sau 3 tiếng, toàn bộ dữ liệu visit là bất biến — không được phép thay đổi giá tiền hay dịch vụ đã dùng để bảo vệ tính toàn vẹn của doanh thu và báo cáo.

---

## Bảng `visit_services` — dịch vụ sử dụng trong visit

| Trường       | Kiểu    | Ghi chú                   |
| ------------ | ------- | ------------------------- |
| `id`         | uuid    | PK                        |
| `visit_id`   | uuid    | FK → visits               |
| `service_id` | uuid    | FK → services, nullable   |
| `combo_id`   | uuid    | FK → combos, nullable     |
| `price`      | decimal | Giá tại thời điểm sử dụng |

> Một visit có thể có hỗn hợp dịch vụ lẻ và combo.

---

## Bảng `visit_photos` — ảnh kiểu tóc

| Trường        | Kiểu      | Ghi chú                    |
| ------------- | --------- | -------------------------- |
| `id`          | uuid      | PK                         |
| `visit_id`    | uuid      | FK → visits                |
| `photo_url`   | string    | URL ảnh trên Cloudflare R2 |
| `uploaded_by` | uuid      | FK → users                 |
| `created_at`  | timestamp |                            |

> Warning hiển thị nếu visit có dịch vụ cắt tóc (`is_haircut = true`) nhưng chưa có ảnh. Warning hiển thị cho người tạo visit, barber, skinner và owner — ở cả danh sách lẫn chi tiết visit.
