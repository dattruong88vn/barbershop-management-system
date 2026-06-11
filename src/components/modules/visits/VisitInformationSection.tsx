import { VisitSectionShell } from "./VisitSectionShell";
import { visitTexts } from "@/constants/texts";
import { formatMoney } from "@/lib/customerVisitDisplay";
import type { CustomerVisit } from "@/types";
import {
  formatVisitDateTime,
  getVisitStatusLabel,
} from "@/utils/visits/visitFormatters";
import { VisitInfoRow } from "./VisitInfoRow";

export function VisitInformationSection({ visit }: { visit: CustomerVisit }) {
  return (
    <VisitSectionShell title={visitTexts.detail.visitInfoTitle}>
      <div className="divide-y divide-border">
        <VisitInfoRow
          label={visitTexts.detail.statusTitle}
          value={getVisitStatusLabel(visit.status)}
        />
        <VisitInfoRow
          label={visitTexts.detail.createdAtLabel}
          value={formatVisitDateTime(visit.createdAt)}
        />
        <VisitInfoRow
          label={visitTexts.detail.completedAtLabel}
          value={
            visit.completedAt
              ? formatVisitDateTime(visit.completedAt)
              : visitTexts.detail.noCompletedAt
          }
        />
        <VisitInfoRow
          label={visitTexts.detail.totalPriceLabel}
          value={formatMoney(visit.totalPrice)}
          valueClassName="text-base font-semibold"
        />
      </div>
    </VisitSectionShell>
  );
}
