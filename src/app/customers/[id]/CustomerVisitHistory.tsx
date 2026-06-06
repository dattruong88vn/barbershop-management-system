"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  EllipsisVertical,
  ImageIcon,
  Pencil,
  Phone,
  Plus,
  Repeat,
  Scissors,
  Search,
  User,
  X,
} from "lucide-react";
import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";

import { FormTextField } from "@/components/design-system/FormTextField";
import { InlineAlert } from "@/components/design-system/InlineAlert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { useCustomerVisits } from "@/hooks/useCustomerVisits";
import { dispatchAppToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
  CustomerVisit,
  CustomerVisitHistoryProps,
  CustomerVisitPhoto,
  CustomerVisitService,
} from "@/types";

const PHONE_REGEX = /^0\d{9}$/;
const VISIT_HISTORY_LIMIT = 10;

const MONEY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
}

function formatServices(services: CustomerVisitService[]) {
  if (!services.length) {
    return customerTexts.detail.noServices;
  }

  return services.map((service) => service.name).join(" + ");
}

function formatCompactMoney(value: number) {
  if (value >= 1000000) {
    return `${Number((value / 1000000).toFixed(1))}${customerTexts.detail.millionSuffix}`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}${customerTexts.detail.thousandSuffix}`;
  }

  return `${MONEY_FORMATTER.format(value)}${customerTexts.detail.currencySuffix}`;
}

function formatMoney(value: number) {
  return `${MONEY_FORMATTER.format(value)}${customerTexts.detail.currencySuffix}`;
}

function formatRelativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return customerTexts.detail.today;
  }

  if (diffDays === 1) {
    return customerTexts.detail.yesterday;
  }

  if (diffDays < 30) {
    return customerTexts.detail.daysAgo(diffDays);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getVisitCycleDays(visits: CustomerVisit[]) {
  if (visits.length < 2) {
    return null;
  }

  const timestamps = visits.map((visit) => new Date(visit.createdAt).getTime());
  const totalDiff = timestamps
    .slice(0, -1)
    .reduce((total, timestamp, index) => total + Math.abs(timestamp - timestamps[index + 1]), 0);
  const averageMs = totalDiff / (timestamps.length - 1);

  return Math.max(1, Math.round(averageMs / (1000 * 60 * 60 * 24)));
}

function getRecentPhotos(visits: CustomerVisit[]) {
  return visits
    .flatMap((visit) => visit.photos)
    .sort(
      (firstPhoto, secondPhoto) =>
        new Date(secondPhoto.createdAt).getTime() -
        new Date(firstPhoto.createdAt).getTime(),
    );
}

function hasPhotoWarning(visit: CustomerVisit | null) {
  return Boolean(visit && visit.services.length > 0 && visit.photos.length === 0);
}

function formatSuggestionStaffName(username: string) {
  return username.split(/\s+/).filter(Boolean).at(-1) ?? username;
}

export default function CustomerVisitHistory({
  customerId,
}: CustomerVisitHistoryProps) {
  const {
    customer,
    error,
    isLoading,
    isUpdatingCustomer,
    suggestions,
    updateCustomer,
    visits,
  } = useCustomerVisits(customerId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerVisitPhoto | null>(
    null,
  );
  const [visibleVisitCount, setVisibleVisitCount] = useState(VISIT_HISTORY_LIMIT);

  const completedVisits = useMemo(
    () => visits.filter((visit) => visit.status === "completed"),
    [visits],
  );
  const latestVisit = completedVisits[0] ?? null;
  const recentPhotos = useMemo(
    () => getRecentPhotos(completedVisits),
    [completedVisits],
  );
  const visibleVisits = completedVisits.slice(0, visibleVisitCount);
  const totalSpend = completedVisits.reduce(
    (total, visit) => total + visit.totalPrice,
    0,
  );
  const visitCycleDays = getVisitCycleDays(completedVisits);
  const shouldWarnPhoto = hasPhotoWarning(latestVisit);
  const displayName = customer?.name ?? customerId;
  const displayPhone = customer?.phone ?? customerTexts.detail.loading;
  const metrics = [
    {
      desktopLabel: customerTexts.detail.visitCountMetric,
      mobileLabel: customerTexts.detail.visitCountMetricMobile,
      value: completedVisits.length.toString(),
    },
    {
      desktopLabel: customerTexts.detail.totalSpendMetric,
      mobileLabel: customerTexts.detail.totalSpendMetricMobile,
      value: formatCompactMoney(totalSpend),
    },
    {
      desktopLabel: customerTexts.detail.visitCycleMetric,
      mobileLabel: customerTexts.detail.visitCycleMetricMobile,
      value:
        visitCycleDays === null
          ? "—"
          : customerTexts.detail.visitCycleValue(visitCycleDays),
      mobileValue:
        visitCycleDays === null
          ? "—"
          : customerTexts.detail.visitCycleValueCompact(visitCycleDays),
    },
  ];

  function openEditModal() {
    setName(customer?.name ?? "");
    setPhone(customer?.phone ?? "");
    setFormError("");
    setIsMenuOpen(false);
    setIsEditOpen(true);
  }

  async function handleUpdateCustomer(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const customerInput = {
      name: name.trim(),
      phone: phone.trim(),
    };

    if (!customerInput.name) {
      setFormError(customerTexts.detail.errors.missingName);
      return;
    }

    if (!customerInput.phone) {
      setFormError(customerTexts.detail.errors.missingPhone);
      return;
    }

    if (!PHONE_REGEX.test(customerInput.phone)) {
      setFormError(customerTexts.detail.errors.invalidPhone);
      return;
    }

    try {
      const updatedCustomer = await updateCustomer({
        id: customerId,
        name: customerInput.name,
        phone: customerInput.phone,
      });

      setIsEditOpen(false);
      dispatchAppToast({
        description: customerTexts.detail.updateSuccessDescription(
          updatedCustomer.name,
        ),
        message: customerTexts.detail.updateSuccess,
        type: "success",
      });
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : customerTexts.detail.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-background-200 px-0 py-0 text-gray-1000 md:px-6 md:py-8">
      <div className="mx-auto w-full md:max-w-5xl">
        <div className="overflow-hidden border-gray-400 bg-gray-200 md:rounded-xl md:border">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-400 bg-gray-200 px-4 md:h-[76px] md:px-6">
            <div className="hidden min-w-0 items-center gap-4 md:flex">
              <Link
                href={ROUTES.customers}
                className="flex items-center gap-3 text-label-14 text-gray-700 transition hover:text-gray-1000"
                aria-label={customerTexts.detail.backToLookup}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {customerTexts.lookup.title}
              </Link>
              <ChevronRight className="size-4 text-gray-700" aria-hidden="true" />
              <span className="truncate text-label-14 text-gray-1000">
                {customer?.name ?? customerTexts.detail.profileTitle}
              </span>
            </div>

            <Link
              href={ROUTES.customers}
              className="flex size-10 items-center justify-center rounded-md text-gray-1000 hover:bg-gray-300 md:hidden"
              aria-label={customerTexts.detail.backToLookup}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-heading-20 text-gray-1000 md:hidden">
              {customerTexts.detail.profileTitle}
            </h1>

            <div className="hidden items-center gap-3 md:flex">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="h-11 rounded-lg border-gray-500 bg-gray-200 px-5 text-label-14 hover:bg-gray-300"
                onClick={openEditModal}
              >
                <Pencil className="size-4" aria-hidden="true" />
                {customerTexts.detail.edit}
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-11 rounded-lg border-gray-500 bg-gray-200 px-5 text-label-14 hover:bg-gray-300"
              >
                <Link href={ROUTES.customerCreateVisit(customerId)}>
                  <Plus className="size-4" aria-hidden="true" />
                  {customerTexts.detail.createVisit}
                </Link>
              </Button>
            </div>

            <div className="relative ml-auto md:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex size-10 items-center justify-center rounded-md text-gray-1000 hover:bg-gray-300"
                aria-label={customerTexts.detail.editInfo}
              >
                <EllipsisVertical className="size-5" aria-hidden="true" />
              </button>
              {isMenuOpen ? (
                <div className="absolute right-0 top-11 z-30 min-w-40 rounded-lg border border-gray-400 bg-gray-100 p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-label-13 text-gray-1000 hover:bg-gray-200"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    {customerTexts.detail.editInfo}
                  </button>
                  <Link
                    href={ROUTES.customerCreateVisit(customerId)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-label-13 text-gray-1000 hover:bg-gray-200"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    {customerTexts.detail.createVisit}
                  </Link>
                </div>
              ) : null}
            </div>
          </header>

          <div className="px-5 pb-16 pt-5 md:px-6 md:pb-7 md:pt-6">
            {isLoading ? (
              <p className="mb-4 text-copy-13 text-gray-700">
                {customerTexts.detail.loading}
              </p>
            ) : null}

            {error ? (
              <InlineAlert className="mb-4">
                {error instanceof Error
                  ? error.message
                  : customerTexts.detail.errors.generic}
              </InlineAlert>
            ) : null}

            <section>
              <div className="flex items-center gap-4 md:items-start">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-blue-900/20 bg-blue-100 text-heading-20 text-blue-900 md:size-20 md:text-heading-24">
                  {getInitials(customer?.name ?? customerTexts.detail.profileTitle)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-heading-20 text-gray-1000 md:text-[1.75rem] md:font-semibold md:leading-9">
                    {displayName}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-label-13 text-gray-800 md:text-label-14">
                    <Phone className="hidden size-4 md:block" aria-hidden="true" />
                    {displayPhone}
                  </p>
                  {latestVisit ? (
                    <p className="mt-1 hidden items-center gap-2 text-label-13 text-gray-700 md:flex">
                      <Calendar className="size-4" aria-hidden="true" />
                      {customerTexts.detail.lastVisitPrefix}:{" "}
                      {formatRelativeDate(latestVisit.createdAt)} ·{" "}
                      {formatTime(latestVisit.createdAt)}
                    </p>
                  ) : null}
                  <div className="mt-3 hidden flex-wrap gap-2 md:flex">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-400 bg-gray-200 px-3 py-1.5 text-label-12 text-gray-900">
                      <Repeat className="size-3.5" aria-hidden="true" />
                      {customerTexts.detail.visitCountBadge(completedVisits.length)}
                    </span>
                    {shouldWarnPhoto ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-900/40 bg-amber-100 px-3 py-1.5 text-label-12 text-amber-900">
                        <ImageIcon className="size-3.5" aria-hidden="true" />
                        {customerTexts.lookup.noPhotoWarning}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 md:mt-8 md:gap-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.desktopLabel}
                    className="rounded-lg border border-transparent bg-gray-100 px-2 py-4 text-center md:px-4 md:py-5"
                  >
                    <p className="text-heading-20 text-gray-1000 md:text-[1.875rem] md:font-semibold md:leading-9">
                      <span className="md:hidden">
                        {metric.mobileValue ?? metric.value}
                      </span>
                      <span className="hidden md:inline">{metric.value}</span>
                    </p>
                    <p className="mt-1 text-label-12 text-gray-700 md:text-label-13">
                      <span className="md:hidden">{metric.mobileLabel}</span>
                      <span className="hidden md:inline">{metric.desktopLabel}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {suggestions ? (
              <section className="mt-5 border-gray-400 md:mt-6 md:border-t md:pt-5">
                <h3 className="text-label-14 uppercase tracking-[0.08em] text-gray-700">
                  <span className="md:hidden">
                    {customerTexts.detail.suggestionTitleShort}
                  </span>
                  <span className="hidden md:inline">
                    {customerTexts.detail.suggestionTitle}
                  </span>
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-gray-400 bg-gray-100 px-3 py-2 text-label-13 text-gray-1000">
                    <Scissors className="size-4" aria-hidden="true" />
                    {formatServices(suggestions.services)}
                  </span>
                  {suggestions.barber ? (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-gray-400 bg-gray-100 px-3 py-2 text-label-13 text-gray-1000">
                      <User className="size-4" aria-hidden="true" />
                      <span className="md:hidden">
                        {formatSuggestionStaffName(suggestions.barber.username)}
                      </span>
                      <span className="hidden md:inline">
                        {customerTexts.detail.barberLabelShort}:{" "}
                        {suggestions.barber.username}
                      </span>
                    </span>
                  ) : null}
                  {suggestions.skinner ? (
                    <span className="hidden items-center gap-2 rounded-lg border border-gray-400 bg-gray-100 px-3 py-2 text-label-13 text-gray-1000 md:inline-flex">
                      <User className="size-4" aria-hidden="true" />
                      {customerTexts.detail.skinnerLabel}:{" "}
                      {suggestions.skinner.username}
                    </span>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="mt-5 border-gray-400 md:mt-5 md:border-t md:pt-5">
              <h3 className="text-label-14 uppercase tracking-[0.08em] text-gray-700">
                <span className="md:hidden">
                  {customerTexts.detail.photosRecentTitleShort}
                </span>
                <span className="hidden md:inline">
                  {customerTexts.detail.photosRecentTitle}
                </span>
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
                {recentPhotos.length ? (
                  <>
                    {recentPhotos.slice(0, 3).map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setSelectedPhoto(photo)}
                        className="aspect-square overflow-hidden rounded-lg border border-gray-400 bg-gray-100 transition hover:border-gray-500"
                      >
                        <img
                          src={photo.photoUrl}
                          alt={customerTexts.detail.photosLabel}
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                    {recentPhotos.length > 3 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(recentPhotos[3])}
                        className="flex aspect-square items-center justify-center rounded-lg border border-gray-400 bg-gray-100 text-heading-20 text-gray-800 transition hover:border-gray-500 hover:text-gray-1000"
                      >
                        {customerTexts.detail.morePhotos(recentPhotos.length - 3)}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <div className="col-span-3 flex aspect-[3/1] items-center justify-center rounded-lg border border-dashed border-gray-400 bg-gray-100 text-copy-13 text-gray-700 md:col-span-4 md:aspect-[4/1]">
                    <ImageIcon className="mr-2 size-5" aria-hidden="true" />
                    {customerTexts.detail.noPhotos}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-5 border-gray-400 md:mt-6 md:border-t md:pt-5">
              <h3 className="text-label-14 uppercase tracking-[0.08em] text-gray-700">
                <span className="md:hidden">
                  {customerTexts.detail.historyTitleShort}
                </span>
                <span className="hidden md:inline">
                  {customerTexts.detail.historyTitle}
                </span>
              </h3>
              {!isLoading && !error && completedVisits.length === 0 ? (
                <p className="mt-4 text-copy-13 text-gray-700">
                  {customerTexts.detail.emptyVisits}
                </p>
              ) : null}
              {visibleVisits.length ? (
                <div className="mt-4 divide-y divide-gray-400">
                  {visibleVisits.map((visit) => (
                    <Link
                      key={visit.id}
                      href={ROUTES.visitDetail(visit.id)}
                      className="flex items-center gap-3 py-3 transition hover:bg-gray-300/60 md:py-4"
                    >
                      <span className="size-2 shrink-0 rounded-full bg-green-900" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-label-14 text-gray-1000">
                          {formatServices(visit.services)}
                        </p>
                        <p className="mt-0.5 truncate text-label-13 text-gray-700">
                          <span>{formatRelativeDate(visit.createdAt)}</span>
                          <span className="hidden md:inline">
                            {" "}
                            · {visit.barber?.username ?? customerTexts.detail.noStaff}
                          </span>
                          <span> · {formatMoney(visit.totalPrice)}</span>
                        </p>
                      </div>
                      <span className="hidden rounded-full border border-green-900/40 bg-green-100 px-3 py-1 text-label-12 text-green-900 md:inline-flex">
                        {customerTexts.detail.statusCompleted}
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-gray-700"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              ) : null}
              {visibleVisitCount < completedVisits.length ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4"
                  onClick={() =>
                    setVisibleVisitCount((current) => current + VISIT_HISTORY_LIMIT)
                  }
                >
                  {customerTexts.detail.viewMore}
                </Button>
              ) : null}
            </section>
          </div>

          <nav className="grid h-14 grid-cols-4 border-t border-gray-400 bg-gray-200 md:hidden">
            {[
              { icon: Clock, label: customerTexts.lookup.navToday },
              { icon: Search, label: customerTexts.lookup.navSearch, active: true },
              { icon: Plus, label: customerTexts.lookup.navCreate },
              { icon: BarChart3, label: customerTexts.lookup.navReports },
            ].map(({ active, icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-label-12",
                  active ? "text-gray-1000" : "text-gray-700",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-gray-1000/40 p-0 md:items-center md:justify-center md:p-6">
          <form
            onSubmit={handleUpdateCustomer}
            className="material-base w-full rounded-b-none p-5 md:max-w-md md:rounded-lg"
          >
            <div className="flex items-center justify-between border-b border-gray-400 pb-4">
              <h2 className="text-heading-20 text-gray-1000">
                {customerTexts.detail.editTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="flex size-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-200"
                aria-label={customerTexts.lookup.modalClose}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <FormTextField
                id="customer-name"
                label={customerTexts.lookup.nameLabel}
                value={name}
                required
                onChange={(event) => setName(event.target.value)}
              />
              <FormTextField
                id="customer-phone"
                label={customerTexts.lookup.phoneLabel}
                value={phone}
                required
                type="tel"
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            {formError ? <InlineAlert className="mt-4">{formError}</InlineAlert> : null}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
              >
                {customerTexts.lookup.cancelCreate}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isUpdatingCustomer}
              >
                {customerTexts.detail.submitUpdate}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-1000/80 p-4">
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-md bg-gray-100 text-gray-1000"
            aria-label={customerTexts.lookup.modalClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <img
            src={selectedPhoto.photoUrl}
            alt={customerTexts.detail.photosLabel}
            className="max-h-[85vh] max-w-full rounded-md object-contain"
          />
        </div>
      ) : null}
    </main>
  );
}
