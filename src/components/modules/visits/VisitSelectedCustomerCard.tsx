import { Calendar, Phone, X } from "lucide-react";

import { Button } from "@/components/global/ui/button";
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {visitTexts.create.selectedCustomerLabel}
          </p>
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
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" aria-hidden="true" />
            {customer.createdAt
              ? customer.lastVisit
                ? formatCustomerRelativeDate(customer.lastVisit.createdAt)
                : visitTexts.create.noLastVisit
              : visitTexts.create.selectedFromProfile}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="shrink-0"
          onClick={onClearSelectedCustomer}
        >
          <X className="size-4" aria-hidden="true" />
          {visitTexts.create.changeCustomer}
        </Button>
      </div>
    </div>
  );
}
