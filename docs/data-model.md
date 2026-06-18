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

| Trường             | Kiểu      | Ghi chú                                                        |
| ------------------ | --------- | -------------------------------------------------------------- |
| `id`               | uuid      | PK                                                             |
| `shop_id`          | uuid      | FK → shops                                                     |
| `name`             | string    | Tên chi nhánh; không bắt buộc unique trong shop                |
| `address`          | string    | Địa chỉ chi nhánh                                              |
| `manager_id`       | uuid      | FK → users, nullable; một manager có thể quản lý nhiều chi nhánh |
| `status`           | enum      | `active`, `inactive`                                           |
| `deactivated_at`   | timestamp | Nullable, thời điểm owner ngừng hoạt động chi nhánh            |
| `deactivated_by`   | uuid      | FK → users, nullable, owner thực hiện ngừng hoạt động          |
| `created_at`       | timestamp |                                                                |

> Mỗi chi nhánh có tối đa một manager; manager có thể quản lý nhiều chi nhánh. `users.branch_id` tiếp tục là chi nhánh làm việc chính của staff thường, không dùng để biểu diễn danh sách branch manager quản lý. Không hard delete chi nhánh.
> Chi nhánh inactive bị khoá chỉnh sửa dữ liệu vận hành. Owner có thể xem detail và kích hoạt lại; staff/manager bị ảnh hưởng được đưa về trạng thái `branch_suspended` và phải được owner phân công/chuyển lại khi cần.
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
| `status`         | enum      | `active`, `inactive`, `branch_suspended`                                  |
| `is_first_login` | boolean   | Bắt buộc đổi mật khẩu nếu true                                            |
| `created_at`     | timestamp |                                                                           |

> Nhân viên nghỉ làm được set `status = inactive`, không hiển thị khi chọn barber/skinner cho visit mới. Lịch sử visit vẫn giữ nguyên.
> `branch_suspended` dùng khi chi nhánh bị ngừng hoạt động. User vẫn còn record và lịch sử, nhưng không được thao tác API vận hành cho đến khi owner chuyển/khôi phục phân công phù hợp.
> Trạng thái hiển thị trên màn quản lý nhân viên: `Khởi tạo` = `status = active` và `is_first_login = true`; `Đang làm` = `status = active` và `is_first_login = false`; `inactive` là đã nghỉ; `branch_suspended` là tạm treo do chi nhánh ngừng hoạt động.

---

## Bảng `services` — dịch vụ lẻ

| Trường       | Kiểu      | Ghi chú                                                       |
| ------------ | --------- | ------------------------------------------------------------- |
| `id`         | uuid      | PK                                                            |
| `shop_id`    | uuid      | FK → shops                                                    |
| `branch_id`  | uuid      | FK → branches, nullable; null = áp dụng toàn shop             |
| `name`       | string    | Tên dịch vụ                                                   |
| `price`      | decimal   | Giá tiền                                                      |
| `responsible_role` | enum | `barber`, `skinner` — nhóm nhân sự phụ trách doanh thu dịch vụ |
| `is_haircut` | boolean   | Đánh dấu nếu là dịch vụ cắt tóc — dùng để trigger warning ảnh |
| `created_by` | uuid      | FK → users, người tạo dịch vụ                                 |
| `deleted_at` | timestamp | Soft delete; null = còn sử dụng, có giá trị = đã xoá khỏi catalog |
| `created_at` | timestamp |                                                               |

> Dịch vụ owner tạo có `branch_id = null` và áp dụng toàn shop. Dịch vụ manager tạo có `branch_id` là chi nhánh của manager và chỉ áp dụng trong chi nhánh đó. Owner chỉ edit dịch vụ owner tạo, nhưng có quyền xoá dịch vụ manager tạo trong cùng shop; manager chỉ edit/xoá dịch vụ do chính mình tạo trong chi nhánh của mình. Xoá dịch vụ là soft delete bằng `deleted_at`, không hard delete, để giữ lịch sử visit/combo/report. Owner/manager xem lại dịch vụ đã xoá qua tab `Đã xoá`.

---

## Bảng `combos` — combo dịch vụ

| Trường        | Kiểu      | Ghi chú                                    |
| ------------- | --------- | ------------------------------------------ |
| `id`          | uuid      | PK                                         |
| `shop_id`     | uuid      | FK → shops                                 |
| `branch_id`   | uuid      | FK → branches, nullable; null = áp dụng toàn shop |
| `name`        | string    | Tên combo                                  |
| `description` | string    | Mô tả combo                                |
| `price`       | decimal   | Giá combo, độc lập với tổng giá dịch vụ lẻ |
| `created_by`  | uuid      | FK → users, người tạo combo                |
| `deleted_at`  | timestamp | Soft delete; null = còn sử dụng, có giá trị = đã xoá khỏi catalog |
| `created_at`  | timestamp |                                            |

> Combo owner tạo có `branch_id = null` và áp dụng toàn shop. Combo manager tạo có `branch_id` là chi nhánh của manager. Combo đã có visit sử dụng không sửa trực tiếp; muốn thay đổi thì nhân bản thành combo mới. Khi nhân bản, tên bản sao thêm suffix `- copy`, chỉ dịch vụ đang hoạt động và còn thuộc phạm vi hiện tại được chọn sẵn. Nếu một phần dịch vụ gốc không thể copy thì UI hiển thị cảnh báo tổng quát; nếu không còn dịch vụ nào hợp lệ thì UI cảnh báo user chọn dịch vụ mới. Xoá combo là soft delete bằng `deleted_at`; owner/manager xem lại và có thể nhân bản combo đã xoá qua tab `Đã xoá`. Không restore combo đã xoá; nhân bản là flow tạo bản mới an toàn hơn. Visit/report vẫn luôn dùng snapshot trong `visit_services`.

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
| `branch_name_snapshot` | string | Tên chi nhánh tại thời điểm tạo visit |
| `branch_address_snapshot` | string | Địa chỉ chi nhánh tại thời điểm tạo visit |
| `barber_id`       | uuid      | FK → users, nullable, có thể chọn sau hoặc chỉnh sửa     |
| `skinner_id`      | uuid      | FK → users, nullable                                     |
| `status`          | enum      | `pending`, `in_progress`, `completed`                    |
| `total_price`     | decimal   | Tổng tiền                                                |
| `created_by`      | uuid      | FK → users, người tạo visit                              |
| `completed_at`    | timestamp | Thời điểm hoàn thành, dùng tính cửa sổ chỉnh sửa 3 tiếng |
| `last_updated_by` | uuid      | FK → users, người thay đổi thông tin visit lần cuối      |
| `created_at`      | timestamp |                                                          |

> Cho phép chỉnh sửa barber/skinner trong vòng 3 tiếng kể từ `completed_at`, không gia hạn dù chỉnh bao nhiêu lần. Sau 3 tiếng, toàn bộ dữ liệu visit là bất biến — không được phép thay đổi giá tiền hay dịch vụ đã dùng để bảo vệ tính toàn vẹn của doanh thu và báo cáo.
> Customer thuộc shop và có thể ghé nhiều branch. Mỗi visit bắt buộc lưu branch relation và snapshot tên/địa chỉ để lịch sử, báo cáo không đổi khi thông tin branch được cập nhật.

---

## Bảng `visit_services` — dịch vụ sử dụng trong visit

| Trường       | Kiểu    | Ghi chú                   |
| ------------ | ------- | ------------------------- |
| `id`         | uuid    | PK                        |
| `visit_id`   | uuid    | FK → visits               |
| `service_id` | uuid    | FK → services, nullable   |
| `combo_id`   | uuid    | FK → combos, nullable     |
| `price`      | decimal | Giá tại thời điểm sử dụng |
| `service_name_snapshot` | string | Tên dịch vụ tại thời điểm tạo visit |
| `service_price_snapshot` | decimal | Giá dịch vụ lẻ tại thời điểm tạo visit |
| `combo_name_snapshot` | string | Tên combo tại thời điểm tạo visit |
| `combo_price_snapshot` | decimal | Giá combo tại thời điểm tạo visit |
| `responsible_role_snapshot` | enum | `barber`, `skinner` — snapshot nhóm phụ trách tại thời điểm tạo visit |
| `allocated_price` | decimal | Doanh thu phân bổ cho dòng service snapshot |

> Một visit chỉ được có dịch vụ lẻ hoặc combo, không lưu hỗn hợp cả hai nhóm. UI tạo visit phải tự bỏ chọn dịch vụ lẻ khi chọn combo và tự bỏ chọn combo khi chọn dịch vụ lẻ; API cũng phải reject payload có cả service và combo trong cùng visit.
> Khi visit dùng dịch vụ lẻ, `allocated_price = service_price_snapshot = price`.
> Khi visit dùng combo, hệ thống lưu một dòng `visit_services` cho mỗi dịch vụ con trong combo, kèm `combo_id` và snapshot combo. `allocated_price` được tính theo tỷ lệ `combo.price / sum(service.price)` tại thời điểm tạo/sửa visit; dòng cuối nhận chênh lệch làm tròn để tổng phân bổ luôn bằng giá combo.
> Báo cáo không tính lại bằng giá hoặc tên service/combo hiện tại, mà dùng snapshot và `allocated_price`.

---

## Bảng `visit_photos` — ảnh kiểu tóc

| Trường        | Kiểu      | Ghi chú                    |
| ------------- | --------- | -------------------------- |
| `id`          | uuid      | PK                         |
| `visit_id`    | uuid      | FK → visits                |
| `photo_url`   | string    | URL ảnh trên Cloudflare R2 |
| `uploaded_by` | uuid      | FK → users, bắt buộc là user role `barber` |
| `created_at`  | timestamp |                            |

> Warning hiển thị nếu visit có dịch vụ cắt tóc (`is_haircut = true`) nhưng chưa có ảnh. Warning hiển thị cho người tạo visit, barber, skinner và owner — ở cả danh sách lẫn chi tiết visit.
> Chỉ role `barber` được upload ảnh kiểu tóc. Receptionist, skinner, manager và owner chỉ được xem ảnh/cảnh báo ảnh.
