export const VISIT_CREATE_ORIGIN_CUSTOMER = "customer";
export const VISIT_CREATE_ORIGIN_VISITS = "visits";

export const VISIT_CREATE_ORIGINS = [
  VISIT_CREATE_ORIGIN_CUSTOMER,
  VISIT_CREATE_ORIGIN_VISITS,
] as const;

export type VisitCreateOriginValue = (typeof VISIT_CREATE_ORIGINS)[number];
