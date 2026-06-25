export const API_ROUTES = {
  branches: "/api/branches",
  branchDetail: (id: string) => `/api/branches/${id}`,
  branchManagers: (search = "") => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const query = params.toString();
    return query ? `/api/managers?${query}` : "/api/managers";
  },
  changePassword: "/api/change-password",
  combos: ({ status }: { status?: string } = {}) => {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    const query = params.toString();

    return query ? `/api/combos?${query}` : "/api/combos";
  },
  comboDetail: (id: string) => `/api/combos/${id}`,
  customers: "/api/customers",
  customerDetail: (id: string) => `/api/customers/${id}`,
  customerVisits: (id: string) => `/api/customers/${id}/visits`,
  dashboard: ({
    branchId,
    month,
    period,
  }: {
    branchId?: string;
    month?: string;
    period: string;
  }) => {
    const params = new URLSearchParams({ period });

    if (branchId) {
      params.set("branchId", branchId);
    }

    if (month) {
      params.set("month", month);
    }

    return `/api/dashboard?${params.toString()}`;
  },
  locationProvinces: "/api/locations/provinces",
  locationWards: (provinceCode: string) => {
    const params = new URLSearchParams({ provinceCode });
    return `/api/locations/wards?${params.toString()}`;
  },
  personalReport: ({ month, period }: { month?: string; period: string }) => {
    const params = new URLSearchParams({ period });

    if (month) {
      params.set("month", month);
    }

    return `/api/reports/personal?${params.toString()}`;
  },
  staffReport: ({
    branchId,
    fromDate,
    role,
    search,
    toDate,
  }: {
    branchId?: string;
    fromDate: string;
    role?: string;
    search?: string;
    toDate: string;
  }) => {
    const params = new URLSearchParams({ fromDate, toDate });

    if (branchId) {
      params.set("branchId", branchId);
    }
    if (role) params.set("role", role);
    if (search) params.set("search", search);

    return `/api/reports/staff?${params.toString()}`;
  },
  staffReportDetails: ({
    branchId,
    fromDate,
    page,
    pageSize,
    role,
    search,
    staffId,
    toDate,
  }: {
    branchId?: string;
    fromDate: string;
    page: number;
    pageSize: number;
    role?: string;
    search?: string;
    staffId: string;
    toDate: string;
  }) => {
    const params = new URLSearchParams({
      fromDate,
      page: String(page),
      pageSize: String(pageSize),
      staffId,
      toDate,
    });

    if (branchId) {
      params.set("branchId", branchId);
    }
    if (role) params.set("role", role);
    if (search) params.set("search", search);

    return `/api/reports/staff/details?${params.toString()}`;
  },
  services: ({ status }: { status?: string } = {}) => {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    const query = params.toString();

    return query ? `/api/services?${query}` : "/api/services";
  },
  serviceDetail: (id: string) => `/api/services/${id}`,
  staff: "/api/staff",
  staffDetail: (id: string) => `/api/staff/${id}`,
  staffTransfer: "/api/staff/transfer",
  staffIdentityUpload: "/api/staff/identity-upload",
  staffIdentityImage: (id: string, side: "front" | "back") =>
    `/api/staff/${id}/identity-image?side=${side}`,
  branchStatus: (id: string) => `/api/branches/${id}/status`,
  uploadPresigned: "/api/upload/presigned",
  visits: "/api/visits",
  visitDetail: (id: string) => `/api/visits/${id}`,
  visitPhotos: (id: string) => `/api/visits/${id}/photos`,
  visitPhotoDetail: (visitId: string, photoId: string) =>
    `/api/visits/${visitId}/photos?photoId=${photoId}`,
} as const;
