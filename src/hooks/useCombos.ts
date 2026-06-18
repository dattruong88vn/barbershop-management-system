import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CATALOG_STATUS_ACTIVE,
  type CatalogStatusValue,
} from "@/constants/common";
import { API_ROUTES } from "@/constants/routes";
import { comboTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Combo,
  ComboApiResponse,
  ComboFormInput,
  ComboListApiResponse,
} from "@/types";

const COMBOS_QUERY_KEY = ["combos"] as const;
const COMBO_RESPONSE_DATA_KEY = "combo";

function getComboResponseData(result: ComboApiResponse): Combo {
  if (
    !hasResponseData<typeof COMBO_RESPONSE_DATA_KEY, Combo>(
      result,
      COMBO_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? comboTexts.ownerCombos.errors.generic);
  }

  return result.combo;
}

async function getCombos(status: CatalogStatusValue): Promise<Combo[]> {
  const result = await fetchClient<ComboListApiResponse>(
    API_ROUTES.combos({ status }),
  );

  return result.combos;
}

async function createCombo(input: ComboFormInput): Promise<Combo> {
  const result = await fetchClient<ComboApiResponse>(API_ROUTES.combos(), {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getComboResponseData(result);
}

async function updateCombo(input: ComboFormInput & { id: string }) {
  const result = await fetchClient<ComboApiResponse>(
    API_ROUTES.comboDetail(input.id),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        price: input.price,
        serviceIds: input.serviceIds,
      }),
    },
  );

  return getComboResponseData(result);
}

async function deleteCombo(id: string): Promise<Combo> {
  const result = await fetchClient<ComboApiResponse>(
    API_ROUTES.comboDetail(id),
    {
      method: "DELETE",
    },
  );

  return getComboResponseData(result);
}

export function useCombos(status: CatalogStatusValue = CATALOG_STATUS_ACTIVE) {
  const queryClient = useQueryClient();
  const combosQuery = useQuery({
    queryKey: [...COMBOS_QUERY_KEY, status],
    queryFn: () => getCombos(status),
  });

  const createComboMutation = useMutation({
    mutationFn: createCombo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: COMBOS_QUERY_KEY }),
  });

  const updateComboMutation = useMutation({
    mutationFn: updateCombo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: COMBOS_QUERY_KEY }),
  });

  const deleteComboMutation = useMutation({
    mutationFn: deleteCombo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: COMBOS_QUERY_KEY }),
  });

  return {
    combos: combosQuery.data ?? [],
    error: combosQuery.error,
    isCreating: createComboMutation.isPending,
    isDeleting: deleteComboMutation.isPending,
    isLoading: combosQuery.isLoading,
    isUpdating: updateComboMutation.isPending,
    createCombo: createComboMutation.mutateAsync,
    deleteCombo: deleteComboMutation.mutateAsync,
    updateCombo: updateComboMutation.mutateAsync,
  };
}
