"use client";

import type { SyntheticEvent } from "react";
import { use, useEffect, useState } from "react";

import { VisitCreatePageView } from "@/components/modules/visits";
import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { VisitProvider } from "@/context/VisitContext";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer } from "@/types";
import {
  getCustomerFromVisitCreateSearchParams,
  getVisitSuggestionsFromSearchParams,
  type VisitCreateSearchParams,
} from "@/utils/visits";

const SEARCH_DEBOUNCE_MS = 300;

type VisitCreatePageProps = {
  searchParams: Promise<VisitCreateSearchParams>;
};

export default function VisitCreatePage({ searchParams }: VisitCreatePageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialCustomer =
    getCustomerFromVisitCreateSearchParams(resolvedSearchParams);
  const suggestions = getVisitSuggestionsFromSearchParams(resolvedSearchParams);
  const returnToCustomerId =
    resolvedSearchParams.returnToCustomerId ?? initialCustomer?.id ?? null;
  const backHref = returnToCustomerId
    ? ROUTES.customerDetail(returnToCustomerId)
    : ROUTES.customers;
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialCustomer,
  );
  const {
    customers,
    error: customersError,
    isLoading,
  } = useCustomers(activeSearch);
  const searchTerm = searchInput.trim();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveSearch(searchTerm);
  }

  return (
    <main aria-label={visitTexts.create.title}>
      <VisitProvider backHref={backHref} returnToCustomerId={returnToCustomerId}>
        <VisitCreatePageView
          activeSearch={activeSearch}
          customers={customers}
          customersError={customersError}
          backHref={backHref}
          isLoadingCustomers={isLoading}
          returnToCustomerId={returnToCustomerId}
          searchInput={searchInput}
          selectedCustomer={selectedCustomer}
          suggestions={suggestions}
          onClearSelectedCustomer={() => setSelectedCustomer(null)}
          onSearch={handleSearch}
          onSearchInputChange={(event) => setSearchInput(event.target.value)}
          onSelectCustomer={setSelectedCustomer}
        />
      </VisitProvider>
    </main>
  );
}
