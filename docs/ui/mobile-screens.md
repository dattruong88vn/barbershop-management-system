# Mobile Screens

## Customer Search

Mục đích:

Tìm khách nhanh nhất có thể.

Layout:

```text
Header

Search Input

Customer List

Bottom Navigation
```

Customer card:

```text
Tên khách

SĐT

Lần ghé gần nhất

Barber gần nhất

[Xem]
[Tạo Visit]
```

---

## Customer Detail

Layout:

```text
Customer Info

Hair Photos

Suggestions

Visit History
```

Hair Photos luôn nằm trên Visit History.

---

## Create Visit

Layout:

```text
Customer

Services

Combos

Barber

Skinner

Total Price

[Create Visit]
```

Quy tắc:

- Multi-select services.
- Multi-select combos.
- Tổng tiền update realtime.

---

## Visit Detail

Layout:

```text
Visit Info

Status

Services

Combos

Barber

Skinner

Photos

Actions
```

Actions:

- Upload Photo
- Edit Barber
- Edit Skinner

---

## Photos

Quyết định MVP:

- Không có Photos screen độc lập.
- Không có Photos item trong bottom navigation.
- Hair photos chỉ được hiển thị và upload từ Customer Detail và Visit Detail.

---

## Upload Photo

Backend status:

- Photo upload API chưa có.
- Phải có Cloudflare R2 upload support trước khi implement flow này.

Flow:

```text
Open Camera

Take Photo

Preview

Upload
```

Không bắt buộc crop ở MVP.

---

## Account

Layout:

```text
Profile

Role

Branch

Logout
```

---

## Trial Warning

Backend status:

- Cần session/API data cho `trialExpiresAt` và shop `status`.
- Data này chưa được xác nhận có trong UI/session contract hiện tại.
- Chỉ implement sau khi có backend/session support.

Điều kiện:

Trial còn <= 7 ngày.

Hiển thị:

```text
⚠ Gói dùng thử sắp hết hạn
```

Vị trí:

Center modal sau khi login thành công.
