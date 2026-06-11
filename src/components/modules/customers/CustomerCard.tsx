"use client";

import { ChevronRight, ImageIcon, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

import { CustomerAvatar } from "@/components/modules/customers/CustomerAvatar";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import {
  formatCustomerRelativeDate,
  hasCustomerPhotoWarning,
} from "@/lib/customerDisplay";
import type { CustomerCardLookupProps } from "@/types";

export function CustomerCard({ customer }: CustomerCardLookupProps) {
  const router = useRouter();
  const shouldWarnPhoto = hasCustomerPhotoWarning(customer);

  return (
    <button
      type="button"
      onClick={() => router.push(ROUTES.customerDetail(customer.id))}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted/60"
    >
      <div className="flex min-w-0 items-center gap-3">
        <CustomerAvatar customer={customer} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {customer.name}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3" aria-hidden="true" />
              {customer.phone}
            </span>
            {customer.lastVisit ? (
              <span className="hidden md:inline">
                {formatCustomerRelativeDate(customer.lastVisit.createdAt)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {customer.lastVisit ? (
          <span className="hidden rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground md:inline-flex">
            {customerTexts.lookup.visitCount}
          </span>
        ) : null}
        {shouldWarnPhoto ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/30 bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
            <ImageIcon className="size-3.5" aria-hidden="true" />
            <span className="hidden md:inline">
              {customerTexts.lookup.noPhotoWarning}
            </span>
          </span>
        ) : null}
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </button>
  );
}
