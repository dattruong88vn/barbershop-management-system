"use client";

import type { SyntheticEvent } from "react";
import { use, useEffect, useState } from "react";

import { VisitCreatePageView } from "@/components/visits/VisitCreatePageView";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

type VisitCreatePageProps = {
  searchParams: Promise<{
    customerId?: string;
    name?: string;
    phone?: string;
  }>;
};

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

export default function VisitCreatePage({ searchParams }: VisitCreatePageProps) {
  const resolvedSearchParams = use(searchParams);
  const initialCustomer = getCustomerFromSearchParams(resolvedSearchParams);
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
    <VisitCreatePageView
      activeSearch={activeSearch}
      customers={customers}
      customersError={customersError}
      isLoadingCustomers={isLoading}
      searchInput={searchInput}
      selectedCustomer={selectedCustomer}
      onClearSelectedCustomer={() => setSelectedCustomer(null)}
      onSearch={handleSearch}
      onSearchInputChange={(event) => setSearchInput(event.target.value)}
      onSelectCustomer={setSelectedCustomer}
    />
  );
}
