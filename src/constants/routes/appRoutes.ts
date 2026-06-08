export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  notFound: "/not-found",
  visits: "/visits",
  createVisit: "/visits/create",
  createVisitForCustomer: (customer: { id: string; name: string; phone: string }) => {
    const params = new URLSearchParams({
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
    });

    return `/visits/create?${params.toString()}`;
  },
  visitDetail: (id: string) => `/visits/${id}`,
  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  reports: "/reports",
  ownerServices: "/owner/services",
  ownerCombos: "/owner/combos",
  ownerStaff: "/owner/staff",
  ownerBranches: "/owner/branches",
} as const;
