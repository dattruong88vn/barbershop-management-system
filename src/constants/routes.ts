export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  visits: "/visits",
  visitDetail: (id: string) => `/visits/${id}`,
  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  reports: "/reports",
  ownerServices: "/owner/services",
  ownerCombos: "/owner/combos",
  ownerStaff: "/owner/staff",
  ownerBranches: "/owner/branches",
} as const;

export const API_ROUTES = {
  changePassword: "/api/change-password",
} as const;
