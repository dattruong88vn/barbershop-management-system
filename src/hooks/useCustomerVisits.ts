import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  CustomerUpdateApiResponse,
  CustomerUpdateInput,
  CustomerVisitHistoryCustomer,
  CustomerVisitHistory,
  CustomerVisitHistoryApiResponse,
} from "@/types";

const CUSTOMER_VISITS_QUERY_KEY = ["customer-visits"] as const;
const CUSTOMER_UPDATE_RESPONSE_DATA_KEY = "customer";

async function getCustomerVisitHistory(
  customerId: string,
): Promise<CustomerVisitHistory> {
  return fetchClient<CustomerVisitHistoryApiResponse>(
    API_ROUTES.customerVisits(customerId),
  );
}

function getCustomerUpdateResponseData(
  result: CustomerUpdateApiResponse,
): CustomerVisitHistoryCustomer {
  if (
    !hasResponseData<
      typeof CUSTOMER_UPDATE_RESPONSE_DATA_KEY,
      CustomerVisitHistoryCustomer
    >(result, CUSTOMER_UPDATE_RESPONSE_DATA_KEY)
  ) {
    throw new Error(result.error ?? customerTexts.detail.errors.generic);
  }

  return result.customer;
}

async function updateCustomer(
  input: CustomerUpdateInput,
): Promise<CustomerVisitHistoryCustomer> {
  const result = await fetchClient<CustomerUpdateApiResponse>(
    API_ROUTES.customerDetail(input.id),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        name: input.name,
        phone: input.phone,
      }),
    },
  );

  return getCustomerUpdateResponseData(result);
}

export function useCustomerVisits(customerId: string) {
  const queryClient = useQueryClient();
  const customerVisitsQuery = useQuery({
    enabled: Boolean(customerId),
    queryKey: [...CUSTOMER_VISITS_QUERY_KEY, customerId],
    queryFn: () => getCustomerVisitHistory(customerId),
  });
  const updateCustomerMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: (_customer, input) =>
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_VISITS_QUERY_KEY, input.id],
      }),
  });

  return {
    customer: customerVisitsQuery.data?.customer ?? null,
    error: customerVisitsQuery.error,
    isLoading: customerVisitsQuery.isLoading,
    isUpdatingCustomer: updateCustomerMutation.isPending,
    suggestions: customerVisitsQuery.data?.suggestions ?? null,
    visits: customerVisitsQuery.data?.visits ?? [],
    updateCustomer: updateCustomerMutation.mutateAsync,
  };
}
