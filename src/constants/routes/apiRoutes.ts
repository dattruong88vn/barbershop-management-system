export const API_ROUTES = {
  branches: "/api/branches",
  branchDetail: (id: string) => `/api/branches/${id}`,
  changePassword: "/api/change-password",
  services: "/api/services",
  serviceDetail: (id: string) => `/api/services/${id}`,
} as const;
