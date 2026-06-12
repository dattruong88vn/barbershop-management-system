import { AlertTriangle } from "lucide-react";

import { visitTexts } from "@/constants/texts";
import { VISIT_STATUS_PENDING } from "@/constants/common";
import { hasVisitPhotoWarning } from "@/lib/customerVisitDisplay";
import type { CustomerVisit, CustomerVisitPhoto } from "@/types";
import { VisitInformationSection } from "./VisitInformationSection";
import { VisitItemsSection } from "./VisitItemsSection";
import { VisitPhotosSection } from "./VisitPhotosSection";

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
      {visit.status !== VISIT_STATUS_PENDING ? (
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
