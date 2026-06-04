# User Flows

## Login Flow

```text
Login
    ↓
Authenticate
    ↓
isFirstLogin?
    ├─ Yes → Change Password
    └─ No  → Dashboard / Customers
```

---

## Customer Search Flow

```text
Customer Search
    ↓
Search Name / Phone
    ↓
Customer Found?
    ├─ Yes → Customer Detail
    └─ No  → Create Customer
```

---

## Create Customer Flow

```text
Customer Search
    ↓
Create Customer
    ↓
Save Success
    ↓
Customer Detail
```

---

## Create Visit Flow

```text
Customer Detail
    ↓
Create Visit
    ↓
Select Services
    ↓
Select Combos
    ↓
Select Barber (Optional)
    ↓
Select Skinner (Optional)
    ↓
Review Total Price
    ↓
Create Visit
    ↓
Visit Detail
```

---

## Upload Hair Photo Flow

Backend Status:

- Photo upload API is not available yet.
- Implement this flow only after backend/R2 upload support exists.

```text
Visit Detail
    ↓
Upload Photo
    ↓
Take Photo / Select Photo
    ↓
Preview
    ↓
Upload
    ↓
Visit Detail Refresh
```

---

## Update Barber/Skinner Flow

```text
Visit Detail
    ↓
Completed?
    ├─ No → Hidden
    └─ Yes
          ↓
Within 3 Hours?
          ├─ No → Read Only
          └─ Yes
                ↓
                Edit
                ↓
                Save
```

---

## Service Management Flow

```text
Services List
    ↓
Create/Edit
    ↓
Save
    ↓
Refresh List
```

---

## Combo Management Flow

```text
Combos List
    ↓
Create/Edit
    ↓
Select Services
    ↓
Save
    ↓
Refresh List
```

---

## Staff Management Flow

```text
Staff List
    ↓
Create/Edit
    ↓
Assign Role
    ↓
Assign Branch
    ↓
Save
```

---

## Branch Management Flow

```text
Branches List
    ↓
Create/Edit
    ↓
Save
```

---

## Report Flow

Backend Status:

- Report API is not implemented yet.
- Keep Reports as placeholder/mock until backend support exists.

```text
Reports
    ↓
Select Date Range
    ↓
Select Branch
    ↓
Load Data
    ↓
Charts + Tables
```

---

## Trial Warning Flow

Backend Status:

- Requires session/API data for `trialExpiresAt` and shop `status`.
- This data is not confirmed available in the current UI/session contract.

```text
Login Success
    ↓
Trial <= 7 Days?
    ├─ No
    └─ Yes
          ↓
          Warning Modal
          ↓
          Continue
```

---

## Superadmin Flow

```text
Login
    ↓
Landing

├─ Quản trị hệ thống
└─ Xem theo tiệm

      ↓
      Chọn Tiệm
      ↓
      Owner Experience
```
