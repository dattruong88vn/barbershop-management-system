export const API_ROUTES = {
  branches: "/api/branches",
  branchDetail: (id: string) => `/api/branches/${id}`,
  changePassword: "/api/change-password",
  combos: "/api/combos",
  comboDetail: (id: string) => `/api/combos/${id}`,
  customers: "/api/customers",
  customerDetail: (id: string) => `/api/customers/${id}`,
  services: "/api/services",
  serviceDetail: (id: string) => `/api/services/${id}`,
  staff: "/api/staff",
  staffDetail: (id: string) => `/api/staff/${id}`,
} as const;
