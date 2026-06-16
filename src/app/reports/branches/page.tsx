import { ManagementReportPlaceholderPage } from "@/components/modules/reports";
import { MANAGEMENT_REPORT_BRANCHES } from "@/constants/common";

export default function BranchesReportPage() {
  return (
    <ManagementReportPlaceholderPage reportKind={MANAGEMENT_REPORT_BRANCHES} />
  );
}
