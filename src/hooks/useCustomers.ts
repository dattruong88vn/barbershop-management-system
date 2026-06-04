import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Customer,
  CustomerApiResponse,
  CustomerFormInput,
  CustomerListApiResponse,
} from "@/types";

const CUSTOMERS_QUERY_KEY = ["customers"] as const;
const CUSTOMER_RESPONSE_DATA_KEY = "customer";

function getCustomerResponseData(result: CustomerApiResponse): Customer {
  if (
    !hasResponseData<typeof CUSTOMER_RESPONSE_DATA_KEY, Customer>(
      result,
      CUSTOMER_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? customerTexts.lookup.errors.generic);
  }

  return result.customer;
}

function buildCustomersSearchUrl(searchTerm: string): string {
  const params = new URLSearchParams({ search: searchTerm.trim() });

  return `${API_ROUTES.customers}?${params.toString()}`;
}

async function getCustomers(searchTerm: string): Promise<Customer[]> {
  const result = await fetchClient<CustomerListApiResponse>(
    buildCustomersSearchUrl(searchTerm),
  );

  return result.customers;
}

async function createCustomer(input: CustomerFormInput): Promise<Customer> {
  const result = await fetchClient<CustomerApiResponse>(API_ROUTES.customers, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getCustomerResponseData(result);
}

export function useCustomers(searchTerm: string) {
  const queryClient = useQueryClient();
  const normalizedSearchTerm = searchTerm.trim();
  const customersQuery = useQuery({
    enabled: normalizedSearchTerm.length > 0,
    queryKey: [...CUSTOMERS_QUERY_KEY, normalizedSearchTerm],
    queryFn: () => getCustomers(normalizedSearchTerm),
  });

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY }),
  });

  return {
    customers: customersQuery.data ?? [],
    error: customersQuery.error,
    isCreating: createCustomerMutation.isPending,
    isLoading: customersQuery.isLoading,
    createCustomer: createCustomerMutation.mutateAsync,
  };
}
