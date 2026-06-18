import Link from "next/link";
import { ArrowLeft, PencilLine, Plus } from "lucide-react";
import {
  UI_VARIANT_PRIMARY,
} from "@/constants/common";

import { Button } from "@/components/global/ui/button";
import { ROUTES } from "@/constants/routes";
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
  const createNewVisitHref =
    visit?.customer && visit.canCreateNewVisit
      ? ROUTES.createVisitFromVisit({
          ...visit,
          customer: visit.customer,
        })
      : null;

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
        <div className="flex min-w-0 items-center justify-between gap-3 md:block">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            {visitTexts.detail.title}
          </h1>
          {createNewVisitHref ? (
            <Button asChild variant={UI_VARIANT_PRIMARY} className="shrink-0 md:hidden">
              <Link href={createNewVisitHref}>
                <Plus className="size-4" aria-hidden="true" />
                {visitTexts.detail.createNewVisit}
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {createNewVisitHref ? (
            <Button
              asChild
              variant={UI_VARIANT_PRIMARY}
              className="hidden w-full md:inline-flex md:w-auto"
            >
              <Link href={createNewVisitHref}>
                <Plus className="size-4" aria-hidden="true" />
                {visitTexts.detail.createNewVisit}
              </Link>
            </Button>
          ) : null}
          {canEditDetail ? (
            <Button
              type="button"
              variant={UI_VARIANT_PRIMARY}
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
