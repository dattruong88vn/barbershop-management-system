import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/common";
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
const DEFAULT_CUSTOMERS_QUERY_KEY = [
  ...CUSTOMERS_QUERY_KEY,
  "default",
  DEFAULT_PAGE,
] as const;
const CUSTOMER_DEFAULT_QUERY_STALE_TIME_MS = Infinity;
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
  const params = new URLSearchParams({
    page: DEFAULT_PAGE.toString(),
  });

  if (!searchTerm.trim()) {
    return `${API_ROUTES.customers}?${params.toString()}`;
  }

  params.set("search", searchTerm.trim());

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
  const defaultCustomersQuery = useQuery({
    queryKey: DEFAULT_CUSTOMERS_QUERY_KEY,
    queryFn: () => getCustomers(""),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: CUSTOMER_DEFAULT_QUERY_STALE_TIME_MS,
  });
  const searchCustomersQuery = useQuery({
    enabled: normalizedSearchTerm.length > 0,
    queryKey: [...CUSTOMERS_QUERY_KEY, "search", normalizedSearchTerm],
    queryFn: () => getCustomers(normalizedSearchTerm),
  });
  const customersQuery = normalizedSearchTerm
    ? searchCustomersQuery
    : defaultCustomersQuery;

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (customer) => {
      queryClient.setQueryData<Customer[]>(
        DEFAULT_CUSTOMERS_QUERY_KEY,
        (customers) => {
          if (!customers) {
            return customers;
          }

          return [customer, ...customers].slice(0, DEFAULT_PAGE_SIZE);
        },
      );
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMERS_QUERY_KEY, "search"],
      });
    },
  });

  return {
    customers: customersQuery.data ?? [],
    error: customersQuery.error,
    isCreating: createCustomerMutation.isPending,
    isLoading: customersQuery.isLoading,
    createCustomer: createCustomerMutation.mutateAsync,
  };
}
