"use client";

/* eslint-disable @next/next/no-img-element */

import type { ChangeEvent, SyntheticEvent } from "react";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  Play,
  Plus,
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
  formatMoney,
  formatVisitTime,
  hasVisitPhotoWarning,
} from "@/lib/customerVisitDisplay";
import { dispatchAppToast } from "@/lib/toast";
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

function getMissingCompletionStaffMessage(visit: CustomerVisit) {
  const isMissingBarber = !visit.barber && !visit.noHaircut;
  const isMissingSkinner = !visit.skinner && !visit.noSkinnerService;

  return isMissingBarber || isMissingSkinner
    ? visitTexts.api.errors.missingCompletionStaff
    : "";
}

function InfoRow({
  label,
  value,
  valueClassName = "font-medium",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`min-w-0 text-right text-foreground ${valueClassName}`}>
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
          label={visitTexts.detail.statusTitle}
          value={getStatusLabel(visit.status)}
        />
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
          valueClassName="text-base font-semibold"
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

function VisitItemsSection({ services }: { services: CustomerVisitService[] }) {
  return (
    <VisitSectionShell title={visitTexts.detail.servicesTitle}>
      <ServiceList emptyText={visitTexts.detail.noServices} services={services} />
    </VisitSectionShell>
  );
}

function VisitPhotosSection({
  canUploadPhotos,
  deleteError,
  hasPendingPhotoRefresh,
  isDeletingPhoto,
  isRefreshingDetail,
  isUploadingPhoto,
  onDeletePhoto,
  onRefreshDetail,
  onSelectPhoto,
  onUploadPhoto,
  photos,
  uploadError,
}: {
  canUploadPhotos: boolean;
  deleteError: string;
  hasPendingPhotoRefresh: boolean;
  isDeletingPhoto: boolean;
  isRefreshingDetail: boolean;
  isUploadingPhoto: boolean;
  onDeletePhoto?: (photo: CustomerVisitPhoto) => Promise<void>;
  onRefreshDetail?: () => Promise<void>;
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

  const refreshAction =
    hasPendingPhotoRefresh && onRefreshDetail ? (
      <Button
        type="button"
        loading={isRefreshingDetail}
        variant="primary"
        className="h-9 rounded-lg disabled:cursor-not-allowed"
        onClick={onRefreshDetail}
      >
        {isRefreshingDetail
          ? visitTexts.detail.refreshingDetail
          : visitTexts.detail.refreshDetail}
      </Button>
    ) : null;

  return (
    <VisitSectionShell action={refreshAction} title={visitTexts.detail.photosTitle}>
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
          {canUploadPhotos ? (
            <button
              type="button"
              aria-label={visitTexts.detail.uploadPhoto}
              title={
                isUploadingPhoto
                  ? visitTexts.detail.uploadingPhoto
                  : visitTexts.detail.uploadPhoto
              }
              disabled={isUploadingPhoto}
              onClick={handleOpenFilePicker}
              className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-6" aria-hidden="true" />
            </button>
          ) : null}
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

export function getVisitStatusAction(visit: CustomerVisit): {
  icon: typeof Play | typeof CheckCircle2;
  label: string;
  status: CustomerVisitStatus;
} | null {
  const nextStatus = visit.canStartVisit
    ? VISIT_STATUS_IN_PROGRESS
    : visit.canCompleteVisit
      ? VISIT_STATUS_COMPLETED
      : null;

  if (!nextStatus) {
    return null;
  }

  return {
    icon: visit.canStartVisit ? Play : CheckCircle2,
    label: visit.canStartVisit
      ? visitTexts.detail.startVisit
      : visitTexts.detail.completeVisit,
    status: nextStatus,
  };
}

export function VisitStatusActionButton({
  isUpdatingStatus,
  onUpdateStatus,
  visit,
}: {
  isUpdatingStatus: boolean;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
  visit: CustomerVisit;
}) {
  const [statusError, setStatusError] = useState("");
  const action = getVisitStatusAction(visit);

  async function handleUpdateStatus() {
    if (!action || !onUpdateStatus) {
      return;
    }

    setStatusError("");

    if (action.status === VISIT_STATUS_COMPLETED) {
      const missingCompletionStaffMessage = getMissingCompletionStaffMessage(visit);

      if (missingCompletionStaffMessage) {
        setStatusError(missingCompletionStaffMessage);
        dispatchAppToast({
          message: missingCompletionStaffMessage,
          type: "warning",
        });
        return;
      }
    }

    try {
      await onUpdateStatus({
        status: action.status,
        visitId: visit.id,
      });
      dispatchAppToast({
        description: visitTexts.detail.statusUpdateSuccessDescription,
        message: visitTexts.detail.statusUpdateSuccess,
        type: "success",
      });
    } catch (statusUpdateError) {
      const errorMessage =
        statusUpdateError instanceof Error
          ? statusUpdateError.message
          : visitTexts.detail.errors.generic;

      setStatusError(errorMessage);

      if (errorMessage === visitTexts.api.errors.missingCompletionStaff) {
        dispatchAppToast({
          message: errorMessage,
          type: "warning",
        });
      }
    }
  }

  if (!action) {
    return null;
  }

  const StatusButtonIcon = action.icon;

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        loading={isUpdatingStatus}
        className="w-full md:w-auto"
        onClick={handleUpdateStatus}
      >
        {isUpdatingStatus ? null : (
          <StatusButtonIcon className="size-4" aria-hidden="true" />
        )}
        {isUpdatingStatus ? visitTexts.detail.updatingStatus : action.label}
      </Button>
      {statusError ? (
        <InlineAlert className="mt-3">{statusError}</InlineAlert>
      ) : null}
    </div>
  );
}

function VisitStaffSection({ visit }: { visit: CustomerVisit }) {
  return (
    <VisitSectionShell title={visitTexts.detail.staffTitle}>
      <div className="space-y-3 text-sm text-foreground">
        <div className="flex items-center gap-3">
          <User className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">
            {visitTexts.detail.barberTitle}
          </span>
          <span className="font-medium">
            {visit.noHaircut
              ? visitTexts.create.noHaircutOption
              : visit.barber?.username ?? visitTexts.detail.noStaff}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Scissors className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">
            {visitTexts.detail.skinnerTitle}
          </span>
          <span className="font-medium">
            {visit.noSkinnerService
              ? visitTexts.create.noSkinnerServiceOption
              : visit.skinner?.username ?? visitTexts.detail.noStaff}
          </span>
        </div>
      </div>
    </VisitSectionShell>
  );
}

export function VisitDetailEditForm({
  barbers,
  combos,
  isUpdatingDetail,
  isUpdatingStaff,
  onCancel,
  onUpdateDetail,
  onUpdateStaff,
  services,
  skinners,
  visit,
}: {
  barbers: VisitCreateStaff[];
  combos: VisitCreateItem[];
  isUpdatingDetail: boolean;
  isUpdatingStaff: boolean;
  onCancel: () => void;
  onUpdateDetail: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  onUpdateStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
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
  const [noHaircut, setNoHaircut] = useState(Boolean(visit.noHaircut));
  const [skinnerId, setSkinnerId] = useState(visit.skinner?.id ?? "");
  const [noSkinnerService, setNoSkinnerService] = useState(
    Boolean(visit.noSkinnerService),
  );
  const [error, setError] = useState("");
  const isCompletedVisit = visit.status === VISIT_STATUS_COMPLETED;
  const isSubmitting = isCompletedVisit ? isUpdatingStaff : isUpdatingDetail;
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

    if (!isCompletedVisit && !selectedServiceIds.length && !selectedComboIds.length) {
      setError(visitTexts.create.errors.missingItems);
      return;
    }

    if (!isCompletedVisit && selectedServiceIds.length && selectedComboIds.length) {
      setError(visitTexts.create.errors.mixedItems);
      return;
    }

    try {
      if (isCompletedVisit) {
        await onUpdateStaff({
          barberId: noHaircut ? null : barberId || null,
          customerId: "",
          noHaircut,
          noSkinnerService,
          skinnerId: noSkinnerService ? null : skinnerId || null,
          visitId: visit.id,
        });
      } else {
        await onUpdateDetail({
          barberId: noHaircut ? null : barberId || null,
          comboIds: selectedComboIds,
          noHaircut,
          noSkinnerService,
          serviceIds: selectedServiceIds,
          skinnerId: noSkinnerService ? null : skinnerId || null,
          visitId: visit.id,
        });
      }
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
        disabled={isCompletedVisit}
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
        disabled={isCompletedVisit}
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
        isSkipped={noHaircut}
        label={visitTexts.create.barberLabel}
        skipOptionLabel={visitTexts.create.noHaircutOption}
        placeholder={visitTexts.create.barberPlaceholder}
        staff={barbers}
        value={barberId}
        onSkippedChange={(checked) => {
          setNoHaircut(checked);

          if (checked) {
            setBarberId("");
          }
        }}
        onValueChange={setBarberId}
      />

      <VisitCreateStaffSelect
        isSkipped={noSkinnerService}
        label={visitTexts.create.skinnerLabel}
        skipOptionLabel={visitTexts.create.noSkinnerServiceOption}
        placeholder={visitTexts.create.skinnerPlaceholder}
        staff={skinners}
        value={skinnerId}
        onSkippedChange={(checked) => {
          setNoSkinnerService(checked);

          if (checked) {
            setSkinnerId("");
          }
        }}
        onValueChange={setSkinnerId}
      />

      <p className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
        <span>{visitTexts.create.totalPriceLabel}</span>
        <span className="text-right text-base font-semibold">
          {PRICE_FORMATTER.format(totalPrice)}
        </span>
      </p>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {visitTexts.detail.closeEditVisit}
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {visitTexts.detail.saveEditVisit}
        </Button>
      </div>
    </form>
  );
}

export function VisitDetailMainSections({
  canUploadPhotos = false,
  deleteError = "",
  hasPendingPhotoRefresh = false,
  isDeletingPhoto = false,
  isRefreshingDetail = false,
  isUploadingPhoto = false,
  onDeletePhoto,
  onRefreshDetail,
  onSelectPhoto,
  onUploadPhoto = async () => undefined,
  uploadError = "",
  visit,
}: {
  canUploadPhotos?: boolean;
  deleteError?: string;
  hasPendingPhotoRefresh?: boolean;
  isDeletingPhoto?: boolean;
  isRefreshingDetail?: boolean;
  isUploadingPhoto?: boolean;
  onDeletePhoto?: (photo: CustomerVisitPhoto) => Promise<void>;
  onRefreshDetail?: () => Promise<void>;
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  onUploadPhoto?: (file: File) => Promise<void>;
  uploadError?: string;
  visit: CustomerVisit;
}) {
  const shouldWarnPhoto =
    visit.status !== VISIT_STATUS_PENDING && hasVisitPhotoWarning(visit);

  return (
    <div className="space-y-4">
      {shouldWarnPhoto ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-100 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{visitTexts.detail.photoWarning}</span>
        </div>
      ) : null}

      <VisitInformationSection visit={visit} />
      <VisitItemsSection services={visit.services} />
      {visit.status === VISIT_STATUS_IN_PROGRESS ? (
        <VisitPhotosSection
          canUploadPhotos={canUploadPhotos}
          deleteError={deleteError}
          hasPendingPhotoRefresh={hasPendingPhotoRefresh}
          isDeletingPhoto={isDeletingPhoto}
          isRefreshingDetail={isRefreshingDetail}
          isUploadingPhoto={isUploadingPhoto}
          onDeletePhoto={onDeletePhoto}
          onRefreshDetail={onRefreshDetail}
          photos={visit.photos}
          uploadError={uploadError}
          onSelectPhoto={onSelectPhoto}
          onUploadPhoto={onUploadPhoto}
        />
      ) : null}
    </div>
  );
}

export function VisitDetailSidebar({
  visit,
}: {
  visit: CustomerVisit;
}) {
  return (
    <aside className="space-y-4">
      <VisitStaffSection visit={visit} />
    </aside>
  );
}
