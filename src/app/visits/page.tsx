"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CalendarClock, Plus } from "lucide-react";

import { AppMobileBottomNav } from "@/components/mobile/AppMobileBottomNav";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Skeleton } from "@/components/global/Skeleton";
import { Button } from "@/components/global/ui/button";
import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
  VISIT_STATUSES,
} from "@/constants/visitStatuses";
import { useVisits } from "@/hooks/useVisits";
import {
  formatCustomerVisitServices,
  formatMoney,
  formatVisitTime,
  hasVisitPhotoWarning,
} from "@/lib/customerVisitDisplay";
import { cn } from "@/lib/utils";
import type { CustomerVisitStatus, VisitListItem } from "@/types";

function getStatusLabel(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return visitTexts.list.statuses.pending;
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return visitTexts.list.statuses.inProgress;
  }

  return visitTexts.list.statuses.completed;
}

function getStatusClassName(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return "border-amber-900/40 bg-amber-100 text-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return "border-blue-900/40 bg-blue-100 text-blue-900";
  }

  return "border-green-900/40 bg-green-100 text-green-900";
}

function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function VisitListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

function VisitCard({ visit }: { visit: VisitListItem }) {
  const shouldWarnPhoto = hasVisitPhotoWarning(visit);

  return (
    <Link
      href={ROUTES.visitDetail(visit.id)}
      className="block rounded-xl border border-border bg-background p-4 transition hover:border-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {visit.customer.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {visit.customer.phone}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium",
            getStatusClassName(visit.status),
          )}
        >
          {getStatusLabel(visit.status)}
        </span>
      </div>

      <p className="mt-3 text-sm text-foreground">
        {formatCustomerVisitServices(visit.services)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          {formatVisitDate(visit.createdAt)} {formatVisitTime(visit.createdAt)}
        </span>
        <span>{formatMoney(visit.totalPrice)}</span>
        {shouldWarnPhoto ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/30 bg-amber-100 px-2 py-0.5 text-amber-900">
            <AlertTriangle className="size-3" aria-hidden="true" />
            {visitTexts.list.photoWarning}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export default function VisitsPage() {
  const [status, setStatus] = useState<CustomerVisitStatus>(
    VISIT_STATUS_PENDING,
  );
  const { isLoadingVisits, visits, visitsError } = useVisits(status);

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-4 pb-20 text-foreground md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-4 flex items-start justify-between gap-4 md:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground md:text-2xl">
              {visitTexts.list.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {visitTexts.list.description}
            </p>
          </div>
          <Button asChild variant="primary" className="h-10 rounded-lg">
            <Link href={ROUTES.createVisit}>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              {visitTexts.list.createVisit}
            </Link>
          </Button>
        </header>

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {VISIT_STATUSES.map((filter) => (
            <Button
              key={filter}
              type="button"
              variant={filter === status ? "primary" : "outline"}
              className="h-9 rounded-lg"
              onClick={() => setStatus(filter)}
            >
              {getStatusLabel(filter)}
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
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        ) : null}

        {!isLoadingVisits && !visitsError && !visits.length ? (
          <EmptyState icon={CalendarClock} text={visitTexts.list.empty} />
        ) : null}
      </div>

      <AppMobileBottomNav activeItem="today" />
    </main>
  );
}
