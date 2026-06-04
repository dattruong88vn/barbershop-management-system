import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  CustomerVisit,
  VisitApiResponse,
  VisitCreateInput,
  VisitCreateOptions,
  VisitCreateOptionsApiResponse,
} from "@/types";

const VISIT_OPTIONS_QUERY_KEY = ["visit-options"] as const;
const CUSTOMER_VISITS_QUERY_KEY = ["customer-visits"] as const;
const VISIT_RESPONSE_DATA_KEY = "visit";

function getVisitResponseData(result: VisitApiResponse): CustomerVisit {
  if (
    !hasResponseData<typeof VISIT_RESPONSE_DATA_KEY, CustomerVisit>(
      result,
      VISIT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? visitTexts.create.errors.generic);
  }

  return result.visit;
}

async function getVisitOptions(): Promise<VisitCreateOptions> {
  return fetchClient<VisitCreateOptionsApiResponse>(API_ROUTES.visits);
}

async function createVisit(input: VisitCreateInput): Promise<CustomerVisit> {
  const result = await fetchClient<VisitApiResponse>(API_ROUTES.visits, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getVisitResponseData(result);
}

export function useVisits() {
  const queryClient = useQueryClient();
  const visitOptionsQuery = useQuery({
    queryKey: VISIT_OPTIONS_QUERY_KEY,
    queryFn: getVisitOptions,
  });

  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: (_visit, input) =>
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_VISITS_QUERY_KEY, input.customerId],
      }),
  });

  return {
    barbers: visitOptionsQuery.data?.barbers ?? [],
    combos: visitOptionsQuery.data?.combos ?? [],
    error: visitOptionsQuery.error,
    isCreating: createVisitMutation.isPending,
    isLoadingOptions: visitOptionsQuery.isLoading,
    services: visitOptionsQuery.data?.services ?? [],
    skinners: visitOptionsQuery.data?.skinners ?? [],
    createVisit: createVisitMutation.mutateAsync,
  };
}
