"use client";

import { use, useState } from "react";

import { VisitDetailView } from "@/components/visits/VisitDetailView";
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
    error,
    isLoading,
    isUploadingPhoto,
    isUpdatingStaff,
    uploadVisitPhoto,
    updateVisitStaff,
    visit,
  } = useVisitDetail(visitId);
  const { barbers, skinners } = useVisits();

  return (
    <VisitDetailView
      barbers={barbers}
      backHref={backHref}
      error={error}
      isLoading={isLoading}
      isUploadingPhoto={isUploadingPhoto}
      isUpdatingStaff={isUpdatingStaff}
      skinners={skinners}
      updateError={updateError}
      visit={visit}
      onUploadPhoto={uploadVisitPhoto}
      onUpdateError={setUpdateError}
      onUpdateStaff={updateVisitStaff}
    />
  );
}
