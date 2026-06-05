import { SearchX, Users } from "lucide-react";

import { CustomerCard } from "@/components/customers/CustomerCard";
import { CustomerEmptyState } from "@/components/customers/CustomerEmptyState";
import { CustomerSearchSkeleton } from "@/components/customers/CustomerSearchSkeleton";
import { InlineAlert } from "@/components/design-system/InlineAlert";
import { Button } from "@/components/ui/button";
import { customerTexts } from "@/constants/texts";
import type { CustomerSearchResultsProps } from "@/types";

export function CustomerSearchResults({
  customers,
  customersError,
  defaultEmptyStateText,
  hasNoResults,
  hasSearched,
  isLoading,
  onCreateCustomer,
}: CustomerSearchResultsProps) {
  return (
    <section className="mt-6 flex-1">
      {hasSearched ? (
        <p className="mb-3 text-label-12 uppercase text-gray-700">
          {customerTexts.lookup.resultsLabel(customers.length)}
        </p>
      ) : null}

      {isLoading ? <CustomerSearchSkeleton /> : null}

      {customersError ? (
        <InlineAlert>
          {customersError instanceof Error
            ? customersError.message
            : customerTexts.lookup.errors.generic}
        </InlineAlert>
      ) : null}

      {!hasSearched && defaultEmptyStateText ? (
        <CustomerEmptyState icon={Users} text={defaultEmptyStateText} />
      ) : null}

      {hasNoResults ? (
        <CustomerEmptyState
          icon={SearchX}
          text={customerTexts.lookup.emptyAfterSearch}
          action={
            <Button type="button" variant="secondary" onClick={onCreateCustomer}>
              {customerTexts.lookup.createOption}
            </Button>
          }
        />
      ) : null}

      {!isLoading && customers.length ? (
        <div className="space-y-3">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
