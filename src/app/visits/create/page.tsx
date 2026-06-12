"use client";

import type { SyntheticEvent } from "react";
import { use, useEffect, useState } from "react";

import { VisitCreatePageView } from "@/components/modules/visits";
import { ROUTES } from "@/constants/routes";
import { VisitProvider } from "@/context/VisitContext";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer, VisitCreateSuggestions } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

type VisitCreatePageProps = {
  searchParams: Promise<{
    customerId?: string;
    barberId?: string;
    comboIds?: string;
    name?: string;
    phone?: string;
    returnToCustomerId?: string;
    serviceIds?: string;
    skinnerId?: string;
  }>;
};

function getIdsFromSearchParam(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function getCustomerFromSearchParams({
  customerId,
  name,
  phone,
}: Awaited<VisitCreatePageProps["searchParams"]>): Customer | null {
  if (!customerId || !name || !phone) {
    return null;
  }

  return {
    createdAt: "",
    id: customerId,
    lastVisit: null,
    name,
    phone,
    shopId: "",
  };
}

function getVisitSuggestionsFromSearchParams({
  barberId,
  comboIds,
  serviceIds,
  skinnerId,
}: Awaited<VisitCreatePageProps["searchParams"]>): VisitCreateSuggestions | null {
  const serviceSuggestions = getIdsFromSearchParam(serviceIds).map((itemId) => ({
    itemId,
    type: "service" as const,
  }));
  const comboSuggestions = getIdsFromSearchParam(comboIds).map((itemId) => ({
    itemId,
    type: "combo" as const,
  }));

  if (
    !serviceSuggestions.length &&
    !comboSuggestions.length &&
    !barberId &&
    !skinnerId
  ) {
    return null;
  }

  return {
    barber: barberId ? { id: barberId } : null,
    services: comboSuggestions.length
      ? comboSuggestions
      : serviceSuggestions,
    skinner: skinnerId ? { id: skinnerId } : null,
  };
}

export default function VisitCreatePage({ searchParams }: VisitCreatePageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialCustomer = getCustomerFromSearchParams(resolvedSearchParams);
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
  );
}
