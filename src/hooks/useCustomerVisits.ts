import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { fetchClient } from "@/lib/fetchClient";
import type {
  CustomerVisitHistory,
  CustomerVisitHistoryApiResponse,
} from "@/types";

const CUSTOMER_VISITS_QUERY_KEY = ["customer-visits"] as const;

async function getCustomerVisitHistory(
  customerId: string,
): Promise<CustomerVisitHistory> {
  return fetchClient<CustomerVisitHistoryApiResponse>(
    API_ROUTES.customerVisits(customerId),
  );
}

export function useCustomerVisits(customerId: string) {
  const customerVisitsQuery = useQuery({
    enabled: Boolean(customerId),
    queryKey: [...CUSTOMER_VISITS_QUERY_KEY, customerId],
    queryFn: () => getCustomerVisitHistory(customerId),
  });

  return {
    customer: customerVisitsQuery.data?.customer ?? null,
    error: customerVisitsQuery.error,
    isLoading: customerVisitsQuery.isLoading,
    suggestions: customerVisitsQuery.data?.suggestions ?? null,
    visits: customerVisitsQuery.data?.visits ?? [],
  };
}
