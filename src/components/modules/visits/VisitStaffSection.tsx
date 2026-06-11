import { Scissors, User } from "lucide-react";

import { VisitSectionShell } from "./VisitSectionShell";
import { visitTexts } from "@/constants/texts";
import type { CustomerVisit } from "@/types";

export function VisitStaffSection({ visit }: { visit: CustomerVisit }) {
  return (
    <VisitSectionShell title={visitTexts.detail.staffTitle}>
      <div className="space-y-3 text-sm text-foreground">
        <div className="flex items-center gap-3">
          <User className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">
            {visitTexts.detail.barberTitle}
          </span>
          <span className="font-medium">
            {visit.noHaircut
              ? visitTexts.create.noHaircutOption
              : visit.barber?.username ?? visitTexts.detail.noStaff}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Scissors className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">
            {visitTexts.detail.skinnerTitle}
          </span>
          <span className="font-medium">
            {visit.noSkinnerService
              ? visitTexts.create.noSkinnerServiceOption
              : visit.skinner?.username ?? visitTexts.detail.noStaff}
          </span>
        </div>
      </div>
    </VisitSectionShell>
  );
}
