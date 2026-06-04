"use client";

import Link from "next/link";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer, CustomerLastVisitService } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string) {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

function formatServices(services: CustomerLastVisitService[]) {
  if (!services.length) {
    return customerTexts.lookup.noServices;
  }

  return services.map((service) => service.name).join(", ");
}

function CustomerSearchSkeleton() {
  return (
    <div className="divide-y divide-zinc-200">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="p-4 sm:p-5">
          <div className="flex animate-pulse gap-3">
            <div className="h-12 w-12 rounded-full bg-zinc-200" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-4 w-2/3 rounded bg-zinc-200" />
              <div className="h-3 w-1/2 rounded bg-zinc-200" />
              <div className="h-3 w-4/5 rounded bg-zinc-100" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 rounded-md bg-zinc-100" />
                <div className="h-11 rounded-md bg-zinc-100" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function CustomerAvatar({ customer }: { customer: Customer }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-base font-semibold text-zinc-800">
      {customer.name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <article className="p-4 sm:p-5">
      <div className="flex gap-3">
        <CustomerAvatar customer={customer} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-zinc-950">
                {customer.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-700">
                <span className="font-medium">
                  {customerTexts.lookup.phonePrefix}
                </span>
                <span className="ml-2">{customer.phone}</span>
              </p>
            </div>

            <p className="text-xs text-zinc-500">
              <span>{customerTexts.lookup.createdAtLabel}</span>
              <span className="ml-1">{formatDateTime(customer.createdAt)}</span>
            </p>
          </div>

          <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-sm font-medium text-zinc-900">
              {customerTexts.lookup.lastVisitTitle}
            </p>

            {customer.lastVisit ? (
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-zinc-500">
                    {customerTexts.lookup.visitedAtLabel}
                  </dt>
                  <dd className="mt-1 font-medium text-zinc-800">
                    {formatDateTime(customer.lastVisit.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">
                    {customerTexts.lookup.barberLabel}
                  </dt>
                  <dd className="mt-1 font-medium text-zinc-800">
                    {customer.lastVisit.barber?.username ??
                      customerTexts.lookup.noStaff}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500">
                    {customerTexts.lookup.servicesLabel}
                  </dt>
                  <dd className="mt-1 text-zinc-800">
                    {formatServices(customer.lastVisit.services)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-zinc-600">
                {customerTexts.lookup.noLastVisit}
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href={ROUTES.customerDetail(customer.id)}
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            >
              {customerTexts.lookup.viewDetail}
            </Link>
            <Link
              href={ROUTES.customerCreateVisit(customer.id)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            >
              {customerTexts.lookup.createVisit}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [error, setError] = useState("");
  const {
    customers,
    createCustomer,
    error: customersError,
    isCreating,
    isLoading,
  } = useCustomers(activeSearch);

  const searchTerm = searchInput.trim();
  const hasSearched = activeSearch.trim().length > 0;
  const hasNoResults =
    hasSearched && !isLoading && !customersError && customers.length === 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setError("");
      setIsCreatingCustomer(false);
      setActiveSearch(searchTerm);
      setNewCustomerPhone(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  function resetCreateForm() {
    setNewCustomerName("");
    setNewCustomerPhone(activeSearch);
    setIsCreatingCustomer(false);
  }

  function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    resetCreateForm();

    if (!searchTerm) {
      setActiveSearch("");
      setError(customerTexts.lookup.errors.missingSearch);
      return;
    }

    setActiveSearch(searchTerm);
    setNewCustomerPhone(searchTerm);
  }

  function handleClearSearch() {
    setSearchInput("");
    setActiveSearch("");
    setError("");
    resetCreateForm();
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

    try {
      const customer = await createCustomer(customerInput);

      router.push(ROUTES.customerDetail(customer.id));
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : customerTexts.lookup.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section className="lg:sticky lg:top-6 lg:self-start">
          <header>
            <h1 className="text-2xl font-semibold">
              {customerTexts.lookup.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {customerTexts.lookup.description}
            </p>
          </header>

          <form
            onSubmit={handleSearch}
            className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:p-5"
          >
            <label className="block">
              <span className="text-sm font-medium text-zinc-800">
                {customerTexts.lookup.searchLabel}
              </span>
              <span className="mt-2 flex min-h-11 items-center rounded-md border border-zinc-300 bg-white focus-within:border-zinc-950">
                <input
                  type="search"
                  value={searchInput}
                  placeholder={customerTexts.lookup.searchPlaceholder}
                  autoFocus
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-md px-3 text-sm text-zinc-950 outline-none"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="mr-1 h-9 rounded-md px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  >
                    {customerTexts.lookup.clearSearch}
                  </button>
                ) : null}
              </span>
            </label>

            {error ? (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-5 h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            >
              {customerTexts.lookup.searchButton}
            </button>
          </form>

          {hasNoResults ? (
            <section className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
              {!isCreatingCustomer ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(true)}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                >
                  {customerTexts.lookup.createOption}
                </button>
              ) : (
                <form onSubmit={handleCreateCustomer}>
                  <h2 className="text-base font-semibold">
                    {customerTexts.lookup.createTitle}
                  </h2>

                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-zinc-800">
                        {customerTexts.lookup.nameLabel}
                      </span>
                      <input
                        type="text"
                        value={newCustomerName}
                        required
                        placeholder={customerTexts.lookup.namePlaceholder}
                        onChange={(event) =>
                          setNewCustomerName(event.target.value)
                        }
                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-zinc-800">
                        {customerTexts.lookup.phoneLabel}
                      </span>
                      <input
                        type="tel"
                        value={newCustomerPhone}
                        required
                        placeholder={customerTexts.lookup.phonePlaceholder}
                        onChange={(event) =>
                          setNewCustomerPhone(event.target.value)
                        }
                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="h-11 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {customerTexts.lookup.submitCreate}
                    </button>
                    <button
                      type="button"
                      onClick={resetCreateForm}
                      className="h-11 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950"
                    >
                      {customerTexts.lookup.cancelCreate}
                    </button>
                  </div>
                </form>
              )}
            </section>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {!hasSearched ? (
            <p className="p-5 text-sm text-zinc-600">
              {customerTexts.lookup.emptyBeforeSearch}
            </p>
          ) : null}

          {isLoading ? <CustomerSearchSkeleton /> : null}

          {customersError ? (
            <p className="m-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {customersError instanceof Error
                ? customersError.message
                : customerTexts.lookup.errors.generic}
            </p>
          ) : null}

          {hasNoResults ? (
            <p className="p-5 text-sm text-zinc-600">
              {customerTexts.lookup.emptyAfterSearch}
            </p>
          ) : null}

          {!isLoading && customers.length ? (
            <div className="divide-y divide-zinc-200">
              {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
