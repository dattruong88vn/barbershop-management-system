import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import type { CustomerVisitStatus } from "@/types";
import { formatDisplayDateTime } from "@/utils/common";

export function formatVisitDateTime(value: string) {
  return formatDisplayDateTime(value);
}

export function getVisitStatusLabel(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return visitTexts.detail.status.pending;
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return visitTexts.detail.status.inProgress;
  }

  return visitTexts.detail.status.completed;
}
