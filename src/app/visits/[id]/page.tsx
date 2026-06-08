"use client";

import { use, useState } from "react";

import { VisitDetailView } from "@/components/visits/VisitDetailView";
import { useVisitDetail } from "@/hooks/useVisitDetail";
import { useVisits } from "@/hooks/useVisits";

type VisitDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function VisitDetailPage({ params }: VisitDetailPageProps) {
  const { id: visitId } = use(params);
  const [updateError, setUpdateError] = useState("");
  const {
    error,
    isLoading,
    isUpdatingStaff,
    updateVisitStaff,
    visit,
  } = useVisitDetail(visitId);
  const { barbers, skinners } = useVisits();

  return (
    <VisitDetailView
      barbers={barbers}
      error={error}
      isLoading={isLoading}
      isUpdatingStaff={isUpdatingStaff}
      skinners={skinners}
      updateError={updateError}
      visit={visit}
      onUpdateError={setUpdateError}
      onUpdateStaff={updateVisitStaff}
    />
  );
}
