import { ManagementReportPlaceholderPage } from "@/components/modules/reports";
import { MANAGEMENT_REPORT_STAFF } from "@/constants/common";

export default function StaffReportPage() {
  return (
    <ManagementReportPlaceholderPage reportKind={MANAGEMENT_REPORT_STAFF} />
  );
}
