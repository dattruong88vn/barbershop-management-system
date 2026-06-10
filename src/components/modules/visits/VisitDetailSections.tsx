"use client";

/* eslint-disable @next/next/no-img-element */

import type { ChangeEvent, SyntheticEvent } from "react";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  Pencil,
  Play,
  Scissors,
  Upload,
  User,
  X,
} from "lucide-react";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import {
  VisitCreateItemSelector,
  VisitCreateStaffSelect,
} from "@/components/modules/customers/profile/VisitCreateFormFields";
import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/visitStatuses";
import {
  formatCustomerVisitServices,
  formatMoney,
  formatVisitTime,
  hasVisitPhotoWarning,
} from "@/lib/customerVisitDisplay";
import { dispatchAppToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  CustomerVisitService,
  CustomerVisitStatus,
  VisitCreateStaff,
  VisitCreateItem,
  VisitDetailUpdateInput,
  VisitStaffUpdateInput,
  VisitStatusUpdateInput,
} from "@/types";
import { VisitStaffEditPanel } from "./VisitStaffEditPanel";
import { VisitSectionShell } from "./VisitSectionShell";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

function calculateTotalPrice(
  selectedServiceIds: string[],
  selectedComboIds: string[],
  services: VisitCreateItem[],
  combos: VisitCreateItem[],
) {
  const selectedServicesTotal = services
    .filter((service) => selectedServiceIds.includes(service.id))
    .reduce((total, service) => total + service.price, 0);
  const selectedCombosTotal = combos
    .filter((combo) => selectedComboIds.includes(combo.id))
    .reduce((total, combo) => total + combo.price, 0);

  return selectedServicesTotal + selectedCombosTotal;
}

function getVisitItemIds(visit: CustomerVisit, type: "service" | "combo") {
  return visit.services
    .filter((service) => service.type === type && service.itemId)
    .map((service) => service.itemId as string);
}

function toggleId(selectedIds: string[], id: string) {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

function mergeVisitItems(
  items: VisitCreateItem[],
  visit: CustomerVisit,
  type: "service" | "combo",
) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  visit.services
    .filter((service) => service.type === type && service.itemId)
    .forEach((service) => {
      if (service.itemId && !itemMap.has(service.itemId)) {
        itemMap.set(service.itemId, {
          id: service.itemId,
          name: service.name,
          price: service.price,
        });
      }
    });

  return Array.from(itemMap.values());
}

function formatVisitDateTime(value: string) {
  const date = new Date(value);

  return `${DATE_FORMATTER.format(date)} ${formatVisitTime(value)}`;
}

function getStatusLabel(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return visitTexts.detail.status.pending;
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return visitTexts.detail.status.inProgress;
  }

  return visitTexts.detail.status.completed;
}

function getStatusClassName(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return "border-amber-900/40 bg-amber-100 text-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
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
  canUploadPhotos,
  deleteError,
  isDeletingPhoto,
  isUploadingPhoto,
  onDeletePhoto,
  onSelectPhoto,
  onUploadPhoto,
  photos,
  uploadError,
}: {
  canUploadPhotos: boolean;
  deleteError: string;
  isDeletingPhoto: boolean;
  isUploadingPhoto: boolean;
  onDeletePhoto?: (photo: CustomerVisitPhoto) => Promise<void>;
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  onUploadPhoto: (file: File) => Promise<void>;
  photos: CustomerVisitPhoto[];
  uploadError: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onUploadPhoto(file);
  }

  return (
    <VisitSectionShell title={visitTexts.detail.photosTitle}>
      {canUploadPhotos ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      ) : null}

      {canUploadPhotos && photos.length ? (
        <div className="mb-3">
          <Button
            type="button"
            disabled={isUploadingPhoto}
            variant="secondary"
            className="h-10 rounded-lg disabled:cursor-not-allowed"
            onClick={handleOpenFilePicker}
          >
            <Upload className="mr-2 size-4" aria-hidden="true" />
            {isUploadingPhoto
              ? visitTexts.detail.uploadingPhoto
              : visitTexts.detail.uploadPhoto}
          </Button>
        </div>
      ) : null}

      {uploadError || deleteError ? (
        <InlineAlert className="mb-3">{uploadError || deleteError}</InlineAlert>
      ) : null}

      {photos.length ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <button
                type="button"
                onClick={() => onSelectPhoto(photo)}
                className="size-full overflow-hidden rounded-lg border border-border bg-background transition hover:border-ring"
              >
                <img
                  src={photo.photoUrl}
                  alt={visitTexts.detail.photosTitle}
                  className="size-full object-cover"
                />
              </button>
              {canUploadPhotos && onDeletePhoto ? (
                <Button
                  type="button"
                  aria-label={visitTexts.detail.deletePhoto}
                  title={
                    isDeletingPhoto
                      ? visitTexts.detail.deletingPhoto
                      : visitTexts.detail.deletePhoto
                  }
                  disabled={isDeletingPhoto}
                  size="icon"
                  variant="secondary"
                  className="absolute right-1 top-1 size-7 rounded-full border border-border bg-background/90 text-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed"
                  onClick={() => onDeletePhoto(photo)}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : canUploadPhotos ? (
        <button
          type="button"
          disabled={isUploadingPhoto}
          onClick={handleOpenFilePicker}
          className="flex min-h-28 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="mr-2 size-5" aria-hidden="true" />
          {isUploadingPhoto
            ? visitTexts.detail.uploadingPhoto
            : visitTexts.detail.uploadPhoto}
        </button>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          <ImageIcon className="mr-2 size-5" aria-hidden="true" />
          {visitTexts.detail.noPhotos}
        </div>
      )}
    </VisitSectionShell>
  );
}

function VisitStatusSection({
  isUpdatingStatus,
  onUpdateStatus,
  visit,
}: {
  isUpdatingStatus: boolean;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
  visit: CustomerVisit;
}) {
  const [statusError, setStatusError] = useState("");
  const nextStatus = visit.canStartVisit
    ? VISIT_STATUS_IN_PROGRESS
    : visit.canCompleteVisit
      ? VISIT_STATUS_COMPLETED
      : null;
  const statusButtonText = visit.canStartVisit
    ? visitTexts.detail.startVisit
    : visit.canCompleteVisit
      ? visitTexts.detail.completeVisit
      : "";
  const StatusButtonIcon = visit.canStartVisit ? Play : CheckCircle2;

  async function handleUpdateStatus() {
    if (!nextStatus || !onUpdateStatus) {
      return;
    }

    setStatusError("");

    try {
      await onUpdateStatus({
        status: nextStatus,
        visitId: visit.id,
      });
      dispatchAppToast({
        description: visitTexts.detail.statusUpdateSuccessDescription,
        message: visitTexts.detail.statusUpdateSuccess,
        type: "success",
      });
    } catch (statusUpdateError) {
      setStatusError(
        statusUpdateError instanceof Error
          ? statusUpdateError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  return (
    <VisitSectionShell title={visitTexts.detail.statusTitle}>
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            "inline-flex rounded-md border px-2.5 py-1 text-xs font-medium",
            getStatusClassName(visit.status),
          )}
        >
          {getStatusLabel(visit.status)}
        </div>
        {nextStatus ? (
          <Button
            type="button"
            variant="secondary"
            loading={isUpdatingStatus}
            onClick={handleUpdateStatus}
          >
            {isUpdatingStatus ? null : (
              <StatusButtonIcon className="size-4" aria-hidden="true" />
            )}
            {isUpdatingStatus
              ? visitTexts.detail.updatingStatus
              : statusButtonText}
          </Button>
        ) : null}
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">
        {formatCustomerVisitServices(visit.services)}
      </p>
      {statusError ? (
        <InlineAlert className="mt-3">{statusError}</InlineAlert>
      ) : null}
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

function VisitDetailEditForm({
  barbers,
  combos,
  isUpdatingDetail,
  onCancel,
  onUpdateDetail,
  services,
  skinners,
  visit,
}: {
  barbers: VisitCreateStaff[];
  combos: VisitCreateItem[];
  isUpdatingDetail: boolean;
  onCancel: () => void;
  onUpdateDetail: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  services: VisitCreateItem[];
  skinners: VisitCreateStaff[];
  visit: CustomerVisit;
}) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() =>
    getVisitItemIds(visit, "service"),
  );
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>(() =>
    getVisitItemIds(visit, "combo"),
  );
  const [barberId, setBarberId] = useState(visit.barber?.id ?? "");
  const [skinnerId, setSkinnerId] = useState(visit.skinner?.id ?? "");
  const [error, setError] = useState("");
  const serviceOptions = useMemo(
    () => mergeVisitItems(services, visit, "service"),
    [services, visit],
  );
  const comboOptions = useMemo(
    () => mergeVisitItems(combos, visit, "combo"),
    [combos, visit],
  );
  const totalPrice = useMemo(
    () =>
      calculateTotalPrice(
        selectedServiceIds,
        selectedComboIds,
        serviceOptions,
        comboOptions,
      ),
    [comboOptions, selectedComboIds, selectedServiceIds, serviceOptions],
  );

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedServiceIds.length && !selectedComboIds.length) {
      setError(visitTexts.create.errors.missingItems);
      return;
    }

    if (selectedServiceIds.length && selectedComboIds.length) {
      setError(visitTexts.create.errors.mixedItems);
      return;
    }

    try {
      await onUpdateDetail({
        barberId: barberId || null,
        comboIds: selectedComboIds,
        serviceIds: selectedServiceIds,
        skinnerId: skinnerId || null,
        visitId: visit.id,
      });
      dispatchAppToast({
        description: visitTexts.detail.editSuccessDescription,
        message: visitTexts.detail.editSuccess,
        type: "success",
      });
      onCancel();
    } catch (detailUpdateError) {
      setError(
        detailUpdateError instanceof Error
          ? detailUpdateError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
      <VisitCreateItemSelector
        emptyText={visitTexts.create.emptyServices}
        items={serviceOptions}
        label={visitTexts.create.servicesLabel}
        selectedIds={selectedServiceIds}
        onToggleItem={(serviceId) => {
          setSelectedComboIds([]);
          setSelectedServiceIds((currentIds) => toggleId(currentIds, serviceId));
        }}
      />

      <VisitCreateItemSelector
        emptyText={visitTexts.create.emptyCombos}
        items={comboOptions}
        label={visitTexts.create.combosLabel}
        selectedIds={selectedComboIds}
        onToggleItem={(comboId) => {
          setSelectedServiceIds([]);
          setSelectedComboIds((currentIds) => toggleId(currentIds, comboId));
        }}
      />

      <VisitCreateStaffSelect
        label={visitTexts.create.barberLabel}
        noStaffOption={visitTexts.create.noStaffOption}
        staff={barbers}
        value={barberId}
        onChange={(event) => setBarberId(event.target.value)}
      />

      <VisitCreateStaffSelect
        label={visitTexts.create.skinnerLabel}
        noStaffOption={visitTexts.create.noStaffOption}
        staff={skinners}
        value={skinnerId}
        onChange={(event) => setSkinnerId(event.target.value)}
      />

      <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
        <span>{visitTexts.create.totalPriceLabel}</span>
        <span className="ml-2">{PRICE_FORMATTER.format(totalPrice)}</span>
      </p>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {visitTexts.detail.closeEditVisit}
        </Button>
        <Button type="submit" variant="primary" loading={isUpdatingDetail}>
          {visitTexts.detail.saveEditVisit}
        </Button>
      </div>
    </form>
  );
}

function VisitDetailEditPanel({
  barbers,
  combos,
  isUpdatingDetail,
  onUpdateDetail,
  services,
  skinners,
  visit,
}: {
  barbers: VisitCreateStaff[];
  combos: VisitCreateItem[];
  isUpdatingDetail: boolean;
  onUpdateDetail?: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  services: VisitCreateItem[];
  skinners: VisitCreateStaff[];
  visit: CustomerVisit;
}) {
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const isEditable = visit.status !== VISIT_STATUS_COMPLETED && Boolean(onUpdateDetail);

  return (
    <VisitSectionShell title={visitTexts.detail.editVisitTitle}>
      {isEditable ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setIsEditingDetail((current) => !current)}
        >
          {isEditingDetail ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Pencil className="size-4" aria-hidden="true" />
          )}
          {isEditingDetail
            ? visitTexts.detail.closeEditVisit
            : visitTexts.detail.editVisit}
        </Button>
      ) : (
        <InlineAlert className="border-amber-900/40 bg-amber-100 text-amber-900">
          {visitTexts.detail.lockedEditVisit}
        </InlineAlert>
      )}

      {isEditingDetail && onUpdateDetail ? (
        <VisitDetailEditForm
          barbers={barbers}
          combos={combos}
          isUpdatingDetail={isUpdatingDetail}
          services={services}
          skinners={skinners}
          visit={visit}
          onCancel={() => setIsEditingDetail(false)}
          onUpdateDetail={onUpdateDetail}
        />
      ) : null}
    </VisitSectionShell>
  );
}

export function VisitDetailMainSections({
  canUploadPhotos = false,
  deleteError = "",
  isDeletingPhoto = false,
  isUploadingPhoto = false,
  onDeletePhoto,
  onSelectPhoto,
  onUploadPhoto = async () => undefined,
  uploadError = "",
  visit,
}: {
  canUploadPhotos?: boolean;
  deleteError?: string;
  isDeletingPhoto?: boolean;
  isUploadingPhoto?: boolean;
  onDeletePhoto?: (photo: CustomerVisitPhoto) => Promise<void>;
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  onUploadPhoto?: (file: File) => Promise<void>;
  uploadError?: string;
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
      <VisitPhotosSection
        canUploadPhotos={canUploadPhotos}
        deleteError={deleteError}
        isDeletingPhoto={isDeletingPhoto}
        isUploadingPhoto={isUploadingPhoto}
        onDeletePhoto={onDeletePhoto}
        photos={visit.photos}
        uploadError={uploadError}
        onSelectPhoto={onSelectPhoto}
        onUploadPhoto={onUploadPhoto}
      />
    </div>
  );
}

export function VisitDetailSidebar({
  barbers,
  combos = [],
  isStaffEditable,
  isUpdatingDetail = false,
  isUpdatingStaff,
  isUpdatingStatus = false,
  onUpdateDetail,
  onUpdateError,
  onUpdateStaff,
  onUpdateStatus,
  services = [],
  skinners,
  updateError,
  visit,
}: {
  barbers: VisitCreateStaff[];
  combos?: VisitCreateItem[];
  isStaffEditable: boolean;
  isUpdatingDetail?: boolean;
  isUpdatingStaff: boolean;
  isUpdatingStatus?: boolean;
  services?: VisitCreateItem[];
  skinners: VisitCreateStaff[];
  updateError: string;
  visit: CustomerVisit;
  onUpdateDetail?: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  onUpdateError: (error: string) => void;
  onUpdateStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
}) {
  return (
    <aside className="space-y-4">
      <VisitStatusSection
        isUpdatingStatus={isUpdatingStatus}
        visit={visit}
        onUpdateStatus={onUpdateStatus}
      />
      <VisitDetailEditPanel
        barbers={barbers}
        combos={combos}
        isUpdatingDetail={isUpdatingDetail}
        services={services}
        skinners={skinners}
        visit={visit}
        onUpdateDetail={onUpdateDetail}
      />
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
