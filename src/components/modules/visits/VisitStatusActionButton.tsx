"use client";

import { useState } from "react";
import { CheckCircle2, Play } from "lucide-react";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { visitTexts } from "@/constants/texts";
import { VISIT_STATUS_COMPLETED } from "@/constants/common";
import { dispatchAppToast } from "@/lib/toast";
import type { CustomerVisit, VisitStatusUpdateInput } from "@/types";
import { getMissingCompletionStaffMessage } from "@/utils/visits/visitDetail";
import { getVisitStatusAction } from "@/utils/visits/visitStatus";

export function VisitStatusActionButton({
  isUpdatingStatus,
  onCompletedVisit,
  onUpdateStatus,
  visit,
}: {
  isUpdatingStatus: boolean;
  onCompletedVisit?: () => void;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
  visit: CustomerVisit;
}) {
  const [statusError, setStatusError] = useState("");
  const action = getVisitStatusAction(visit);
  const missingCompletionStaffMessage =
    action?.status === VISIT_STATUS_COMPLETED
      ? getMissingCompletionStaffMessage(visit)
      : "";
  const visibleStatusError =
    statusError && missingCompletionStaffMessage !== ""
      ? statusError
      : action?.status === VISIT_STATUS_COMPLETED
        ? ""
        : statusError;

  async function handleUpdateStatus() {
    if (!action || !onUpdateStatus) {
      return;
    }

    setStatusError("");

    if (action.status === VISIT_STATUS_COMPLETED) {
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
        noHaircut: visit.noHaircut,
        noSkinnerService: visit.noSkinnerService,
        status: action.status,
        visitId: visit.id,
      });
      dispatchAppToast({
        description: visitTexts.detail.statusUpdateSuccessDescription,
        message: visitTexts.detail.statusUpdateSuccess,
        type: "success",
      });

      if (action.status === VISIT_STATUS_COMPLETED) {
        onCompletedVisit?.();
      }
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

  const StatusButtonIcon = action.isStartAction ? Play : CheckCircle2;

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
      {visibleStatusError ? (
        <InlineAlert className="mt-3">{visibleStatusError}</InlineAlert>
      ) : null}
    </div>
  );
}
