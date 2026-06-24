import type { ReportPeriodValue } from "@/constants/common";

export type DashboardMetric = {
  label: string;
  value: string;
};

export type DashboardTrendPoint = {
  label: string;
  revenue: number;
  visits: number;
};

export type DashboardTopItem = {
  count: number;
  name: string;
  revenue: number;
};

export type DashboardHaircutWarning = {
  customerName: string;
  visitId: string;
};

export type DashboardData = {
  branchId: string | null;
  haircutWarnings: DashboardHaircutWarning[];
  metrics: DashboardMetric[];
  periodLabel: string;
  revenueTrend: DashboardTrendPoint[];
  topBarbers: DashboardTopItem[];
  topCombos: DashboardTopItem[];
  topServices: DashboardTopItem[];
  topSkinners: DashboardTopItem[];
};

export type DashboardApiResponse = {
  dashboard?: DashboardData;
  error?: string;
};

export type DashboardFilter = {
  branchId?: string;
  month?: string;
  period: ReportPeriodValue;
};
