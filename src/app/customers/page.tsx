"use client";

import type { SyntheticEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

import {
  CreateCustomerModal,
  CustomerDesktopNav,
  CustomerMobileActions,
  CustomerMobileHeader,
  CustomerSearchForm,
  CustomerSearchResults,
  RecentCustomerSearches,
} from "@/components/modules/customers";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { useCustomers } from "@/hooks/useCustomers";
import { dispatchAppToast } from "@/lib/toast";
import {
  getEmptyRecentSearches,
  getStoredRecentSearches,
  subscribeToRecentSearches,
  VIETNAM_PHONE_REGEX,
  writeStoredRecentSearches,
} from "@/utils/customers";

const SEARCH_DEBOUNCE_MS = 300;
const MAX_RECENT_SEARCHES = 5;
const CREATE_SUCCESS_REDIRECT_DELAY_MS = 1000;

export default function CustomersPage() {
  const pageTitle = customerTexts.lookup.title;
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const recentSearches = useSyncExternalStore(
    subscribeToRecentSearches,
    getStoredRecentSearches,
    getEmptyRecentSearches,
  );
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

  const rememberRecentSearch = useCallback((search: string) => {
    if (!search) {
      return;
    }

    const nextSearches = [
      search,
      ...recentSearches.filter((item) => item !== search),
    ].slice(0, MAX_RECENT_SEARCHES);

    writeStoredRecentSearches(nextSearches);
  }, [recentSearches]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setError("");
      setActiveSearch(searchTerm);
      rememberRecentSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [rememberRecentSearch, searchTerm]);

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

    if (!VIETNAM_PHONE_REGEX.test(customerInput.phone)) {
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
    <main aria-label={pageTitle}>
      <div className="flex h-dvh overflow-hidden bg-muted/30 text-foreground md:min-h-screen md:overflow-visible">
        <CustomerDesktopNav />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:min-h-screen">
          <CustomerMobileHeader onCreateCustomer={() => openCreateCustomerModal()} />
          <header className="hidden h-14 items-center justify-between border-b border-border bg-background px-5 md:flex">
            <h1 className="text-sm font-semibold text-foreground">
              {customerTexts.lookup.title}
            </h1>
            <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-foreground">
              {customerTexts.lookup.currentUserInitials}
            </div>
          </header>

          <div className="mx-auto mb-14 min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 py-4 md:mb-0 md:overflow-visible md:px-5 md:py-5">
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
        </div>

        <CustomerMobileActions />

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
      </div>
    </main>
  );
}
