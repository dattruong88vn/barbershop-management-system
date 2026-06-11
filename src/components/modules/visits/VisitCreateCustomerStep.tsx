"use client";

import { visitTexts } from "@/constants/texts";
import type { VisitCreatePageViewProps } from "@/types";
import {
  VisitCustomerSearchForm,
  VisitCustomerSearchResults,
  VisitSelectedCustomerCard,
} from "../create-customer";

export function VisitCreateCustomerStep({
  activeSearch,
  customers,
  customersError,
  isLoadingCustomers,
  onClearSelectedCustomer,
  onSearch,
  onSearchInputChange,
  onSelectCustomer,
  searchInput,
  selectedCustomer,
}: VisitCreatePageViewProps) {
  return (
    <section className="rounded-xl border border-border bg-background p-4 md:p-5">
      <h2 className="text-sm font-semibold text-foreground md:text-base">
        {visitTexts.create.customerStepTitle}
      </h2>

      {selectedCustomer ? (
        <div className="mt-4">
          <VisitSelectedCustomerCard
            customer={selectedCustomer}
            onClearSelectedCustomer={onClearSelectedCustomer}
          />
        </div>
      ) : (
        <>
          <VisitCustomerSearchForm
            searchInput={searchInput}
            onSearch={onSearch}
            onSearchInputChange={onSearchInputChange}
          />
          <VisitCustomerSearchResults
            activeSearch={activeSearch}
            customers={customers}
            customersError={customersError}
            isLoadingCustomers={isLoadingCustomers}
            onSelectCustomer={onSelectCustomer}
          />
        </>
      )}
    </section>
  );
}
