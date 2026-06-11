import { customerTexts } from "@/constants/texts";
import {
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/visitStatuses";
import type { CustomerVisitStatus } from "@/types";

export function getCustomerVisitStatusLabel(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return customerTexts.detail.statusPending;
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return customerTexts.detail.statusInProgress;
  }

  return customerTexts.detail.statusCompleted;
}

export function getCustomerVisitStatusClassName(status: CustomerVisitStatus) {
  if (status === VISIT_STATUS_PENDING) {
    return "border-amber-900/40 bg-amber-100 text-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return "border-blue-900/40 bg-blue-100 text-blue-900";
  }

  return "border-green-900/40 bg-green-100 text-green-900";
}

export function getCustomerVisitStatusTextClassName(
  status: CustomerVisitStatus,
) {
  if (status === VISIT_STATUS_PENDING) {
    return "text-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return "text-blue-900";
  }

  return "text-green-900";
}

export function getCustomerVisitStatusIconClassName(
  status: CustomerVisitStatus,
) {
  if (status === VISIT_STATUS_PENDING) {
    return "bg-amber-900";
  }

  if (status === VISIT_STATUS_IN_PROGRESS) {
    return "bg-blue-900";
  }

  return "bg-green-900";
}
