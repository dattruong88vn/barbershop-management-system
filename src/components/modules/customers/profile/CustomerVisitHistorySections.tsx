"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  EllipsisVertical,
  ImageIcon,
  Pencil,
  Phone,
  Plus,
  Repeat,
  Scissors,
  User,
  X,
} from "lucide-react";
import type { SyntheticEvent } from "react";

import {
  CustomerProfileSkeleton,
  CustomerSectionSkeleton,
} from "./CustomerProfileSkeleton";
import { FormTextField } from "@/components/global/FormTextField";
import { ImageLightbox } from "@/components/global/ImageLightbox";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import {
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/visitStatuses";
import { getCustomerInitials } from "@/lib/customerDisplay";
import {
  formatCustomerVisitServices,
  formatMoney,
  formatRelativeVisitDate,
  formatSuggestionStaffName,
  formatVisitTime,
} from "@/lib/customerVisitDisplay";
import { cn } from "@/lib/utils";
import type {
  CustomerProfileMetric,
  CustomerVisit,
  CustomerVisitPhoto,
  CustomerVisitStatus,
  CustomerVisitSuggestion,
} from "@/types";

function getVisitStatusLabel(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return customerTexts.detail.statusPending;
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return customerTexts.detail.statusInProgress;
  }

  return customerTexts.detail.statusCompleted;
}

function getVisitStatusClassName(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return "border-amber-900/40 bg-amber-100 text-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return "border-blue-900/40 bg-blue-100 text-blue-900";
  }

  return "border-green-900/40 bg-green-100 text-green-900";
}

export function CustomerProfileHeader({
  customerId,
  customerName,
  customerPhone,
  isMenuOpen,
  onEdit,
  onToggleMenu,
}: {
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  isMenuOpen: boolean;
  onEdit: () => void;
  onToggleMenu: () => void;
}) {
  const createVisitRoute =
    customerName && customerPhone
      ? ROUTES.createVisitForCustomer({
          id: customerId,
          name: customerName,
          phone: customerPhone,
        })
      : ROUTES.createVisit;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:h-14 md:px-5">
      <div className="hidden min-w-0 items-center gap-4 md:flex">
        <Link
          href={ROUTES.customers}
          className="flex items-center gap-3 text-sm text-muted-foreground transition hover:text-foreground"
          aria-label={customerTexts.detail.backToLookup}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {customerTexts.lookup.title}
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="truncate text-sm font-medium text-foreground">
          {customerName ?? customerTexts.detail.profileTitle}
        </span>
      </div>

      <Link
        href={ROUTES.customers}
        className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
        aria-label={customerTexts.detail.backToLookup}
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground md:hidden">
        {customerTexts.detail.profileTitle}
      </h1>

      <div className="hidden items-center gap-3 md:flex">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="h-9 rounded-lg border-border bg-background px-4 text-sm hover:bg-muted"
          onClick={onEdit}
        >
          <Pencil className="size-4" aria-hidden="true" />
          {customerTexts.detail.edit}
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="h-9 rounded-lg border-border bg-background px-4 text-sm hover:bg-muted"
        >
          <Link href={createVisitRoute}>
            <Plus className="size-4" aria-hidden="true" />
            {customerTexts.detail.createVisit}
          </Link>
        </Button>
      </div>

      <div className="relative ml-auto md:hidden">
        <button
          type="button"
          onClick={onToggleMenu}
          className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label={customerTexts.detail.editInfo}
        >
          <EllipsisVertical className="size-5" aria-hidden="true" />
        </button>
        {isMenuOpen ? (
          <div className="absolute right-0 top-11 z-30 min-w-40 rounded-lg border border-border bg-background p-1 shadow-lg">
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              <Pencil className="size-4" aria-hidden="true" />
              {customerTexts.detail.editInfo}
            </button>
            <Link
              href={createVisitRoute}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Plus className="size-4" aria-hidden="true" />
              {customerTexts.detail.createVisit}
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function ProfileSummarySection({
  completedVisitCount,
  displayName,
  displayPhone,
  isLoading,
  latestVisit,
  metrics,
  shouldWarnPhoto,
}: {
  completedVisitCount: number;
  displayName: string;
  displayPhone: string;
  isLoading: boolean;
  latestVisit: CustomerVisit | null;
  metrics: CustomerProfileMetric[];
  shouldWarnPhoto: boolean;
}) {
  if (isLoading) {
    return <CustomerProfileSkeleton />;
  }

  return (
    <section className="rounded-xl border border-border bg-background p-4 md:border-0 md:p-0">
      <div className="flex items-center gap-4 md:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-base font-medium text-foreground md:size-16 md:text-xl">
          {getCustomerInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground md:text-xl">
            {displayName}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
            <Phone className="hidden size-4 md:block" aria-hidden="true" />
            {displayPhone}
          </p>
          {latestVisit ? (
            <p className="mt-1 hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <Calendar className="size-4" aria-hidden="true" />
              {customerTexts.detail.lastVisitPrefix}:{" "}
              {formatRelativeVisitDate(latestVisit.createdAt)} ·{" "}
              {formatVisitTime(latestVisit.createdAt)}
            </p>
          ) : null}
          <div className="mt-3 hidden flex-wrap gap-2 md:flex">
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Repeat className="size-3.5" aria-hidden="true" />
              {customerTexts.detail.visitCountBadge(completedVisitCount)}
            </span>
            {shouldWarnPhoto ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-900/40 bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                <ImageIcon className="size-3.5" aria-hidden="true" />
                {customerTexts.lookup.noPhotoWarning}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 md:mt-6 md:gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.desktopLabel}
            className="rounded-lg bg-muted/50 px-2 py-3 text-center md:border md:border-border md:bg-background md:px-4 md:py-4"
          >
            <p className="text-base font-semibold text-foreground md:text-xl">
              <span className="md:hidden">
                {metric.mobileValue ?? metric.value}
              </span>
              <span className="hidden md:inline">{metric.value}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="md:hidden">{metric.mobileLabel}</span>
              <span className="hidden md:inline">{metric.desktopLabel}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SuggestionsSection({
  isLoading,
  suggestions,
}: {
  isLoading: boolean;
  suggestions: CustomerVisitSuggestion | null;
}) {
  if (isLoading) {
    return (
      <section className="mt-5 border-border md:mt-6 md:border-t md:pt-5">
        <CustomerSectionSkeleton itemCount={3} variant="chips" />
      </section>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <section className="mt-5 border-border md:mt-6 md:border-t md:pt-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="md:hidden">
          {customerTexts.detail.suggestionTitleShort}
        </span>
        <span className="hidden md:inline">
          {customerTexts.detail.suggestionTitle}
        </span>
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
          <Scissors className="size-4" aria-hidden="true" />
          {formatCustomerVisitServices(suggestions.services)}
        </span>
        {suggestions.barber ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
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
          <span className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:inline-flex">
            <User className="size-4" aria-hidden="true" />
            {customerTexts.detail.skinnerLabel}:{" "}
            {suggestions.skinner.username}
          </span>
        ) : null}
      </div>
    </section>
  );
}

export function PhotosSection({
  isLoading,
  onSelectPhoto,
  recentPhotos,
}: {
  isLoading: boolean;
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  recentPhotos: CustomerVisitPhoto[];
}) {
  return (
    <section className="mt-5 border-border md:mt-5 md:border-t md:pt-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="md:hidden">
          {customerTexts.detail.photosRecentTitleShort}
        </span>
        <span className="hidden md:inline">
          {customerTexts.detail.photosRecentTitle}
        </span>
      </h3>
      {isLoading ? (
        <CustomerSectionSkeleton itemCount={4} variant="photos" />
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
          {recentPhotos.length ? (
            <>
              {recentPhotos.slice(0, 3).map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onSelectPhoto(photo)}
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-background transition hover:border-ring"
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
                  onClick={() => onSelectPhoto(recentPhotos[3])}
                  className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-base font-semibold text-muted-foreground transition hover:border-ring hover:text-foreground"
                >
                  {customerTexts.detail.morePhotos(recentPhotos.length - 3)}
                </button>
              ) : null}
            </>
          ) : (
            <div className="col-span-3 flex aspect-[3/1] items-center justify-center rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground md:col-span-4 md:aspect-[4/1]">
              <ImageIcon className="mr-2 size-5" aria-hidden="true" />
              {customerTexts.detail.noPhotos}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function VisitHistorySection({
  customerId,
  error,
  isLoading,
  onShowMore,
  visitCount,
  visibleVisitCount,
  visibleVisits,
}: {
  customerId: string;
  error: unknown;
  isLoading: boolean;
  onShowMore: () => void;
  visitCount: number;
  visibleVisitCount: number;
  visibleVisits: CustomerVisit[];
}) {
  const shouldShowEmpty = !isLoading && !error && visitCount === 0;
  const shouldShowMore = visibleVisitCount < visitCount;

  return (
    <section className="mt-5 border-border md:mt-6 md:border-t md:pt-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="md:hidden">
          {customerTexts.detail.historyTitleShort}
        </span>
        <span className="hidden md:inline">
          {customerTexts.detail.historyTitle}
        </span>
      </h3>
      {isLoading ? (
        <CustomerSectionSkeleton itemCount={3} variant="rows" />
      ) : null}
      {shouldShowEmpty ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {customerTexts.detail.emptyVisits}
        </p>
      ) : null}
      {!isLoading && visibleVisits.length ? (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background md:border-0">
          {visibleVisits.map((visit) => (
            <Link
              key={visit.id}
              href={ROUTES.visitDetailFromCustomer(visit.id, customerId)}
              className="flex items-center gap-3 px-3 py-3 transition hover:bg-muted/60 md:px-0 md:py-4"
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full border",
                  getVisitStatusClassName(visit.status),
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {formatCustomerVisitServices(visit.services)}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <span>{formatRelativeVisitDate(visit.createdAt)}</span>
                  <span className="hidden md:inline">
                    {" "}
                    · {visit.barber?.username ?? customerTexts.detail.noStaff}
                  </span>
                  <span> · {formatMoney(visit.totalPrice)}</span>
                </p>
              </div>
              <span
                className={cn(
                  "hidden rounded-md border px-2 py-0.5 text-xs md:inline-flex",
                  getVisitStatusClassName(visit.status),
                )}
              >
                {getVisitStatusLabel(visit.status)}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      ) : null}
      {shouldShowMore ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={onShowMore}
        >
          {customerTexts.detail.viewMore}
        </Button>
      ) : null}
    </section>
  );
}

export function EditCustomerModal({
  error,
  isOpen,
  isUpdating,
  name,
  onClose,
  onNameChange,
  onPhoneChange,
  onSubmit,
  phone,
}: {
  error: string;
  isOpen: boolean;
  isUpdating: boolean;
  name: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  phone: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 p-0 md:items-center md:justify-center md:p-6">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-t-xl border border-border bg-background p-5 md:max-w-md md:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">
            {customerTexts.detail.editTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
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
            onChange={(event) => onNameChange(event.target.value)}
          />
          <FormTextField
            id="customer-phone"
            label={customerTexts.lookup.phoneLabel}
            value={phone}
            required
            type="tel"
            onChange={(event) => onPhoneChange(event.target.value)}
          />
        </div>

        {error ? <InlineAlert className="mt-4">{error}</InlineAlert> : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {customerTexts.lookup.cancelCreate}
          </Button>
          <Button type="submit" variant="primary" loading={isUpdating}>
            {customerTexts.detail.submitUpdate}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function PhotoLightbox({
  onClose,
  photo,
}: {
  onClose: () => void;
  photo: CustomerVisitPhoto | null;
}) {
  return (
    <ImageLightbox
      alt={customerTexts.detail.photosLabel}
      closeLabel={customerTexts.lookup.modalClose}
      imageUrl={photo?.photoUrl ?? null}
      onClose={onClose}
    />
  );
}
