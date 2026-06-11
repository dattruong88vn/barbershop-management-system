import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { visitTexts } from "@/constants/texts";
import type {
  CustomerVisit,
  VisitStatusUpdateInput,
} from "@/types";
import { VisitStatusActionButton } from "./VisitStatusActionButton";

export function VisitDetailHeader({
  backHref,
  canEditDetail,
  isUpdatingStatus,
  onCompletedVisit,
  onOpenEditDetail,
  onUpdateStatus,
  visit,
}: {
  backHref: string;
  canEditDetail: boolean;
  isUpdatingStatus: boolean;
  onCompletedVisit?: () => void;
  onOpenEditDetail: () => void;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
  visit: CustomerVisit | null;
}) {
  return (
    <header className="mb-4 flex flex-col gap-4 md:mb-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {visitTexts.detail.backToCustomers}
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            {visitTexts.detail.title}
          </h1>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {canEditDetail ? (
            <Button
              type="button"
              variant="primary"
              className="w-full md:w-auto"
              onClick={onOpenEditDetail}
            >
              <PencilLine className="size-4" aria-hidden="true" />
              {visitTexts.detail.editVisit}
            </Button>
          ) : null}
          {visit ? (
            <VisitStatusActionButton
              isUpdatingStatus={isUpdatingStatus}
              visit={visit}
              onCompletedVisit={onCompletedVisit}
              onUpdateStatus={onUpdateStatus}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
