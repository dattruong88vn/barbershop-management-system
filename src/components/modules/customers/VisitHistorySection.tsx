import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { CustomerSectionSkeleton } from "@/components/modules/customers";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import {
  formatCustomerVisitServices,
  formatMoney,
  formatRelativeVisitDate,
} from "@/lib/customerVisitDisplay";
import { cn } from "@/lib/utils";
import type { CustomerVisit } from "@/types";
import {
  getCustomerVisitStatusClassName,
  getCustomerVisitStatusIconClassName,
  getCustomerVisitStatusLabel,
  getCustomerVisitStatusTextClassName,
} from "@/utils/customers/visitHistory";

export function VisitHistorySection({
  customerId,
  error,
  isLoading,
  onShowMore,
  visitCount,
  visibleVisitCount,
  visibleVisits,
}: {
  customerId: string;
  error: unknown;
  isLoading: boolean;
  onShowMore: () => void;
  visitCount: number;
  visibleVisitCount: number;
  visibleVisits: CustomerVisit[];
}) {
  const shouldShowEmpty = !isLoading && !error && visitCount === 0;
  const shouldShowMore = visibleVisitCount < visitCount;

  return (
    <section className="mt-5 border-border md:mt-6 md:border-t md:pt-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="md:hidden">
          {customerTexts.detail.historyTitleShort}
        </span>
        <span className="hidden md:inline">
          {customerTexts.detail.historyTitle}
        </span>
      </h3>
      {isLoading ? (
        <CustomerSectionSkeleton itemCount={3} variant="rows" />
      ) : null}
      {shouldShowEmpty ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {customerTexts.detail.emptyVisits}
        </p>
      ) : null}
      {!isLoading && visibleVisits.length ? (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background md:border-0">
          {visibleVisits.map((visit) => (
            <Link
              key={visit.id}
              href={ROUTES.visitDetailFromCustomer(visit.id, customerId)}
              className="flex items-center gap-3 px-3 py-3 transition hover:bg-muted/60 md:px-0 md:py-4"
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  getCustomerVisitStatusIconClassName(visit.status),
                )}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    getCustomerVisitStatusTextClassName(visit.status),
                  )}
                >
                  {formatCustomerVisitServices(visit.services)}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <span>{formatRelativeVisitDate(visit.createdAt)}</span>
                  <span className="hidden md:inline">
                    {" "}
                    · {visit.barber?.username ?? customerTexts.detail.noStaff}
                  </span>
                  <span> · {formatMoney(visit.totalPrice)}</span>
                </p>
              </div>
              <span
                className={cn(
                  "hidden rounded-md border px-2 py-0.5 text-xs md:inline-flex",
                  getCustomerVisitStatusClassName(visit.status),
                )}
              >
                {getCustomerVisitStatusLabel(visit.status)}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      ) : null}
      {shouldShowMore ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={onShowMore}
        >
          {customerTexts.detail.viewMore}
        </Button>
      ) : null}
    </section>
  );
}
