export const API_ROUTES = {
  branches: "/api/branches",
  branchDetail: (id: string) => `/api/branches/${id}`,
  changePassword: "/api/change-password",
} as const;
