import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import {
  formatCustomerVisitServices,
  formatMoney,
  formatVisitTime,
  hasVisitPhotoWarning,
} from "@/lib/customerVisitDisplay";
import { cn } from "@/lib/utils";
import type { VisitListItem } from "@/types";
import {
  formatVisitListDate,
  getVisitListStatusClassName,
  getVisitListStatusLabel,
} from "@/utils/visits";

type VisitListCardProps = {
  visit: VisitListItem;
};

export function VisitListCard({ visit }: VisitListCardProps) {
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
            getVisitListStatusClassName(visit.status),
          )}
        >
          {getVisitListStatusLabel(visit.status)}
        </span>
      </div>

      <p className="mt-3 text-sm text-foreground">
        {formatCustomerVisitServices(visit.services)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          {formatVisitListDate(visit.createdAt)}{" "}
          {formatVisitTime(visit.createdAt)}
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
