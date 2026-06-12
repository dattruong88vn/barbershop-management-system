import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import { formatVisitTime } from "@/lib/customerVisitDisplay";
import type { CustomerVisitStatus } from "@/types";

const VISIT_DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatVisitDateTime(value: string) {
  const date = new Date(value);

  return `${VISIT_DATE_FORMATTER.format(date)} ${formatVisitTime(value)}`;
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
