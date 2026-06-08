"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
import { AlertTriangle, ImageIcon, Scissors, User } from "lucide-react";

import { visitTexts } from "@/constants/texts";
import {
  formatCustomerVisitServices,
  formatMoney,
  formatVisitTime,
  hasVisitPhotoWarning,
} from "@/lib/customerVisitDisplay";
import { cn } from "@/lib/utils";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  CustomerVisitService,
  CustomerVisitStatus,
  VisitDetailViewProps,
} from "@/types";
import { VisitStaffEditPanel } from "./VisitStaffEditPanel";
import { VisitSectionShell } from "./VisitSectionShell";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatVisitDateTime(value: string) {
  const date = new Date(value);

  return `${DATE_FORMATTER.format(date)} ${formatVisitTime(value)}`;
}

function getStatusLabel(status: CustomerVisitStatus) {
  if (status === "pending") {
    return visitTexts.detail.status.pending;
  }

  if (status === "in_progress") {
    return visitTexts.detail.status.inProgress;
  }

  return visitTexts.detail.status.completed;
}

function getStatusClassName(status: CustomerVisitStatus) {
  if (status === "pending") {
    return "border-amber-900/40 bg-amber-100 text-amber-900";
  }

  if (status === "in_progress") {
    return "border-blue-900/40 bg-blue-100 text-blue-900";
  }

  return "border-green-900/40 bg-green-100 text-green-900";
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function VisitInformationSection({ visit }: { visit: CustomerVisit }) {
  return (
    <VisitSectionShell title={visitTexts.detail.visitInfoTitle}>
      <div className="divide-y divide-border">
        <InfoRow
          label={visitTexts.detail.createdAtLabel}
          value={formatVisitDateTime(visit.createdAt)}
        />
        <InfoRow
          label={visitTexts.detail.completedAtLabel}
          value={
            visit.completedAt
              ? formatVisitDateTime(visit.completedAt)
              : visitTexts.detail.noCompletedAt
          }
        />
        <InfoRow
          label={visitTexts.detail.totalPriceLabel}
          value={formatMoney(visit.totalPrice)}
        />
        <InfoRow
          label={visitTexts.detail.lastUpdatedByLabel}
          value={visit.lastUpdatedBy ?? "-"}
        />
      </div>
    </VisitSectionShell>
  );
}

function ServiceList({
  emptyText,
  services,
}: {
  emptyText: string;
  services: CustomerVisitService[];
}) {
  if (!services.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between gap-4 px-3 py-3 text-sm"
        >
          <span className="min-w-0 truncate text-foreground">{service.name}</span>
          <span className="shrink-0 font-medium text-muted-foreground">
            {formatMoney(service.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

function VisitItemsSection({
  emptyText,
  services,
  title,
}: {
  emptyText: string;
  services: CustomerVisitService[];
  title: string;
}) {
  return (
    <VisitSectionShell title={title}>
      <ServiceList emptyText={emptyText} services={services} />
    </VisitSectionShell>
  );
}

function VisitPhotosSection({
  onSelectPhoto,
  photos,
}: {
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  photos: CustomerVisitPhoto[];
}) {
  return (
    <VisitSectionShell title={visitTexts.detail.photosTitle}>
      {photos.length ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelectPhoto(photo)}
              className="aspect-square overflow-hidden rounded-lg border border-border bg-background transition hover:border-ring"
            >
              <img
                src={photo.photoUrl}
                alt={visitTexts.detail.photosTitle}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          <ImageIcon className="mr-2 size-5" aria-hidden="true" />
          {visitTexts.detail.noPhotos}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {visitTexts.detail.uploadPending}
      </p>
    </VisitSectionShell>
  );
}

function VisitStatusSection({ visit }: { visit: CustomerVisit }) {
  return (
    <VisitSectionShell title={visitTexts.detail.statusTitle}>
      <div
        className={cn(
          "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
          getStatusClassName(visit.status),
        )}
      >
        {getStatusLabel(visit.status)}
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        {formatCustomerVisitServices(visit.services)}
      </p>
    </VisitSectionShell>
  );
}

function VisitStaffSection({
  icon,
  title,
  username,
}: {
  icon: "barber" | "skinner";
  title: string;
  username: string | null;
}) {
  const Icon = icon === "barber" ? User : Scissors;

  return (
    <VisitSectionShell title={title}>
      <div className="flex items-center gap-3 text-sm text-foreground">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        {username ?? visitTexts.detail.noStaff}
      </div>
    </VisitSectionShell>
  );
}

export function VisitDetailMainSections({
  onSelectPhoto,
  visit,
}: {
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  visit: CustomerVisit;
}) {
  const serviceItems = useMemo(
    () => visit.services.filter((service) => service.type === "service"),
    [visit.services],
  );
  const comboItems = useMemo(
    () => visit.services.filter((service) => service.type === "combo"),
    [visit.services],
  );
  const shouldWarnPhoto = hasVisitPhotoWarning(visit);

  return (
    <div className="space-y-4">
      {shouldWarnPhoto ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-100 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{visitTexts.detail.photoWarning}</span>
        </div>
      ) : null}

      <VisitInformationSection visit={visit} />
      <VisitItemsSection
        emptyText={visitTexts.detail.noServices}
        services={serviceItems}
        title={visitTexts.detail.servicesTitle}
      />
      <VisitItemsSection
        emptyText={visitTexts.detail.noCombos}
        services={comboItems}
        title={visitTexts.detail.combosTitle}
      />
      <VisitPhotosSection photos={visit.photos} onSelectPhoto={onSelectPhoto} />
    </div>
  );
}

export function VisitDetailSidebar({
  barbers,
  isStaffEditable,
  isUpdatingStaff,
  onUpdateError,
  onUpdateStaff,
  skinners,
  updateError,
  visit,
}: Omit<
  VisitDetailViewProps,
  "error" | "isLoading" | "visit"
> & {
  isStaffEditable: boolean;
  visit: CustomerVisit;
}) {
  return (
    <aside className="space-y-4">
      <VisitStatusSection visit={visit} />
      <VisitStaffSection
        icon="barber"
        title={visitTexts.detail.barberTitle}
        username={visit.barber?.username ?? null}
      />
      <VisitStaffSection
        icon="skinner"
        title={visitTexts.detail.skinnerTitle}
        username={visit.skinner?.username ?? null}
      />
      <VisitStaffEditPanel
        barbers={barbers}
        isStaffEditable={isStaffEditable}
        isUpdatingStaff={isUpdatingStaff}
        skinners={skinners}
        updateError={updateError}
        visit={visit}
        onError={onUpdateError}
        onUpdateStaff={onUpdateStaff}
      />
    </aside>
  );
}
