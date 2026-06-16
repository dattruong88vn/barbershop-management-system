import { ManagementReportPlaceholderPage } from "@/components/modules/reports";
import { MANAGEMENT_REPORT_SERVICES } from "@/constants/common";

export default function ServicesReportPage() {
  return (
    <ManagementReportPlaceholderPage reportKind={MANAGEMENT_REPORT_SERVICES} />
  );
}
