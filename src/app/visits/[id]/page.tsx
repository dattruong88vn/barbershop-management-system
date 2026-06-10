"use client";

import { use, useState } from "react";

import { VisitDetailView } from "@/components/modules/visits/VisitDetailView";
import { ROUTES } from "@/constants/routes";
import { useVisitDetail } from "@/hooks/useVisitDetail";
import { useVisits } from "@/hooks/useVisits";

type VisitDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    returnToCustomerId?: string;
  }>;
};

export default function VisitDetailPage({
  params,
  searchParams,
}: VisitDetailPageProps) {
  const { id: visitId } = use(params);
  const { returnToCustomerId } = use(searchParams);
  const backHref = returnToCustomerId
    ? ROUTES.customerDetail(returnToCustomerId)
    : ROUTES.customers;
  const [updateError, setUpdateError] = useState("");
  const {
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
    updateVisitDetail,
    uploadVisitPhoto,
    updateVisitStaff,
    updateVisitStatus,
    visit,
  } = useVisitDetail(visitId);
  const { barbers, combos, services, skinners } = useVisits();

  return (
    <VisitDetailView
      barbers={barbers}
      backHref={backHref}
      combos={combos}
      error={error}
      isDeletingPhoto={isDeletingPhoto}
      isLoading={isLoading}
      isRefreshingDetail={isRefreshingDetail}
      isUpdatingDetail={isUpdatingDetail}
      isUploadingPhoto={isUploadingPhoto}
      isUpdatingStaff={isUpdatingStaff}
      isUpdatingStatus={isUpdatingStatus}
      services={services}
      skinners={skinners}
      updateError={updateError}
      visit={visit}
      onDeletePhoto={deleteVisitPhoto}
      onRefreshDetail={refreshVisitDetail}
      onUpdateDetail={(input) =>
        updateVisitDetail({
          ...input,
          customerId: returnToCustomerId ?? null,
        })
      }
      onUploadPhoto={uploadVisitPhoto}
      onUpdateError={setUpdateError}
      onUpdateStaff={updateVisitStaff}
      onUpdateStatus={(input) =>
        updateVisitStatus({
          ...input,
          customerId: returnToCustomerId ?? null,
        })
      }
    />
  );
}
