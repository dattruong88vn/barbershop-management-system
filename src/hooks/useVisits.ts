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
  VisitListApiResponse,
  VisitListStatusFilter,
  VisitCreateOptions,
  VisitCreateOptionsApiResponse,
  VisitStaffUpdateInput,
} from "@/types";

const VISIT_OPTIONS_QUERY_KEY = ["visit-options"] as const;
const VISIT_LIST_QUERY_KEY = ["visits"] as const;
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

type VisitListScope = "today";

type UseVisitsOptions = {
  scope?: VisitListScope;
};

async function getVisits(
  status: VisitListStatusFilter,
  options?: UseVisitsOptions,
): Promise<VisitListApiResponse> {
  const params = new URLSearchParams({ status });

  if (options?.scope) {
    params.set("scope", options.scope);
  }

  return fetchClient<VisitListApiResponse>(
    `${API_ROUTES.visits}?${params.toString()}`,
  );
}

async function createVisit(input: VisitCreateInput): Promise<CustomerVisit> {
  const result = await fetchClient<VisitApiResponse>(API_ROUTES.visits, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getVisitResponseData(result);
}

async function updateVisitStaff(
  input: VisitStaffUpdateInput,
): Promise<CustomerVisit> {
  const result = await fetchClient<VisitApiResponse>(
    API_ROUTES.visitDetail(input.visitId),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        barberId: input.barberId,
        noHaircut: input.noHaircut,
        noSkinnerService: input.noSkinnerService,
        skinnerId: input.skinnerId,
      }),
    },
  );

  return getVisitResponseData(result);
}

export function useVisits(
  status?: VisitListStatusFilter,
  options?: UseVisitsOptions,
) {
  const queryClient = useQueryClient();
  const visitOptionsQuery = useQuery({
    queryKey: VISIT_OPTIONS_QUERY_KEY,
    queryFn: getVisitOptions,
  });
  const visitsQuery = useQuery({
    enabled: Boolean(status),
    queryKey: [...VISIT_LIST_QUERY_KEY, status, options?.scope],
    queryFn: () => getVisits(status as VisitListStatusFilter, options),
  });

  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: (_visit, input) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_VISITS_QUERY_KEY, input.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: VISIT_LIST_QUERY_KEY,
      });
    },
  });
  const updateVisitStaffMutation = useMutation({
    mutationFn: updateVisitStaff,
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
    isUpdatingStaff: updateVisitStaffMutation.isPending,
    services: visitOptionsQuery.data?.services ?? [],
    skinners: visitOptionsQuery.data?.skinners ?? [],
    visits: visitsQuery.data?.visits ?? [],
    visitsError: visitsQuery.error,
    isLoadingVisits: visitsQuery.isLoading,
    createVisit: createVisitMutation.mutateAsync,
    updateVisitStaff: updateVisitStaffMutation.mutateAsync,
  };
}
