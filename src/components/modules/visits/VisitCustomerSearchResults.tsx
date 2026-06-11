import { SearchX, Users } from "lucide-react";

import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import { customerTexts, visitTexts } from "@/constants/texts";
import type { VisitCreatePageViewProps } from "@/types";
import { VisitCustomerResultRow } from "./VisitCustomerResultRow";
import { VisitCustomerSearchSkeleton } from "./VisitCustomerSearchSkeleton";

export function VisitCustomerSearchResults({
  activeSearch,
  customers,
  customersError,
  isLoadingCustomers,
  onSelectCustomer,
}: Pick<
  VisitCreatePageViewProps,
  | "activeSearch"
  | "customers"
  | "customersError"
  | "isLoadingCustomers"
  | "onSelectCustomer"
>) {
  const hasSearched = activeSearch.trim().length > 0;
  const hasNoResults =
    hasSearched && !isLoadingCustomers && !customersError && customers.length === 0;

  return (
    <>
      {hasSearched ? (
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {visitTexts.create.customerResultsLabel(customers.length)}
        </p>
      ) : null}

      {isLoadingCustomers ? <VisitCustomerSearchSkeleton /> : null}

      {customersError ? (
        <InlineAlert className="mt-4">
          {customersError instanceof Error
            ? customersError.message
            : customerTexts.lookup.errors.generic}
        </InlineAlert>
      ) : null}

      {!hasSearched ? (
        <div className="mt-4">
          <EmptyState icon={Users} text={visitTexts.create.emptyBeforeSearch} />
        </div>
      ) : null}

      {hasNoResults ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} text={visitTexts.create.emptyAfterSearch} />
        </div>
      ) : null}

      {!isLoadingCustomers && customers.length ? (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
          {customers.map((customer) => (
            <VisitCustomerResultRow
              key={customer.id}
              customer={customer}
              onSelectCustomer={onSelectCustomer}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
