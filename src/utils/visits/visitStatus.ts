import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
} from "@/constants/visitStatuses";
import type { CustomerVisit, CustomerVisitStatus } from "@/types";

export function getVisitStatusAction(visit: CustomerVisit): {
  isStartAction: boolean;
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
    isStartAction: Boolean(visit.canStartVisit),
    label: visit.canStartVisit
      ? visitTexts.detail.startVisit
      : visitTexts.detail.completeVisit,
    status: nextStatus,
  };
}
