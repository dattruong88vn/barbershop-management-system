import { ManagementReportPlaceholderPage } from "@/components/modules/reports";
import { MANAGEMENT_REPORT_COMBOS } from "@/constants/common";

export default function CombosReportPage() {
  return (
    <ManagementReportPlaceholderPage reportKind={MANAGEMENT_REPORT_COMBOS} />
  );
}
