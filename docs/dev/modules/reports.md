# Reports Module

## Scope

Revenue reports, personal staff reports, branch/service/combo reports, report pages, report APIs, report navigation, and allocated revenue grouping.

## Main Files

- `src/app/reports/page.tsx`
- `src/app/reports/revenue/page.tsx`
- `src/app/reports/staff/page.tsx`
- `src/app/reports/services/page.tsx`
- `src/app/reports/combos/page.tsx`
- `src/app/reports/branches/page.tsx`
- `src/app/api/reports/`
- `src/components/modules/reports/`
- `src/types/reports.ts`
- `src/constants/texts/reports.ts`
- `src/constants/common/reportKinds.ts`

## Business Rules

- Reports use snapshot fields and `allocatedPrice`.
- Reports must not use current service/combo/branch names or prices for historical revenue.
- Haircut warning reports use `visit_services.is_haircut_snapshot`, not the current service flag.
- Branch grouping should use the visit branch snapshot for historical display and the visit `branch_id` for stable drill-down.
- Combo allocated line totals must equal combo price.
- Staff revenue attribution follows each service `responsibleRole`.
- Staff allocation roles are `barber` and `skinner`.
- Missing matching staff assignment is reported under `Chưa xác định`.
- Keep raw line details available when grouping by staff, service, combo, or branch.
- Staff report summary must not inline all raw visit/service detail rows. Load staff detail rows through the paginated detail API and cache client queries by staff id plus active filters.
- Branch report summary must count `1 service = 1 lượt` and `1 combo = 1 lượt` even though combo revenue is allocated across multiple `visit_services` rows.

## Report Kinds

- Revenue report.
- Staff report.
- Services report.
- Combos report.
- Branch report for owner-only branch scope.
- Personal report for staff roles.

## Personal Reports

- Staff personal report uses current user scope.
- Barber/skinner attribution follows matching visit assignment.
- Receptionist attribution follows visits created by the user.
- Staff roles see personal reports in mobile/tablet workflow and desktop fallback at `1024px+`.

## Staff Management Report

- Owner and manager can view staff report.
- Owner can view all shop branches and filter by branch.
- Manager is always scoped to the active managed branch and cannot override scope with query params.
- Manager users are not included in staff report rows.
- Staff report rows include receptionist, barber, and skinner, including inactive and branch-suspended staff. This is intentional for historical reporting; the operational staff list may hide inactive users.
- Receptionist rows track visits/customers created by the receptionist.
- Barber/skinner rows count service/combo lines by `visit_services.responsible_role_snapshot`.
- Staff report summary and detail do not display or return allocated revenue; this report focuses on service/combo responsibility counts.
- Staff report status uses `StaffReportStatus`: `active` displays `Đang làm việc`, `branch_suspended` displays `Chi nhánh đóng cửa`, `inactive` displays `Đã nghỉ việc`, and unknown allocation displays `Thiếu phân công`.
- A visit with both barber and skinner can contribute detail rows to both staff members according to each service line's responsible role.
- Missing matching barber/skinner assignment is grouped under `Chưa xác định`.
- Summary endpoint: `GET /api/reports/staff`.
- Summary endpoint accepts `fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD`.
- Detail endpoint: `GET /api/reports/staff/details?staffId=<id|unknown>&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&page=1&pageSize=10`.
- Detail endpoint returns paginated raw rows for one staff id so the summary response stays small as visits grow.
- Detail pagination runs in Prisma with database `count`, `skip`, and `take`: receptionist details query visits; barber/skinner/unknown details query visit service rows.
- Staff report filters should use role select plus staff search input. Do not add a staff dropdown; staff lists can grow large and search is the intended control.
- Role and staff search are API filters. UI keeps draft filter values and only updates the query after `Áp dụng`, preventing duplicate requests while selecting a date range.
- Detail API errors show an inline retry action.
- On desktop, manager filter controls (`Chọn thời gian`, role, staff search, `Áp dụng`) stay on one row. Owner uses the same row with branch as an additional control.
- Unknown allocation status `Thiếu phân công` uses the error/danger badge variant.

## Branch Report

- Branch report is owner-only. Managers do not view branch comparison reports.
- Summary endpoint: `GET /api/reports/branches`.
- Detail endpoint: `GET /api/reports/branches/details?branchId=<id>&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&page=1&pageSize=10`.
- Branch rows include every branch that had at least one active day overlapping the selected date range, even when the branch is currently inactive.
- Branch status filter values are `all`, `active`, and `inactive`; there is no branch dropdown on the branch report.
- Branch report counts only `completed` visits in the selected range.
- `Số lượt ghé` is the number of completed visits.
- `Số khách` is the number of unique customers in the range.
- `Số dịch vụ/combo` counts service rows as one item and counts each combo once per visit by unique `visitId + comboId`.
- Revenue uses the sum of `visit_services.allocated_price`.
- Branch grouping uses `visit.branch_id` for stable drill-down and visit branch snapshots for historical display when visit data exists.
- Detail rows are paginated by visit with Prisma `count`, `skip`, and `take`.
- Detail rows show completed date, customer, receptionist, barber, skinner, service/combo count, and revenue. They do not link to visit detail yet.
- Client detail cache keys include branch id, `fromDate`, `toDate`, status, page, and page size.

## Management Report Date Range

- Every owner/manager report uses the shared `Từ ngày` and `Đến ngày` filter instead of month/year/all-time checkboxes.
- Default range is the first day of the current month through today.
- Both dates are required and use query params `fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD`.
- UI prevents `toDate < fromDate` and does not allow future end dates.
- API validates both dates and returns `400` when either date is missing, invalid, or `fromDate > toDate`.
- Report queries use an inclusive start and exclusive next-day end: `completedAt >= startOfFromDate` and `completedAt < startOfDayAfterToDate`.
- Date boundaries use Vietnam time (`UTC+07:00`) until shop-specific timezone configuration is introduced.
- Detail query cache keys include the drill-down id such as staff id or branch id, active filters, `fromDate`, `toDate`, page, and page size.
- Use global `DateRangePicker` through `ReportDateRangeFilter` for all management report screens so date labels, constraints, and layout stay consistent. Native date inputs are not allowed.
- Management reports label the field `Chọn thời gian`; the trigger shows only the selected date range, does not repeat `Từ ngày`/`Đến ngày`, and expands dynamically to the available filter-grid column width.

## Implementation Notes

- Keep route and API constants centralized.
- Use role constants from `src/constants/common/roles.ts`.
- Use report kind constants from `src/constants/common/reportKinds.ts`.
- Use global loading, empty, and error states.
- Use `ReportMetaBar` for report context metadata such as `Kỳ báo cáo`, `Thông tin chi nhánh`, role, and modal detail context. Metadata uses base-size text, and items must stay on one row per item with title and value adjacent (`title value`), then flow into responsive columns. The report-level context section sits above the filter section; do not place period/branch context inside the filter card. Do not use wide left/right key-value rows for report context.
- Staff names in the report table use semibold emphasis.
- `src/utils/reports/reportDateRanges.test.ts` covers UTC+7 boundaries, one-day ranges, invalid dates, reversed ranges, and display labels.
- `npm run smoke:reports` covers staff report owner/manager scope, inactive staff visibility, unknown assignment, API role/search filters, invalid date ranges, branch report owner-only scope, inactive branch visibility, branch status filtering, combo item counting, allocated revenue, and detail pagination.
- For allocation changes, manually reason through rounding and total preservation.
