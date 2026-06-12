import { Calendar, Phone } from "lucide-react";

import { CustomerAvatar } from "@/components/modules/customers/CustomerAvatar";
import { visitTexts } from "@/constants/texts";
import { formatCustomerRelativeDate } from "@/lib/customerDisplay";
import type { Customer } from "@/types";

export function VisitSelectedCustomerCard({
  customer,
  onClearSelectedCustomer,
}: {
  customer: Customer;
  onClearSelectedCustomer: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {visitTexts.create.selectedCustomerLabel}
        </p>
        <button
          type="button"
          className="inline-flex shrink-0 items-center rounded-full border border-transparent bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onClearSelectedCustomer}
        >
          {visitTexts.create.changeCustomer}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <CustomerAvatar customer={customer} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {customer.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3" aria-hidden="true" />
            {customer.phone}
          </p>
        </div>
      </div>
      {customer.createdAt ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5" aria-hidden="true" />
          {customer.lastVisit
            ? formatCustomerRelativeDate(customer.lastVisit.createdAt)
            : visitTexts.create.noLastVisit}
        </p>
      ) : null}
    </div>
  );
}
