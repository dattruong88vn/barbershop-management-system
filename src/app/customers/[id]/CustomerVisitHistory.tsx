"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { useCustomerVisits } from "@/hooks/useCustomerVisits";
import type {
  CustomerVisitCardProps,
  CustomerVisitHistoryProps,
  CustomerVisitService,
} from "@/types";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

function formatServices(services: CustomerVisitService[]) {
  if (!services.length) {
    return customerTexts.detail.noServices;
  }

  return services.map((service) => service.name).join(", ");
}

function CustomerVisitCard({ visit }: CustomerVisitCardProps) {
  return (
    <article className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {customerTexts.detail.visitDateLabel}
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            {DATE_TIME_FORMATTER.format(new Date(visit.createdAt))}
          </h3>
          <p className="mt-2 text-sm font-medium text-zinc-800">
            <span>{customerTexts.detail.totalPriceLabel}</span>
            <span className="ml-2">{PRICE_FORMATTER.format(visit.totalPrice)}</span>
          </p>
        </div>

        <dl className="grid w-full gap-3 text-sm sm:grid-cols-2 xl:max-w-2xl">
          <div>
            <dt className="font-medium text-zinc-800">
              {customerTexts.detail.servicesLabel}
            </dt>
            <dd className="mt-1 text-zinc-600">
              {formatServices(visit.services)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-800">
              {customerTexts.detail.barberLabel}
            </dt>
            <dd className="mt-1 text-zinc-600">
              {visit.barber?.username ?? customerTexts.detail.noStaff}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-800">
              {customerTexts.detail.skinnerLabel}
            </dt>
            <dd className="mt-1 text-zinc-600">
              {visit.skinner?.username ?? customerTexts.detail.noStaff}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-zinc-800">
          {customerTexts.detail.photosLabel}
        </p>
        {visit.photos.length ? (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {visit.photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.photoUrl}
                alt={customerTexts.detail.photosLabel}
                className="aspect-square w-full rounded-md border border-zinc-200 object-cover"
              />
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-zinc-600">
            {customerTexts.detail.noPhotos}
          </p>
        )}
      </div>
    </article>
  );
}

export default function CustomerVisitHistory({
  customerId,
}: CustomerVisitHistoryProps) {
  const { customer, error, isLoading, suggestions, visits } =
    useCustomerVisits(customerId);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section>
          <h1 className="text-2xl font-semibold">
            {customerTexts.detail.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {customerTexts.detail.description}
          </p>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {customerTexts.detail.customerInfoTitle}
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              {customer?.name ?? customerId}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-zinc-800">
                  {customerTexts.detail.phoneLabel}
                </dt>
                <dd className="mt-1 text-zinc-600">
                  {customer?.phone ?? customerTexts.detail.loading}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-800">
                  {customerTexts.detail.idLabel}
                </dt>
                <dd className="mt-1 break-all text-zinc-600">{customerId}</dd>
              </div>
            </dl>
            <Link
              href={ROUTES.customers}
              className="mt-6 inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-950"
            >
              {customerTexts.detail.backToLookup}
            </Link>
          </div>

          <section className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">
              {customerTexts.detail.suggestionTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {customerTexts.detail.suggestionDescription}
            </p>

            {suggestions ? (
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-zinc-800">
                    {customerTexts.detail.servicesLabel}
                  </dt>
                  <dd className="mt-1 text-zinc-600">
                    {formatServices(suggestions.services)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-800">
                    {customerTexts.detail.barberLabel}
                  </dt>
                  <dd className="mt-1 text-zinc-600">
                    {suggestions.barber?.username ?? customerTexts.detail.noStaff}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-800">
                    {customerTexts.detail.skinnerLabel}
                  </dt>
                  <dd className="mt-1 text-zinc-600">
                    {suggestions.skinner?.username ?? customerTexts.detail.noStaff}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">
                {customerTexts.detail.emptySuggestions}
              </p>
            )}
          </section>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-base font-semibold">
              {customerTexts.detail.historyTitle}
            </h2>
          </div>

          {isLoading ? (
            <p className="p-5 text-sm text-zinc-600">
              {customerTexts.detail.loading}
            </p>
          ) : null}

          {error ? (
            <p className="m-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error instanceof Error
                ? error.message
                : customerTexts.detail.errors.generic}
            </p>
          ) : null}

          {!isLoading && !error && visits.length === 0 ? (
            <p className="p-5 text-sm text-zinc-600">
              {customerTexts.detail.emptyVisits}
            </p>
          ) : null}

          {visits.length ? (
            <div className="divide-y divide-zinc-200">
              {visits.map((visit) => (
                <CustomerVisitCard key={visit.id} visit={visit} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
