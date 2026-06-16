export const MANAGEMENT_REPORT_BRANCHES = "branches" as const;
export const MANAGEMENT_REPORT_COMBOS = "combos" as const;
export const MANAGEMENT_REPORT_REVENUE = "revenue" as const;
export const MANAGEMENT_REPORT_SERVICES = "services" as const;
export const MANAGEMENT_REPORT_STAFF = "staff" as const;

export const MANAGEMENT_REPORT_KINDS = [
  MANAGEMENT_REPORT_BRANCHES,
  MANAGEMENT_REPORT_COMBOS,
  MANAGEMENT_REPORT_REVENUE,
  MANAGEMENT_REPORT_SERVICES,
  MANAGEMENT_REPORT_STAFF,
] as const;

export type ManagementReportKindValue =
  (typeof MANAGEMENT_REPORT_KINDS)[number];
