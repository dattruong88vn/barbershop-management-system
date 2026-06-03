export const API_ROUTES = {
  branches: "/api/branches",
  branchDetail: (id: string) => `/api/branches/${id}`,
  changePassword: "/api/change-password",
  combos: "/api/combos",
  comboDetail: (id: string) => `/api/combos/${id}`,
  services: "/api/services",
  serviceDetail: (id: string) => `/api/services/${id}`,
} as const;
