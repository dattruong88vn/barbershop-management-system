"use client";

import { useEffect, useState } from "react";
import { ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/global/EmptyState";
import { ImageLightbox } from "@/components/global/ImageLightbox";
import { InlineAlert } from "@/components/global/InlineAlert";
import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { VISIT_STATUS_COMPLETED } from "@/constants/common";
import { useVisitContext } from "@/context/VisitContext";
import { dispatchAppNavigation } from "@/lib/appNavigation";
import { dismissAppToast, dispatchAppToast } from "@/lib/toast";
import type { CustomerVisitPhoto } from "@/types";
import { canEditVisitStaff } from "@/utils/visits/visitDetail";
import { VisitDetailEditModal } from "./VisitDetailEditModal";
import { VisitDetailHeader } from "./VisitDetailHeader";
import { VisitDetailMainSections } from "./VisitDetailMainSections";
import { VisitDetailSidebar } from "./VisitDetailSidebar";
import { VisitDetailSkeleton } from "./VisitDetailSkeleton";

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
    returnToCustomerId,
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
    (visit?.status !== VISIT_STATUS_COMPLETED || canEditVisitStaff(visit));
  const canManagePhotos =
    Boolean(visit?.canUploadPhotos) && visit?.status !== VISIT_STATUS_COMPLETED;

  useEffect(() => {
    return () => {
      dismissAppToast();
    };
  }, []);

  function handleOpenEditDetail() {
    dismissAppToast();
    setIsEditingDetail(true);
  }

  function handleCompletedVisit() {
    const customerId = returnToCustomerId ?? visit?.customer?.id;

    if (customerId) {
      dispatchAppNavigation(ROUTES.customerDetail(customerId));
    }
  }

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
    <div className="min-h-screen bg-muted/30 px-4 py-4 pb-8 text-foreground md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <VisitDetailHeader
          backHref={backHref}
          canEditDetail={canEditDetail}
          isUpdatingStatus={isUpdatingStatus}
          visit={visit}
          onCompletedVisit={handleCompletedVisit}
          onOpenEditDetail={handleOpenEditDetail}
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
    </div>
  );
}
