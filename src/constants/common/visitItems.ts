export const VISIT_ITEM_TYPE_SERVICE = "service" as const;
export const VISIT_ITEM_TYPE_COMBO = "combo" as const;

export const VISIT_ITEM_TYPES = [
  VISIT_ITEM_TYPE_SERVICE,
  VISIT_ITEM_TYPE_COMBO,
] as const;

export type VisitItemTypeValue = (typeof VISIT_ITEM_TYPES)[number];
