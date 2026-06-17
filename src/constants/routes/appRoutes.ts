import {
  VISIT_CREATE_ORIGIN_CUSTOMER,
  VISIT_CREATE_ORIGIN_VISITS,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
  type VisitItemTypeValue,
} from "@/constants/common";

export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  designSystem: "/design-system",
  notFound: "/not-found",
  visits: "/visits",
  createVisit: "/visits/create",
  createVisitFromVisits: () => {
    const params = new URLSearchParams({
      origin: VISIT_CREATE_ORIGIN_VISITS,
    });

    return `/visits/create?${params.toString()}`;
  },
  createVisitForCustomer: (customer: { id: string; name: string; phone: string }) => {
    const params = new URLSearchParams({
      customerId: customer.id,
      name: customer.name,
      origin: VISIT_CREATE_ORIGIN_CUSTOMER,
      phone: customer.phone,
      returnToCustomerId: customer.id,
    });

    return `/visits/create?${params.toString()}`;
  },
  createVisitFromVisit: (visit: {
    barber: { id: string } | null;
    customer: { id: string; name: string; phone: string };
    services: Array<{ itemId: string | null; type: VisitItemTypeValue }>;
    skinner: { id: string } | null;
  }) => {
    const serviceIds = visit.services
      .filter(
        (service) =>
          service.type === VISIT_ITEM_TYPE_SERVICE && service.itemId,
      )
      .map((service) => service.itemId as string);
    const comboIds = visit.services
      .filter(
        (service) => service.type === VISIT_ITEM_TYPE_COMBO && service.itemId,
      )
      .map((service) => service.itemId as string);
    const params = new URLSearchParams({
      customerId: visit.customer.id,
      name: visit.customer.name,
      origin: VISIT_CREATE_ORIGIN_CUSTOMER,
      phone: visit.customer.phone,
      returnToCustomerId: visit.customer.id,
    });

    if (serviceIds.length) {
      params.set("serviceIds", serviceIds.join(","));
    }

    if (comboIds.length) {
      params.set("comboIds", comboIds.join(","));
    }

    if (visit.barber?.id) {
      params.set("barberId", visit.barber.id);
    }

    if (visit.skinner?.id) {
      params.set("skinnerId", visit.skinner.id);
    }

    return `/visits/create?${params.toString()}`;
  },
  visitDetail: (id: string) => `/visits/${id}`,
  visitDetailFromCustomer: (visitId: string, customerId: string) => {
    const params = new URLSearchParams({
      returnToCustomerId: customerId,
    });

    return `/visits/${visitId}?${params.toString()}`;
  },
  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  reports: "/reports",
  reportRevenue: "/reports/revenue",
  reportStaff: "/reports/staff",
  reportServices: "/reports/services",
  reportCombos: "/reports/combos",
  reportBranches: "/reports/branches",
  ownerServices: "/owner/services",
  ownerCombos: "/owner/combos",
  ownerStaff: "/owner/staff",
  ownerBranches: "/owner/branches",
  managerServices: "/manager/services",
  managerCombos: "/manager/combos",
  managerStaff: "/manager/staff",
} as const;
