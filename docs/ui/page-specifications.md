# Page Specifications

## Login

Route

/login

API

POST /api/auth/[...nextauth]

States

Loading

- Disable submit button

Error

- Invalid username/password

Success

- Redirect

---

## Change Password

Route

/change-password

API

POST /api/change-password

States

Loading

- Disable submit button

Validation

- Password mismatch

Success

- Redirect

---

## Customer Search

Route

/customers

API

GET /api/customers?search=

States

Loading

- Skeleton cards

Empty

- No customers found

Error

- Failed to load customers

Actions

- Open customer
- Create customer

---

## Customer Create

API

POST /api/customers

Validation

- Name required
- Phone required
- Phone unique

Success

- Navigate to Customer Detail

---

## Customer Detail

Route

/customers/:id

API

GET /api/customers/:id/visits

Sections

- Customer Info
- Hair Photos
- Suggestions
- Visit History

States

Loading
Empty
Error

---

## Create Visit

Route

TBD

Route Note

- Must align with `ROUTES` constants before implementation.

API

GET /api/visits

POST /api/visits

Data Required

- Services
- Combos
- Barbers
- Skinners

Validation

- At least one service or combo

Success

- Navigate to Visit Detail

---

## Visit Detail

Route

/visits/:id

API

GET /api/visits/:id

PATCH /api/visits/:id

Backend Status

- `GET /api/visits/:id` is required for standalone Visit Detail loading.
- Current backend has `GET /api/visits`, `POST /api/visits`, and `PATCH /api/visits/:id`.
- If `GET /api/visits/:id` is not implemented, backend must be added before this screen is implemented as a standalone route.
- Photo upload API is not available yet.
- Upload Photo action must wait for backend/R2 upload support before implementation.

Sections

- Visit Info
- Status
- Services
- Combos
- Barber
- Skinner
- Photos

Rules

- Edit barber/skinner only within 3 hours

Warning

Display warning when:

Haircut Service
AND
No Photo

---

## Services List

Route

/owner/services

API

GET /api/services

States

Loading
Empty
Error

Actions

Create
Edit
Delete

---

## Service Form

API

POST /api/services

PATCH /api/services/:id

Fields

- Name
- Price
- Is Haircut

Validation

- Required name
- Required price

---

## Combos List

Route

/owner/combos

API

GET /api/combos

Actions

Create
Edit
Delete

---

## Combo Form

API

POST /api/combos

PATCH /api/combos/:id

Fields

- Name
- Description
- Price
- Services

Validation

- At least one service

---

## Staff List

Route

/owner/staff

API

GET /api/staff

Actions

Create
Edit
Delete

---

## Staff Form

API

POST /api/staff

PATCH /api/staff/:id

Fields

- Username
- Password
- Role
- Branch

Validation

- Password >= 8 chars

---

## Branch List

Route

/owner/branches

API

GET /api/branches

Actions

Create
Edit
Delete

---

## Branch Form

API

POST /api/branches

PATCH /api/branches/:id

Fields

- Name
- Address

Validation

- Required name

---

## Reports

Route

/reports

Backend Status

Not Implemented Yet

- Report API is not available yet.

Current UI

Placeholder

Future Widgets

- Revenue
- Revenue by Branch
- Top Barbers
- Top Skinners
- Top Services
- Top Combos

---

## Dashboard

Route

/dashboard

Backend Status

Depends on report APIs

- Dashboard API is not available yet.
- Use placeholder or mock data only until backend support exists.

Current UI

Mock Data Allowed

Widgets

- Revenue
- Visits
- New Customers
- Returning Customers

Charts

- Revenue Trend
- Top Employees
- Top Services

---

## Superadmin Landing

Route

/superadmin

Actions

- Quản trị hệ thống
- Xem theo tiệm

Future Scope

Pending Backend Implementation

---

## Trial Warning

Backend Status

- Trial warning requires session/API data for `trialExpiresAt` and shop `status`.
- This data is not confirmed available in the current UI/session contract.
- Implement only after backend/session support is available.

Condition

- Show warning when trial has 7 days or fewer remaining.

Display

- Center modal after successful login.
