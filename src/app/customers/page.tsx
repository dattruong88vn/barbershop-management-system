"use client";

/* eslint-disable @next/next/no-img-element */

import type { SyntheticEvent } from "react";
import { useState } from "react";

import { customerTexts } from "@/constants/texts";
import { useCustomers } from "@/hooks/useCustomers";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function CustomersPage() {
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

  const hasSearched = activeSearch.trim().length > 0;
  const hasNoResults = hasSearched && !isLoading && customers.length === 0;

  function resetCreateForm() {
    setNewCustomerName("");
    setNewCustomerPhone("");
    setIsCreatingCustomer(false);
  }

  function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    resetCreateForm();

    const searchTerm = searchInput.trim();

    if (!searchTerm) {
      setActiveSearch("");
      setError(customerTexts.lookup.errors.missingSearch);
      return;
    }

    setActiveSearch(searchTerm);
    setNewCustomerPhone(searchTerm);
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

      setSearchInput(customer.phone);
      setActiveSearch(customer.phone);
      resetCreateForm();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : customerTexts.lookup.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section>
          <h1 className="text-2xl font-semibold">
            {customerTexts.lookup.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {customerTexts.lookup.description}
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <label className="block">
              <span className="text-sm font-medium text-zinc-800">
                {customerTexts.lookup.searchLabel}
              </span>
              <input
                type="search"
                value={searchInput}
                placeholder={customerTexts.lookup.searchPlaceholder}
                onChange={(event) => setSearchInput(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
              />
            </label>

            {error ? (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-5 h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {customerTexts.lookup.searchButton}
            </button>
          </form>

          {hasNoResults ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              {!isCreatingCustomer ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(true)}
                  className="h-11 w-full rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950"
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
                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
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
                        className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
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
                      className="h-11 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950"
                    >
                      {customerTexts.lookup.cancelCreate}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          {!hasSearched ? (
            <p className="p-5 text-sm text-zinc-600">
              {customerTexts.lookup.emptyBeforeSearch}
            </p>
          ) : null}

          {isLoading ? (
            <p className="p-5 text-sm text-zinc-600">
              {customerTexts.lookup.loading}
            </p>
          ) : null}

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

          {customers.length ? (
            <div className="divide-y divide-zinc-200">
              {customers.map((customer) => (
                <article key={customer.id} className="p-5">
                  <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {customerTexts.lookup.customerInfoTitle}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">
                        {customer.name}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-700">
                        <span className="font-medium">
                          {customerTexts.lookup.phonePrefix}
                        </span>
                        <span className="ml-2">{customer.phone}</span>
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        <span>{customerTexts.lookup.createdAtLabel}</span>
                        <span className="ml-1">
                          {DATE_TIME_FORMATTER.format(
                            new Date(customer.createdAt),
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="w-full xl:max-w-xl">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {customerTexts.lookup.lastVisitTitle}
                      </p>

                      {customer.lastVisit ? (
                        <div className="mt-3 space-y-4">
                          <p className="text-xs text-zinc-500">
                            <span>{customerTexts.lookup.visitedAtLabel}</span>
                            <span className="ml-1">
                              {DATE_TIME_FORMATTER.format(
                                new Date(customer.lastVisit.createdAt),
                              )}
                            </span>
                          </p>

                          <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="font-medium text-zinc-800">
                                {customerTexts.lookup.servicesLabel}
                              </dt>
                              <dd className="mt-1 text-zinc-600">
                                {customer.lastVisit.services.length
                                  ? customer.lastVisit.services
                                      .map((service) => service.name)
                                      .join(", ")
                                  : customerTexts.lookup.noServices}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-zinc-800">
                                {customerTexts.lookup.barberLabel}
                              </dt>
                              <dd className="mt-1 text-zinc-600">
                                {customer.lastVisit.barber?.username ??
                                  customerTexts.lookup.noStaff}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-zinc-800">
                                {customerTexts.lookup.skinnerLabel}
                              </dt>
                              <dd className="mt-1 text-zinc-600">
                                {customer.lastVisit.skinner?.username ??
                                  customerTexts.lookup.noStaff}
                              </dd>
                            </div>
                          </dl>

                          <div>
                            <p className="text-sm font-medium text-zinc-800">
                              {customerTexts.lookup.photosLabel}
                            </p>
                            {customer.lastVisit.photos.length ? (
                              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {customer.lastVisit.photos.map((photo) => (
                                  <img
                                    key={photo.id}
                                    src={photo.photoUrl}
                                    alt={customerTexts.lookup.photosLabel}
                                    className="aspect-square w-full rounded-md border border-zinc-200 object-cover"
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-zinc-600">
                                {customerTexts.lookup.noPhotos}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-600">
                          {customerTexts.lookup.noLastVisit}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
