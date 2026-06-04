# Component Rules

## Buttons

Variants

- Primary
- Secondary
- Destructive

Rules

- One primary action per section
- Avoid more than 2 primary buttons

---

## Forms

Use

- React Hook Form
- Zod

Rules

- Labels above fields
- Inline validation
- Required fields marked

---

## Tables

Desktop Only

Features

- Search
- Sort
- Pagination

---

## Customer Card

Fields

- Avatar
- Name
- Phone
- Last Visit
- Last Barber

Actions

- View Detail
- Create Visit

---

## Visit Card

Fields

- Customer
- Services
- Status
- Created Time

Actions

- Open Detail

---

## Haircut Warning

Condition

Visit contains haircut service

AND

No photo uploaded

Display

⚠ Chưa upload ảnh kiểu tóc

Locations

- Visit List
- Visit Detail
- Dashboard

---

## Service Card

Fields

- Name
- Price
- Haircut Badge

Haircut Badge

Display when

isHaircut = true

---

## Combo Card

Fields

- Name
- Description
- Price
- Included Services

---

## Empty States

Every screen must have:

- Empty State
- Loading State
- Error State

---

## Dialog Rules

Allowed

- Create
- Edit
- Confirm Delete

Forbidden

- Nested Dialog
- Dialog inside Dialog

---

## Mobile Rules

Touch Target

Minimum 44px

Primary CTA

Sticky Bottom

Search

Always Visible

---

## Responsive Rules

Mobile

0-767px

Tablet

768-1023px

Desktop

1024px+

Mobile First Required
