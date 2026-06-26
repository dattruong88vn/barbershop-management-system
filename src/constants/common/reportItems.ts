export const REPORT_ITEM_TAB_SERVICE = "service" as const;
export const REPORT_ITEM_TAB_COMBO = "combo" as const;

export const REPORT_ITEM_TABS = [
  REPORT_ITEM_TAB_SERVICE,
  REPORT_ITEM_TAB_COMBO,
] as const;

export type ReportItemTabValue = (typeof REPORT_ITEM_TABS)[number];

export const REPORT_USAGE_SORT_DESC = "usage_desc" as const;
export const REPORT_USAGE_SORT_ASC = "usage_asc" as const;

export const REPORT_USAGE_SORTS = [
  REPORT_USAGE_SORT_DESC,
  REPORT_USAGE_SORT_ASC,
] as const;

export type ReportUsageSortValue = (typeof REPORT_USAGE_SORTS)[number];

export const REVENUE_REPORT_TAB_BRANCH = "branch" as const;
export const REVENUE_REPORT_TAB_ITEM = "item" as const;

export const REVENUE_REPORT_TABS = [
  REVENUE_REPORT_TAB_BRANCH,
  REVENUE_REPORT_TAB_ITEM,
] as const;

export type RevenueReportTabValue = (typeof REVENUE_REPORT_TABS)[number];

export const REVENUE_REPORT_ITEM_TYPE_SERVICE = "service" as const;
export const REVENUE_REPORT_ITEM_TYPE_COMBO = "combo" as const;

export const REVENUE_REPORT_ITEM_TYPES = [
  REVENUE_REPORT_ITEM_TYPE_SERVICE,
  REVENUE_REPORT_ITEM_TYPE_COMBO,
] as const;

export type RevenueReportItemTypeValue =
  (typeof REVENUE_REPORT_ITEM_TYPES)[number];
