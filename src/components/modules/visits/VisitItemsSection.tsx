import { VisitSectionShell } from "./VisitSectionShell";
import { visitTexts } from "@/constants/texts";
import type { CustomerVisitService } from "@/types";
import { VisitServiceList } from "./VisitServiceList";

export function VisitItemsSection({
  services,
}: {
  services: CustomerVisitService[];
}) {
  return (
    <VisitSectionShell title={visitTexts.detail.servicesTitle}>
      <VisitServiceList
        emptyText={visitTexts.detail.noServices}
        services={services}
      />
    </VisitSectionShell>
  );
}
