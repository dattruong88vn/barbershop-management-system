"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, PencilLine, ReceiptText } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { EmptyState } from "@/components/global/EmptyState";
import { ImageLightbox } from "@/components/global/ImageLightbox";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Skeleton } from "@/components/global/Skeleton";
import { visitTexts } from "@/constants/texts";
import { VISIT_STATUS_COMPLETED } from "@/constants/visitStatuses";
import { dispatchAppToast } from "@/lib/toast";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  VisitDetailViewProps,
} from "@/types";
import {
  VisitDetailMainSections,
  VisitDetailSidebar,
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
  isRefreshingDetail,
  onRefreshDetail,
}: {
  backHref: string;
  isRefreshingDetail: boolean;
  onRefreshDetail: () => Promise<void>;
}) {
  return (
    <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {visitTexts.detail.backToCustomers}
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-foreground md:text-2xl">
          {visitTexts.detail.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {visitTexts.detail.description}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        loading={isRefreshingDetail}
        className="w-full md:w-auto"
        onClick={onRefreshDetail}
      >
        <PencilLine className="size-4" aria-hidden="true" />
        {isRefreshingDetail
          ? visitTexts.detail.refreshingDetail
          : visitTexts.detail.refreshDetail}
      </Button>
    </header>
  );
}

export function VisitDetailView({
  barbers,
  backHref,
  combos = [],
  error,
  isDeletingPhoto = false,
  isLoading,
  isRefreshingDetail = false,
  isUpdatingDetail = false,
  isUploadingPhoto,
  isUpdatingStaff,
  isUpdatingStatus = false,
  onDeletePhoto,
  onRefreshDetail,
  onUpdateDetail,
  onUpdateError,
  onUploadPhoto,
  onUpdateStaff,
  onUpdateStatus,
  services = [],
  skinners,
  updateError,
  visit,
}: VisitDetailViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerVisitPhoto | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [uploadError, setUploadError] = useState("");

  async function handleUploadPhoto(file: File) {
    if (!visit) {
      return;
    }

    setUploadError("");

    try {
      await onUploadPhoto({
        file,
        visitId: visit.id,
      });
      dispatchAppToast({
        description: visitTexts.detail.uploadSuccessDescription,
        message: visitTexts.detail.uploadSuccess,
        type: "success",
      });
    } catch (photoUploadError) {
      setUploadError(
        photoUploadError instanceof Error
          ? photoUploadError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  async function handleDeletePhoto(photo: CustomerVisitPhoto) {
    if (!visit || !onDeletePhoto) {
      return;
    }

    setDeleteError("");

    try {
      await onDeletePhoto({
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
    } catch (photoDeleteError) {
      setDeleteError(
        photoDeleteError instanceof Error
          ? photoDeleteError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  async function handleRefreshDetail() {
    if (!onRefreshDetail) {
      return;
    }

    setRefreshError("");

    try {
      await onRefreshDetail();
      dispatchAppToast({
        description: visitTexts.detail.refreshSuccessDescription,
        message: visitTexts.detail.refreshSuccess,
        type: "success",
      });
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
          isRefreshingDetail={isRefreshingDetail}
          onRefreshDetail={handleRefreshDetail}
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
              canUploadPhotos={Boolean(visit.canUploadPhotos)}
              deleteError={deleteError}
              isDeletingPhoto={isDeletingPhoto}
              isUploadingPhoto={isUploadingPhoto}
              onDeletePhoto={handleDeletePhoto}
              uploadError={uploadError}
              visit={visit}
              onSelectPhoto={setSelectedPhoto}
              onUploadPhoto={handleUploadPhoto}
            />
            <VisitDetailSidebar
              barbers={barbers}
              combos={combos}
              isStaffEditable={canEditStaff(visit)}
              isUpdatingDetail={isUpdatingDetail}
              isUpdatingStaff={isUpdatingStaff}
              isUpdatingStatus={isUpdatingStatus}
              services={services}
              skinners={skinners}
              updateError={updateError}
              visit={visit}
              onUpdateError={onUpdateError}
              onUpdateDetail={onUpdateDetail}
              onUpdateStaff={onUpdateStaff}
              onUpdateStatus={onUpdateStatus}
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
    </main>
  );
}
