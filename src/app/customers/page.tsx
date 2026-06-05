"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CreateCustomerModal } from "@/components/customers/CreateCustomerModal";
import {
  CustomerDesktopNav,
  CustomerMobileHeader,
} from "@/components/customers/CustomerSearchHeader";
import { CustomerMobileActions } from "@/components/customers/CustomerMobileActions";
import { CustomerSearchForm } from "@/components/customers/CustomerSearchForm";
import { CustomerSearchResults } from "@/components/customers/CustomerSearchResults";
import { RecentCustomerSearches } from "@/components/customers/RecentCustomerSearches";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { useCustomers } from "@/hooks/useCustomers";
import { dispatchAppToast } from "@/lib/toast";

const RECENT_SEARCHES_KEY = "barberos:recent-customer-searches";
const SEARCH_DEBOUNCE_MS = 300;
const MAX_RECENT_SEARCHES = 5;
const CREATE_SUCCESS_REDIRECT_DELAY_MS = 1000;
const PHONE_REGEX = /^0\d{9}$/;

function getStoredRecentSearches() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);

  if (!storedSearches) {
    return [];
  }

  try {
    const parsedSearches: unknown = JSON.parse(storedSearches);

    return Array.isArray(parsedSearches)
      ? parsedSearches.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function CustomersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [error, setError] = useState("");
  const {
    customers,
    createCustomer,
    error: customersError,
    isCreating,
    isLoading,
  } = useCustomers(activeSearch);

  const searchTerm = searchInput.trim();
  const hasSearchInput = searchTerm.length > 0;
  const hasSearched = activeSearch.trim().length > 0;
  const hasNoResults =
    hasSearched && !isLoading && !customersError && customers.length === 0;
  const shouldShowRecentSearches =
    !hasSearchInput && recentSearches.length > 0;

  const defaultEmptyStateText = useMemo(
    () =>
      shouldShowRecentSearches
        ? ""
        : customerTexts.lookup.emptyBeforeSearch,
    [shouldShowRecentSearches],
  );

  function rememberRecentSearch(search: string) {
    if (!search) {
      return;
    }

    setRecentSearches((currentSearches) => {
      const nextSearches = [
        search,
        ...currentSearches.filter((item) => item !== search),
      ].slice(0, MAX_RECENT_SEARCHES);

      window.localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(nextSearches),
      );

      return nextSearches;
    });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setError("");
      setActiveSearch(searchTerm);
      rememberRecentSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  function openCreateCustomerModal(prefillPhone = searchTerm) {
    setError("");
    setNewCustomerName("");
    setNewCustomerPhone(prefillPhone);
    setIsCreateOpen(true);
  }

  function closeCreateCustomerModal() {
    setIsCreateOpen(false);
    setError("");
  }

  function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setActiveSearch(searchTerm);
  }

  function handleRecentSearch(search: string) {
    setSearchInput(search);
    setActiveSearch(search);
    rememberRecentSearch(search);
  }

  function handleClearSearch() {
    setSearchInput("");
    setActiveSearch("");
    setError("");
  }

  async function handleCreateCustomer(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const customerInput = {
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
    };

    if (!customerInput.name) {
      setError(customerTexts.lookup.errors.missingName);
      return;
    }

    if (!customerInput.phone) {
      setError(customerTexts.lookup.errors.missingPhone);
      return;
    }

    if (!PHONE_REGEX.test(customerInput.phone)) {
      setError(customerTexts.lookup.errors.invalidPhone);
      return;
    }

    try {
      const customer = await createCustomer(customerInput);

      setIsCreateOpen(false);
      dispatchAppToast({
        description: customerTexts.lookup.createSuccessDescription(
          customerInput.name,
        ),
        message: customerTexts.lookup.createSuccess,
        type: "success",
      });
      window.setTimeout(() => {
        router.push(ROUTES.customerDetail(customer.id));
      }, CREATE_SUCCESS_REDIRECT_DELAY_MS);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : customerTexts.lookup.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-background-100 pb-20 text-gray-1000">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-6 pt-4 md:px-6 md:pt-0">
        <CustomerMobileHeader />
        <CustomerDesktopNav />

        <CustomerSearchForm
          searchInput={searchInput}
          onSearch={handleSearch}
          onSearchInputChange={(event) => setSearchInput(event.target.value)}
          onClearSearch={handleClearSearch}
          onCreateCustomer={() => openCreateCustomerModal()}
        />

        {shouldShowRecentSearches ? (
          <RecentCustomerSearches
            searches={recentSearches}
            onSelectSearch={handleRecentSearch}
          />
        ) : null}

        <CustomerSearchResults
          customers={customers}
          customersError={customersError}
          defaultEmptyStateText={defaultEmptyStateText}
          hasNoResults={hasNoResults}
          hasSearched={hasSearched}
          isLoading={isLoading}
          onCreateCustomer={() => openCreateCustomerModal()}
        />
      </div>

      <CustomerMobileActions onCreateCustomer={() => openCreateCustomerModal()} />

      {isCreateOpen ? (
        <CreateCustomerModal
          error={error}
          isCreating={isCreating}
          name={newCustomerName}
          phone={newCustomerPhone}
          onClose={closeCreateCustomerModal}
          onNameChange={(event) => setNewCustomerName(event.target.value)}
          onPhoneChange={(event) => setNewCustomerPhone(event.target.value)}
          onSubmit={handleCreateCustomer}
        />
      ) : null}
    </main>
  );
}
