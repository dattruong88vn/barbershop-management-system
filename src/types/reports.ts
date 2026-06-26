import type {
  BranchStatusFilterValue,
  BranchStatusValue,
  ManagementReportKindValue,
  ManagementRoleValue,
  ReportPeriodValue,
  ReportItemTabValue,
  ReportUsageSortValue,
  RevenueReportItemTypeValue,
  RevenueReportTabValue,
  ServiceResponsibleRoleValue,
  StaffReportStatus,
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
  topCustomers: PersonalReportTopItem[];
  topItems: PersonalReportTopItem[];
};

export type PersonalReportApiResponse = {
  error?: string;
  report?: PersonalReportData;
};

export type ManagementReportKind = ManagementReportKindValue;

export type PersonalReportFilter = {
  month?: string;
  period: ReportPeriodValue;
};

export type ReportPageRole = StaffRoleValue | ManagementRoleValue;

export type StaffReportDetail = {
  branchName: string;
  completedAt: string | null;
  customerName: string;
  itemName: string;
  responsibleRole: string;
  visitId: string;
};

export type StaffReportRow = {
  branchName: string | null;
  customerCount: number;
  detailCount: number;
  role: StaffRoleValue | "unknown";
  serviceCount: number;
  staffId: string;
  staffName: string;
  status: StaffReportStatus;
  visitCount: number;
};

export type StaffReportData = {
  branchId: string | null;
  branchName: string | null;
  periodLabel: string;
  rows: StaffReportRow[];
};

export type StaffReportApiResponse = {
  error?: string;
  report?: StaffReportData;
};

export type StaffReportFilter = {
  branchId?: string;
  fromDate: string;
  role?: string;
  search?: string;
  toDate: string;
};

export type ReportPaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type StaffReportDetailData = {
  details: StaffReportDetail[];
  pagination: ReportPaginationMeta;
  staffId: string;
};

export type StaffReportDetailApiResponse = {
  error?: string;
  report?: StaffReportDetailData;
};

export type StaffReportDetailFilter = StaffReportFilter & {
  page: number;
  pageSize: number;
  staffId: string;
};

export type BranchReportRow = {
  branchId: string;
  branchName: string;
  customerCount: number;
  detailCount: number;
  revenue: number;
  serviceCount: number;
  status: BranchStatusValue;
  visitCount: number;
};

export type BranchReportData = {
  periodLabel: string;
  rows: BranchReportRow[];
};

export type BranchReportApiResponse = {
  error?: string;
  report?: BranchReportData;
};

export type BranchReportFilter = {
  fromDate: string;
  status?: BranchStatusFilterValue;
  toDate: string;
};

export type BranchReportDetail = {
  barberName: string | null;
  completedAt: string | null;
  customerName: string;
  receptionistName: string;
  revenue: number;
  serviceCount: number;
  skinnerName: string | null;
  visitId: string;
};

export type BranchReportDetailData = {
  branchId: string;
  details: BranchReportDetail[];
  pagination: ReportPaginationMeta;
};

export type BranchReportDetailApiResponse = {
  error?: string;
  report?: BranchReportDetailData;
};

export type BranchReportDetailFilter = BranchReportFilter & {
  branchId: string;
  page: number;
  pageSize: number;
};

export type ServiceComboReportRow = {
  branchId: string | null;
  branchName: string;
  customerCount: number;
  detailCount: number;
  itemId: string;
  itemName: string;
  responsibleRole: ServiceResponsibleRoleValue | null;
  usageCount: number;
};

export type ServiceComboReportData = {
  branchId: string | null;
  branchName: string | null;
  periodLabel: string;
  rows: ServiceComboReportRow[];
  tab: ReportItemTabValue;
};

export type ServiceComboReportApiResponse = {
  error?: string;
  report?: ServiceComboReportData;
};

export type ServiceComboReportFilter = {
  branchId?: string;
  fromDate: string;
  responsibleRole?: ServiceResponsibleRoleValue;
  search?: string;
  sort?: ReportUsageSortValue;
  tab: ReportItemTabValue;
  toDate: string;
};

export type ServiceComboReportDetail = {
  branchName: string;
  completedAt: string | null;
  customerName: string;
  itemName: string;
  responsibleRole: ServiceResponsibleRoleValue | null;
  visitId: string;
};

export type ServiceComboReportDetailData = {
  details: ServiceComboReportDetail[];
  itemId: string;
  pagination: ReportPaginationMeta;
  tab: ReportItemTabValue;
};

export type ServiceComboReportDetailApiResponse = {
  error?: string;
  report?: ServiceComboReportDetailData;
};

export type ServiceComboReportDetailFilter = ServiceComboReportFilter & {
  itemId: string;
  page: number;
  pageSize: number;
};

export type RevenueReportBranchRow = {
  branchId: string;
  branchName: string;
  customerCount: number;
  detailCount: number;
  revenue: number;
  serviceCount: number;
  visitCount: number;
};

export type RevenueReportItemRow = {
  customerCount: number;
  detailCount: number;
  itemId: string;
  itemName: string;
  itemType: RevenueReportItemTypeValue;
  revenue: number;
  revenueShare: number;
  usageCount: number;
};

export type RevenueReportPieSegment = {
  id: string;
  label: string;
  revenue: number;
  revenueShare: number;
};

export type RevenueReportData = {
  branchName: string | null;
  branchRows: RevenueReportBranchRow[];
  comboPie: RevenueReportPieSegment[];
  itemRows: RevenueReportItemRow[];
  itemTypePie: RevenueReportPieSegment[];
  periodLabel: string;
  servicePie: RevenueReportPieSegment[];
  tab: RevenueReportTabValue;
  totals: {
    customerCount: number;
    revenue: number;
    serviceCount: number;
    visitCount: number;
  };
};

export type RevenueReportApiResponse = {
  error?: string;
  report?: RevenueReportData;
};

export type RevenueReportFilter = {
  fromDate: string;
  tab: RevenueReportTabValue;
  toDate: string;
};

export type RevenueReportDetail = {
  barberName: string | null;
  branchName: string;
  completedAt: string | null;
  customerName: string;
  itemName?: string;
  itemType?: RevenueReportItemTypeValue;
  receptionistName: string;
  revenue: number;
  serviceCount: number;
  skinnerName: string | null;
  visitId: string;
};

export type RevenueReportDetailData = {
  details: RevenueReportDetail[];
  drilldownId: string;
  itemType: RevenueReportItemTypeValue | null;
  pagination: ReportPaginationMeta;
  tab: RevenueReportTabValue;
};

export type RevenueReportDetailApiResponse = {
  error?: string;
  report?: RevenueReportDetailData;
};

export type RevenueReportDetailFilter = RevenueReportFilter & {
  drilldownId: string;
  itemType?: RevenueReportItemTypeValue;
  page: number;
  pageSize: number;
};
