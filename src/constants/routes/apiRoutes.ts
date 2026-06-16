export const API_ROUTES = {
  branches: "/api/branches",
  branchDetail: (id: string) => `/api/branches/${id}`,
  changePassword: "/api/change-password",
  combos: "/api/combos",
  comboDetail: (id: string) => `/api/combos/${id}`,
  customers: "/api/customers",
  customerDetail: (id: string) => `/api/customers/${id}`,
  customerVisits: (id: string) => `/api/customers/${id}/visits`,
  dashboard: ({ month, period }: { month?: string; period: string }) => {
    const params = new URLSearchParams({ period });

    if (month) {
      params.set("month", month);
    }

    return `/api/dashboard?${params.toString()}`;
  },
  personalReport: ({ month, period }: { month?: string; period: string }) => {
    const params = new URLSearchParams({ period });

    if (month) {
      params.set("month", month);
    }

    return `/api/reports/personal?${params.toString()}`;
  },
  services: "/api/services",
  serviceDetail: (id: string) => `/api/services/${id}`,
  staff: "/api/staff",
  staffDetail: (id: string) => `/api/staff/${id}`,
  uploadPresigned: "/api/upload/presigned",
  visits: "/api/visits",
  visitDetail: (id: string) => `/api/visits/${id}`,
  visitPhotos: (id: string) => `/api/visits/${id}/photos`,
  visitPhotoDetail: (visitId: string, photoId: string) =>
    `/api/visits/${visitId}/photos?photoId=${photoId}`,
} as const;
