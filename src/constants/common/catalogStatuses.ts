export const CATALOG_STATUS_ACTIVE = "active" as const;
export const CATALOG_STATUS_DELETED = "deleted" as const;

export const CATALOG_STATUSES = [
  CATALOG_STATUS_ACTIVE,
  CATALOG_STATUS_DELETED,
] as const;

export type CatalogStatusValue = (typeof CATALOG_STATUSES)[number];

export function isCatalogStatus(value: unknown): value is CatalogStatusValue {
  return CATALOG_STATUSES.some((status) => status === value);
}
