import { visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import type { CustomerVisitStatus } from "@/types";

export function getVisitListStatusLabel(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return visitTexts.list.statuses.pending;
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return visitTexts.list.statuses.inProgress;
  }

  return visitTexts.list.statuses.completed;
}

export function getVisitListStatusClassName(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return "border-amber-900/40 bg-amber-100 text-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return "border-blue-900/40 bg-blue-100 text-blue-900";
  }

  return "border-green-900/40 bg-green-100 text-green-900";
}

export function formatVisitListDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
