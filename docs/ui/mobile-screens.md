# Mobile Screens

## Customer Search

Purpose:

Tìm khách nhanh nhất có thể.

Layout:

```text
Header

Search Input

Customer List

Bottom Navigation
```

Customer Card:

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

Rules:

- Multi-select services
- Multi-select combos
- Tổng tiền update realtime

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

MVP Decision:

- No standalone Photos screen.
- No Photos item in bottom navigation.
- Hair photos are shown and uploaded from Customer Detail and Visit Detail only.

---

## Upload Photo

Backend Status:

- Photo upload API is not available yet.
- Cloudflare R2 upload support must exist before implementing this flow.

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

Backend Status:

- Requires session/API data for `trialExpiresAt` and shop `status`.
- This data is not confirmed available in the current UI/session contract.
- Implement only after backend/session support is available.

Điều kiện:

Trial còn <= 7 ngày.

Hiển thị:

```text
⚠ Gói dùng thử sắp hết hạn
```

Vị trí:

Center Modal

Khi Login thành công.
