"use client";

import { Calendar, Phone, Search, SearchX, Users, X } from "lucide-react";

import { CustomerAvatar } from "@/components/modules/customers/CustomerAvatar";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Skeleton } from "@/components/global/Skeleton";
import { Button } from "@/components/global/ui/button";
import { customerTexts, visitTexts } from "@/constants/texts";
import { formatCustomerRelativeDate } from "@/lib/customerDisplay";
import type { Customer, VisitCreatePageViewProps } from "@/types";

function CustomerSearchSkeleton() {
  return (
    <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomerResultRow({
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

function SelectedCustomerCard({
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

function CustomerSearchForm({
  onSearch,
  onSearchInputChange,
  searchInput,
}: Pick<
  VisitCreatePageViewProps,
  "onSearch" | "onSearchInputChange" | "searchInput"
>) {
  return (
    <form onSubmit={onSearch} className="mt-4">
      <label
        className="text-sm font-medium text-foreground"
        htmlFor="visit-customer-search"
      >
        {visitTexts.create.customerSearchLabel}
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="visit-customer-search"
            value={searchInput}
            onChange={onSearchInputChange}
            placeholder={visitTexts.create.customerSearchPlaceholder}
            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
        <Button type="submit" variant="primary" className="h-11 shrink-0">
          {visitTexts.create.customerSearchButton}
        </Button>
      </div>
    </form>
  );
}

function CustomerSearchResults({
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

      {isLoadingCustomers ? <CustomerSearchSkeleton /> : null}

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
            <CustomerResultRow
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
          <SelectedCustomerCard
            customer={selectedCustomer}
            onClearSelectedCustomer={onClearSelectedCustomer}
          />
        </div>
      ) : (
        <>
          <CustomerSearchForm
            searchInput={searchInput}
            onSearch={onSearch}
            onSearchInputChange={onSearchInputChange}
          />
          <CustomerSearchResults
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
