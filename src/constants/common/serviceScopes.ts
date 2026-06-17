export const SERVICE_SCOPE_SHOP = "shop" as const;
export const SERVICE_SCOPE_BRANCH = "branch" as const;

export const SERVICE_SCOPES = [
  SERVICE_SCOPE_SHOP,
  SERVICE_SCOPE_BRANCH,
] as const;

export type ServiceScopeValue = (typeof SERVICE_SCOPES)[number];
