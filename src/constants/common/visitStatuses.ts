export const VISIT_STATUS_PENDING = "pending";
export const VISIT_STATUS_IN_PROGRESS = "in_progress";
export const VISIT_STATUS_COMPLETED = "completed";

export const VISIT_STATUSES = [
  VISIT_STATUS_PENDING,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_COMPLETED,
] as const;

export type VisitStatusValue = (typeof VISIT_STATUSES)[number];
