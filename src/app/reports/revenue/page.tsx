import { ManagementReportPlaceholderPage } from "@/components/modules/reports";
import { MANAGEMENT_REPORT_REVENUE } from "@/constants/common";

export default function RevenueReportPage() {
  return (
    <ManagementReportPlaceholderPage reportKind={MANAGEMENT_REPORT_REVENUE} />
  );
}
