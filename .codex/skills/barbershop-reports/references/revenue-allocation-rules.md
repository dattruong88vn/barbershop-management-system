# Revenue Allocation Rules

## Source Of Truth

- Reports must use visit snapshot fields and `allocatedPrice`.
- Reports must not use current service/combo names or prices for historical revenue.

## Combo Revenue

- Combo revenue allocation uses `combo.price / sum(service.price)` across combo services.
- Round VND per line.
- Assign the final rounding difference to the last line.
- Allocated line totals must always equal combo price.

## Totals

- Prefer calculations that preserve integer VND totals.
- Keep raw line details available when grouping by staff, service, combo, or branch.
