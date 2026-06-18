import { SearchX, Users } from "lucide-react";
import {
  UI_VARIANT_SECONDARY,
} from "@/constants/common";

import { CustomerCard } from "./CustomerCard";
import { CustomerSearchSkeleton } from "./CustomerSearchSkeleton";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
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
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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

      {!isLoading &&
      !customers.length &&
      !hasSearched &&
      defaultEmptyStateText ? (
        <EmptyState icon={Users} text={defaultEmptyStateText} />
      ) : null}

      {hasNoResults ? (
        <EmptyState
          icon={SearchX}
          text={customerTexts.lookup.emptyAfterSearch}
          action={
            <Button type="button" variant={UI_VARIANT_SECONDARY} onClick={onCreateCustomer}>
              {customerTexts.lookup.createOption}
            </Button>
          }
        />
      ) : null}

      {!isLoading && customers.length ? (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
