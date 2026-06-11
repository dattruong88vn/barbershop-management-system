import { Phone } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { CustomerAvatar } from "@/components/modules/customers/CustomerAvatar";
import { visitTexts } from "@/constants/texts";
import type { Customer } from "@/types";

export function VisitCustomerResultRow({
  customer,
  onSelectCustomer,
}: {
  customer: Customer;
  onSelectCustomer: (customer: Customer) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectCustomer(customer)}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted/60"
    >
      <div className="flex min-w-0 items-center gap-3">
        <CustomerAvatar customer={customer} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {customer.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3" aria-hidden="true" />
            {customer.phone}
          </p>
        </div>
      </div>

      <Button type="button" variant="secondary" className="shrink-0">
        {visitTexts.create.selectCustomer}
      </Button>
    </button>
  );
}
