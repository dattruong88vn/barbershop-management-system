# Visit Pricing Rules

## Snapshot Pricing

- Visit service/combo pricing must be snapshotted into `visit_services` at visit create/update time.
- Reports must use snapshot fields and `allocatedPrice`.
- Reports must never use current service/combo names or prices for historical revenue.

## Combo Allocation

- Combo revenue allocation uses `combo.price / sum(service.price)` across combo services.
- Round VND per line.
- Assign the final rounding difference to the last line so allocated totals always match the combo price.

## Unknown Assignment

- If allocated revenue has no matching barber/skinner on the visit, keep the line item details.
- Report unassigned allocated revenue under `Chưa xác định` until reassignment exists.

## Assignment Window

- Barber/skinner assignment is editable only within 3 hours after `completed_at`.
