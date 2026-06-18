import Link from "next/link";
import { Calendar, ImageIcon, Phone, Plus, Repeat } from "lucide-react";
import {
  UI_VARIANT_PRIMARY,
} from "@/constants/common";

import { CustomerProfileSkeleton } from "@/components/modules/customers";
import { Button } from "@/components/global/ui/button";
import { customerTexts } from "@/constants/texts";
import { getCustomerInitials } from "@/lib/customerDisplay";
import {
  formatRelativeVisitDate,
  formatVisitTime,
} from "@/lib/customerVisitDisplay";
import type { CustomerProfileMetric, CustomerVisit } from "@/types";

export function ProfileSummarySection({
  completedVisitCount,
  createVisitHref,
  displayName,
  displayPhone,
  isLoading,
  latestVisit,
  metrics,
  shouldWarnPhoto,
}: {
  completedVisitCount: number;
  createVisitHref: string | null;
  displayName: string;
  displayPhone: string;
  isLoading: boolean;
  latestVisit: CustomerVisit | null;
  metrics: CustomerProfileMetric[];
  shouldWarnPhoto: boolean;
}) {
  if (isLoading) {
    return <CustomerProfileSkeleton />;
  }

  return (
    <section className="rounded-xl border border-border bg-background p-4 md:border-0 md:p-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-base font-medium text-foreground md:size-16 md:text-xl">
            {getCustomerInitials(displayName)}
          </div>
          <div className="min-w-0">
            <div className="min-w-0">
              <h2 className="min-w-0 truncate text-sm font-semibold leading-tight text-foreground md:text-xl">
                {displayName}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-xs leading-tight text-muted-foreground md:text-sm">
                <Phone className="hidden size-4 md:block" aria-hidden="true" />
                {displayPhone}
              </p>
            </div>
            {latestVisit ? (
              <p className="mt-1 hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                <Calendar className="size-4" aria-hidden="true" />
                {customerTexts.detail.lastVisitPrefix}:{" "}
                {formatRelativeVisitDate(latestVisit.createdAt)} ·{" "}
                {formatVisitTime(latestVisit.createdAt)}
              </p>
            ) : null}
            <div className="mt-3 hidden flex-wrap gap-2 md:flex">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <Repeat className="size-3.5" aria-hidden="true" />
                {customerTexts.detail.visitCountBadge(completedVisitCount)}
              </span>
              {shouldWarnPhoto ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/40 bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                  <ImageIcon className="size-3.5" aria-hidden="true" />
                  {customerTexts.lookup.noPhotoWarning}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {createVisitHref ? (
          <Button
            asChild
            variant={UI_VARIANT_PRIMARY}
            size="lg"
            className="h-9 shrink-0 rounded-lg px-3 text-sm md:px-4"
          >
            <Link href={createVisitHref}>
              <Plus className="size-4" aria-hidden="true" />
              {customerTexts.detail.createVisit}
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 md:mt-6 md:gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.desktopLabel}
            className="rounded-lg bg-muted/50 px-2 py-3 text-center md:border md:border-border md:bg-background md:px-4 md:py-4"
          >
            <p className="text-base font-semibold text-foreground md:text-xl">
              <span className="md:hidden">
                {metric.mobileValue ?? metric.value}
              </span>
              <span className="hidden md:inline">{metric.value}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="md:hidden">{metric.mobileLabel}</span>
              <span className="hidden md:inline">{metric.desktopLabel}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
