import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUSES,
  type VisitStatusValue,
} from "@/constants/common";
import type { CustomerVisit, CustomerVisitStatus } from "@/types";

export function isVisitStatus(value: unknown): value is VisitStatusValue {
  return (
    typeof value === "string" &&
    VISIT_STATUSES.includes(value as VisitStatusValue)
  );
}

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
