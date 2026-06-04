"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import VisitCreateForm from "@/app/customers/[id]/VisitCreateForm";
import { ROUTES } from "@/constants/routes";
import { customerTexts, visitTexts } from "@/constants/texts";
import { useCustomerVisits } from "@/hooks/useCustomerVisits";
import { useVisits } from "@/hooks/useVisits";
import type {
  CustomerVisitCardProps,
  CustomerVisitHistoryProps,
  CustomerVisitService,
  CustomerVisitSuggestion,
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

const STAFF_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function formatServices(services: CustomerVisitService[]) {
  if (!services.length) {
    return customerTexts.detail.noServices;
  }

  return services.map((service) => service.name).join(", ");
}

function getRemainingStaffEditMs(completedAt: string | null, now: number) {
  if (!completedAt) {
    return 0;
  }

  return Math.max(
    0,
    new Date(completedAt).getTime() + STAFF_EDIT_WINDOW_MS - now,
  );
}

function formatRemainingStaffEditTime(remainingMs: number) {
  const totalMinutes = Math.ceil(remainingMs / MINUTE_MS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return [
    visitTexts.staffEdit.remainingPrefix,
    hours ? `${hours} ${visitTexts.staffEdit.hourUnit}` : "",
    `${minutes} ${visitTexts.staffEdit.minuteUnit}`,
    visitTexts.staffEdit.remainingSuffix,
  ]
    .filter(Boolean)
    .join(" ");
}

function getSuggestionsKey(suggestions: CustomerVisitSuggestion | null) {
  if (!suggestions) {
    return "no-suggestions";
  }

  return [
    ...suggestions.services.map((service) => `${service.type}:${service.itemId}`),
    suggestions.barber?.id ?? "no-barber",
    suggestions.skinner?.id ?? "no-skinner",
  ].join("|");
}

function CustomerVisitCard({ customerId, visit }: CustomerVisitCardProps) {
  const [now, setNow] = useState(() => Date.now());
  const [barberId, setBarberId] = useState(visit.barber?.id ?? "");
  const [skinnerId, setSkinnerId] = useState(visit.skinner?.id ?? "");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    barbers,
    error: optionsError,
    isUpdatingStaff,
    skinners,
    updateVisitStaff,
  } = useVisits();
  const remainingStaffEditMs = useMemo(
    () => getRemainingStaffEditMs(visit.completedAt, now),
    [now, visit.completedAt],
  );
  const canEditStaff =
    visit.status === "completed" && Boolean(visit.completedAt) && remainingStaffEditMs > 0;

  useEffect(() => {
    if (visit.status !== "completed" || !visit.completedAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), MINUTE_MS);

    return () => window.clearInterval(intervalId);
  }, [visit.completedAt, visit.status]);

  async function handleStaffSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await updateVisitStaff({
        visitId: visit.id,
        customerId,
        barberId: barberId || null,
        skinnerId: skinnerId || null,
      });
      setSuccessMessage(visitTexts.staffEdit.success);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : visitTexts.staffEdit.errors.generic,
      );
    }
  }

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

      {visit.status === "completed" ? (
        <section className="mt-5 rounded-md border border-zinc-200 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-sm font-semibold text-zinc-900">
              {visitTexts.staffEdit.title}
            </h4>
            <p className="text-sm text-zinc-600">
              {canEditStaff
                ? formatRemainingStaffEditTime(remainingStaffEditMs)
                : visitTexts.staffEdit.locked}
            </p>
          </div>

          {optionsError ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {optionsError instanceof Error
                ? optionsError.message
                : visitTexts.staffEdit.errors.generic}
            </p>
          ) : null}

          <form onSubmit={handleStaffSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-zinc-800">
                {visitTexts.create.barberLabel}
              </span>
              <select
                value={barberId}
                onChange={(event) => setBarberId(event.target.value)}
                disabled={!canEditStaff || isUpdatingStaff}
                className="mt-2 h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-100"
              >
                <option value="">{visitTexts.create.noStaffOption}</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.username}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-800">
                {visitTexts.create.skinnerLabel}
              </span>
              <select
                value={skinnerId}
                onChange={(event) => setSkinnerId(event.target.value)}
                disabled={!canEditStaff || isUpdatingStaff}
                className="mt-2 h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-100"
              >
                <option value="">{visitTexts.create.noStaffOption}</option>
                {skinners.map((skinner) => (
                  <option key={skinner.id} value={skinner.id}>
                    {skinner.username}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={!canEditStaff || isUpdatingStaff}
              className="mt-6 h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:mt-7"
            >
              {isUpdatingStaff
                ? visitTexts.staffEdit.saving
                : visitTexts.staffEdit.submit}
            </button>
          </form>

          {error ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}
        </section>
      ) : null}

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

          <VisitCreateForm
            key={getSuggestionsKey(suggestions)}
            customerId={customerId}
            suggestions={suggestions}
          />
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
                <CustomerVisitCard
                  key={visit.id}
                  customerId={customerId}
                  visit={visit}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
