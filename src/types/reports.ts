import type {
  ManagementRoleValue,
  ReportPeriodValue,
  StaffRoleValue,
} from "@/constants/common";

export type PersonalReportMetric = {
  label: string;
  value: string;
};

export type PersonalReportTopItem = {
  count: string;
  name: string;
};

export type PersonalReportData = {
  comboCount: string;
  metrics: PersonalReportMetric[];
  periodLabel: string;
  roleLabel: string;
  serviceCount: string;
  staffName: string;
  topItems: PersonalReportTopItem[];
};

export type PersonalReportApiResponse = {
  error?: string;
  report?: PersonalReportData;
};

export type PersonalReportFilter = {
  month?: string;
  period: ReportPeriodValue;
};

export type ReportPageRole = StaffRoleValue | ManagementRoleValue;
