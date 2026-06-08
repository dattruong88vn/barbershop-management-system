import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  CustomerVisit,
  VisitDetailApiResponse,
  VisitStaffUpdateInput,
} from "@/types";

const VISIT_DETAIL_QUERY_KEY = "visit-detail";
const VISIT_RESPONSE_DATA_KEY = "visit";

function getVisitResponseData(result: VisitDetailApiResponse): CustomerVisit {
  if (
    !hasResponseData<typeof VISIT_RESPONSE_DATA_KEY, CustomerVisit>(
      result,
      VISIT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? visitTexts.detail.errors.generic);
  }

  return result.visit;
}

async function getVisitDetail(visitId: string): Promise<CustomerVisit> {
  const result = await fetchClient<VisitDetailApiResponse>(
    API_ROUTES.visitDetail(visitId),
  );

  return getVisitResponseData(result);
}

async function updateVisitStaff(
  input: VisitStaffUpdateInput,
): Promise<CustomerVisit> {
  const result = await fetchClient<VisitDetailApiResponse>(
    API_ROUTES.visitDetail(input.visitId),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        barberId: input.barberId,
        skinnerId: input.skinnerId,
      }),
    },
  );

  return getVisitResponseData(result);
}

export function useVisitDetail(visitId: string) {
  const queryClient = useQueryClient();
  const visitQuery = useQuery({
    enabled: Boolean(visitId),
    queryFn: () => getVisitDetail(visitId),
    queryKey: [VISIT_DETAIL_QUERY_KEY, visitId],
  });

  const updateVisitStaffMutation = useMutation({
    mutationFn: updateVisitStaff,
    onSuccess: (visit) =>
      queryClient.setQueryData([VISIT_DETAIL_QUERY_KEY, visit.id], visit),
  });

  return {
    error: visitQuery.error,
    isLoading: visitQuery.isLoading,
    isUpdatingStaff: updateVisitStaffMutation.isPending,
    visit: visitQuery.data ?? null,
    updateVisitStaff: updateVisitStaffMutation.mutateAsync,
  };
}
