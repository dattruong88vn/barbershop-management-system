# Screen Map

## Auth

### Login

Route: `/login`

Features:

- Username
- Password
- Submit

### Change Password

Route: `/change-password`

Features:

- New Password
- Confirm Password
- Validation
- Redirect After Success

---

## Staff Area

### Customer Search

Route: `/customers`

Features:

- Search by name
- Search by phone
- Customer list
- Create customer
- Open customer detail
- Quick create visit

### Customer Create

Features:

- Name
- Phone

Validation:

- Required name
- Required phone
- Unique phone per shop

### Customer Detail

Route: `/customers/:id`

Sections:

- Customer Information
- Hair Photos
- Visit History
- Suggestions

Actions:

- Create Visit

### Create Visit

Route: TBD

Note:

- Must align with `ROUTES` constants before implementation.

Sections:

- Customer
- Services
- Combos
- Barber
- Skinner
- Total Price

Actions:

- Save Visit

### Visit Detail

Route: `/visits/:id`

API:

- Requires `GET /api/visits/:id` for standalone visit detail loading.
- Current backend has `GET /api/visits`, `POST /api/visits`, and `PATCH /api/visits/:id`.
- If `GET /api/visits/:id` is not implemented, backend must be added before implementing this screen as a standalone route.

Sections:

- Visit Information
- Services
- Combos
- Barber
- Skinner
- Photos

Actions:

- Upload Photo
- Edit Barber
- Edit Skinner

Warning:

- Haircut service without photo

---

## Owner Area

### Dashboard

Route: `/dashboard`

Backend Status:

- Depends on report/dashboard APIs.
- Current UI may use placeholder or mock data until backend APIs are implemented.

Widgets:

- Revenue
- Total Visits
- New Customers
- Returning Customers

Charts:

- Revenue Trend
- Top Barbers
- Top Skinners
- Top Services
- Top Combos

### Services

- List
- Create
- Edit
- Delete

### Combos

- List
- Create
- Edit
- Delete

### Staff

- List
- Create
- Edit
- Delete

### Branches

- List
- Create
- Edit
- Delete

### Reports

Route: `/reports`

Backend Status:

- Report API is not implemented yet.
- This screen should remain placeholder/mock until backend support exists.

Features:

- Revenue
- Branch Analytics
- Top Employees
- Top Services
- Top Combos

---

## Superadmin

### Landing

Actions:

- Quản trị hệ thống
- Xem theo tiệm
