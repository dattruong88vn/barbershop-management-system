"use client";

import { ChevronRight, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { CustomerAvatar } from "@/components/customers/CustomerAvatar";
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
      className="material-base flex w-full items-center gap-3 p-3 text-left transition hover:border-gray-500 hover:bg-gray-200"
    >
      <CustomerAvatar customer={customer} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-label-13 text-gray-1000 md:text-label-14">
          {customer.name}
        </p>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-label-12 text-gray-700 md:text-label-13">
          <span>{customer.phone}</span>
          {customer.lastVisit ? (
            <span className="hidden md:inline">
              {formatCustomerRelativeDate(customer.lastVisit.createdAt)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {customer.lastVisit ? (
          <span className="hidden rounded-full border border-gray-400 bg-gray-200 px-2 py-1 text-label-12 text-gray-700 md:inline-flex">
            {customerTexts.lookup.visitCount}
          </span>
        ) : null}
        {shouldWarnPhoto ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-900/30 bg-amber-100 px-2 py-1 text-label-12 text-amber-900">
            <ImageIcon className="size-3.5" aria-hidden="true" />
            <span className="hidden md:inline">
              {customerTexts.lookup.noPhotoWarning}
            </span>
          </span>
        ) : null}
        <ChevronRight className="size-4 text-gray-700" aria-hidden="true" />
      </div>
    </button>
  );
}
