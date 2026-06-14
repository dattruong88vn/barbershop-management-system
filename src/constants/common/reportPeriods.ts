export const REPORT_PERIOD_CURRENT_MONTH = "current_month" as const;
export const REPORT_PERIOD_MONTH = "month" as const;
export const REPORT_PERIOD_YEAR = "year" as const;
export const REPORT_PERIOD_ALL = "all" as const;

export const REPORT_PERIODS = [
  REPORT_PERIOD_CURRENT_MONTH,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  REPORT_PERIOD_ALL,
] as const;

export type ReportPeriodValue = (typeof REPORT_PERIODS)[number];
