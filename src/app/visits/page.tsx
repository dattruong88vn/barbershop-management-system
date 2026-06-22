"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Plus,
} from "lucide-react";

import { AppMobileBottomNav } from "@/components/mobile/AppMobileBottomNav";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import {
  VisitListCard,
  VisitListSkeleton,
} from "@/components/modules/visits";
import {
  UI_VARIANT_PRIMARY,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
  VISIT_STATUS_COMPLETED,
} from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { useVisits } from "@/hooks/useVisits";
import type { CustomerVisitStatus } from "@/types";
import { getVisitListStatusLabel } from "@/utils/visits";

const VISIT_LIST_STATUS_FILTERS: CustomerVisitStatus[] = [
  VISIT_STATUS_PENDING,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_COMPLETED,
];

export default function VisitsPage() {
  const pageTitle = visitTexts.list.title;
  const [status, setStatus] = useState<CustomerVisitStatus>(
    VISIT_STATUS_PENDING,
  );
  const { isLoadingVisits, visits, visitsError } = useVisits(status, {
    scope: "today",
  });

  return (
    <main aria-label={pageTitle}>
      <div className="min-h-screen bg-muted/30 px-4 py-4 pb-20 text-foreground md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="mb-4 flex items-start justify-between gap-4 md:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                {visitTexts.list.title}
              </h1>
            </div>
            <Button
              asChild
              variant={UI_VARIANT_PRIMARY}
              size="lg"
              className="h-9 shrink-0 rounded-lg px-3 text-sm md:px-4"
            >
              <Link href={ROUTES.createVisitFromVisits()}>
                <Plus className="size-4" aria-hidden="true" />
                {visitTexts.list.createVisit}
              </Link>
            </Button>
          </header>

          <div className="mb-4 flex gap-2 overflow-x-auto">
            {VISIT_LIST_STATUS_FILTERS.map((filter) => (
              <Button
                key={filter}
                type="button"
                variant={filter === status ? "primary" : "outline"}
                className="h-9 rounded-lg"
                onClick={() => setStatus(filter)}
              >
                {getVisitListStatusLabel(filter)}
              </Button>
            ))}
          </div>

          {visitsError ? (
            <InlineAlert className="mb-4">
              {visitsError instanceof Error
                ? visitsError.message
                : visitTexts.detail.errors.generic}
            </InlineAlert>
          ) : null}

          {isLoadingVisits ? <VisitListSkeleton /> : null}

          {!isLoadingVisits && !visitsError && visits.length ? (
            <div className="space-y-3">
              {visits.map((visit) => (
                <VisitListCard key={visit.id} visit={visit} />
              ))}
            </div>
          ) : null}

          {!isLoadingVisits && !visitsError && !visits.length ? (
            <EmptyState icon={CalendarClock} text={visitTexts.list.empty} />
          ) : null}
        </div>

        <AppMobileBottomNav activeItem="today" />
      </div>
    </main>
  );
}
