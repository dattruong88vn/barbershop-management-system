"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, PencilLine, ReceiptText, X } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { EmptyState } from "@/components/global/EmptyState";
import { ImageLightbox } from "@/components/global/ImageLightbox";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Skeleton } from "@/components/global/Skeleton";
import { visitTexts } from "@/constants/texts";
import { VISIT_STATUS_COMPLETED } from "@/constants/visitStatuses";
import { useVisitContext } from "@/context/VisitContext";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { dispatchAppToast } from "@/lib/toast";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  VisitContextValue,
  VisitStatusUpdateInput,
} from "@/types";
import {
  VisitDetailEditForm,
  VisitDetailMainSections,
  VisitDetailSidebar,
  VisitStatusActionButton,
} from "./VisitDetailSections";

const STAFF_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;

function canEditStaff(visit: CustomerVisit) {
  if (visit.status !== VISIT_STATUS_COMPLETED || !visit.completedAt) {
    return false;
  }

  return Date.now() <= new Date(visit.completedAt).getTime() + STAFF_EDIT_WINDOW_MS;
}

function VisitDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

function VisitDetailHeader({
  backHref,
  canEditDetail,
  isUpdatingStatus,
  onOpenEditDetail,
  onUpdateStatus,
  visit,
}: {
  backHref: string;
  canEditDetail: boolean;
  isUpdatingStatus: boolean;
  onOpenEditDetail: () => void;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
  visit: CustomerVisit | null;
}) {
  return (
    <header className="mb-4 flex flex-col gap-4 md:mb-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {visitTexts.detail.backToCustomers}
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">
            {visitTexts.detail.title}
          </h1>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {canEditDetail ? (
            <Button
              type="button"
              variant="primary"
              className="w-full md:w-auto"
              onClick={onOpenEditDetail}
            >
              <PencilLine className="size-4" aria-hidden="true" />
              {visitTexts.detail.editVisit}
            </Button>
          ) : null}
          {visit ? (
            <VisitStatusActionButton
              isUpdatingStatus={isUpdatingStatus}
              visit={visit}
              onUpdateStatus={onUpdateStatus}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

function VisitDetailEditModal({
  barbers,
  combos,
  isUpdatingDetail,
  isUpdatingStaff,
  onClose,
  onUpdateDetail,
  onUpdateStaff,
  open,
  services,
  skinners,
  visit,
}: {
  barbers: VisitContextValue["barbers"];
  combos: VisitContextValue["combos"];
  isUpdatingDetail: boolean;
  isUpdatingStaff: boolean;
  onClose: () => void;
  onUpdateDetail: VisitContextValue["updateVisitDetail"];
  onUpdateStaff: VisitContextValue["updateVisitStaff"];
  open: boolean;
  services: VisitContextValue["services"];
  skinners: VisitContextValue["skinners"];
  visit: CustomerVisit;
}) {
  useLockBodyScroll(open);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-4 md:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-4 shadow-lg md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground md:text-xl">
            {visitTexts.detail.editVisitTitle}
          </h2>
          <Button
            type="button"
            aria-label={visitTexts.detail.closeEditVisit}
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <VisitDetailEditForm
          barbers={barbers}
          combos={combos}
          isUpdatingDetail={isUpdatingDetail}
          isUpdatingStaff={isUpdatingStaff}
          services={services}
          skinners={skinners}
          visit={visit}
          onCancel={onClose}
          onUpdateDetail={onUpdateDetail}
          onUpdateStaff={onUpdateStaff}
        />
      </div>
    </div>
  );
}

export function VisitDetailView() {
  const {
    backHref,
    barbers,
    combos,
    deleteVisitPhoto,
    error,
    isDeletingPhoto,
    isLoading,
    isRefreshingDetail,
    isUpdatingDetail,
    isUploadingPhoto,
    isUpdatingStaff,
    isUpdatingStatus,
    refreshVisitDetail,
    services,
    skinners,
    updateVisitDetail,
    updateVisitStaff,
    updateVisitStatus,
    uploadVisitPhoto,
    visit,
  } = useVisitContext();
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerVisitPhoto | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");
  const [hasPendingPhotoRefresh, setHasPendingPhotoRefresh] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const canEditDetail =
    Boolean(visit) &&
    (visit?.status !== VISIT_STATUS_COMPLETED || canEditStaff(visit));
  const canManagePhotos =
    Boolean(visit?.canUploadPhotos) && visit?.status !== VISIT_STATUS_COMPLETED;

  async function handleUploadPhoto(file: File) {
    if (!visit || visit.status === VISIT_STATUS_COMPLETED) {
      return;
    }

    setUploadError("");

    try {
      await uploadVisitPhoto({
        file,
        visitId: visit.id,
      });
      dispatchAppToast({
        description: visitTexts.detail.uploadSuccessDescription,
        message: visitTexts.detail.uploadSuccess,
        type: "success",
      });
      setHasPendingPhotoRefresh(true);
    } catch (photoUploadError) {
      setUploadError(
        photoUploadError instanceof Error
          ? photoUploadError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  async function handleDeletePhoto(photo: CustomerVisitPhoto) {
    if (!visit || visit.status === VISIT_STATUS_COMPLETED) {
      return;
    }

    setDeleteError("");

    try {
      await deleteVisitPhoto({
        photoId: photo.id,
        visitId: visit.id,
      });
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
      }
      dispatchAppToast({
        description: visitTexts.detail.deleteSuccessDescription,
        message: visitTexts.detail.deleteSuccess,
        type: "success",
      });
      setHasPendingPhotoRefresh(true);
    } catch (photoDeleteError) {
      setDeleteError(
        photoDeleteError instanceof Error
          ? photoDeleteError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  async function handleRefreshDetail() {
    setRefreshError("");

    try {
      await refreshVisitDetail();
      dispatchAppToast({
        description: visitTexts.detail.refreshSuccessDescription,
        message: visitTexts.detail.refreshSuccess,
        type: "success",
      });
      setHasPendingPhotoRefresh(false);
    } catch (detailRefreshError) {
      setRefreshError(
        detailRefreshError instanceof Error
          ? detailRefreshError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-4 pb-8 text-foreground md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <VisitDetailHeader
          backHref={backHref}
          canEditDetail={canEditDetail}
          isUpdatingStatus={isUpdatingStatus}
          visit={visit}
          onOpenEditDetail={() => setIsEditingDetail(true)}
          onUpdateStatus={updateVisitStatus}
        />

        {refreshError ? (
          <InlineAlert className="mb-4">{refreshError}</InlineAlert>
        ) : null}

        {isLoading ? <VisitDetailSkeleton /> : null}

        {error ? (
          <InlineAlert>
            {error instanceof Error
              ? error.message
              : visitTexts.detail.errors.generic}
          </InlineAlert>
        ) : null}

        {!isLoading && !error && !visit ? (
          <EmptyState icon={ReceiptText} text={visitTexts.detail.errors.notFound} />
        ) : null}

        {visit ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <VisitDetailMainSections
              canUploadPhotos={canManagePhotos}
              deleteError={deleteError}
              hasPendingPhotoRefresh={hasPendingPhotoRefresh}
              isDeletingPhoto={isDeletingPhoto}
              isRefreshingDetail={isRefreshingDetail}
              isUploadingPhoto={isUploadingPhoto}
              onDeletePhoto={handleDeletePhoto}
              onRefreshDetail={handleRefreshDetail}
              uploadError={uploadError}
              visit={visit}
              onSelectPhoto={setSelectedPhoto}
              onUploadPhoto={handleUploadPhoto}
            />
            <VisitDetailSidebar
              visit={visit}
            />
          </div>
        ) : null}
      </div>

      <ImageLightbox
        alt={visitTexts.detail.photosTitle}
        closeLabel={visitTexts.detail.closeEditStaff}
        imageUrl={selectedPhoto?.photoUrl ?? null}
        onClose={() => setSelectedPhoto(null)}
      />

      {visit ? (
        <VisitDetailEditModal
          barbers={barbers}
          combos={combos}
          isUpdatingDetail={isUpdatingDetail}
          isUpdatingStaff={isUpdatingStaff}
          open={isEditingDetail}
          services={services}
          skinners={skinners}
          visit={visit}
          onClose={() => setIsEditingDetail(false)}
          onUpdateDetail={updateVisitDetail}
          onUpdateStaff={updateVisitStaff}
        />
      ) : null}
    </main>
  );
}
