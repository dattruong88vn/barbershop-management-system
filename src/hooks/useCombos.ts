import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { comboTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Combo,
  ComboApiResponse,
  ComboFormInput,
  ComboListApiResponse,
} from "@/types";

const COMBOS_QUERY_KEY = ["combos"] as const;

function isComboApiResponse(
  response: ComboApiResponse,
): response is Required<Pick<ComboApiResponse, "combo">> {
  return typeof response.combo === "object" && response.combo !== null;
}

async function getCombos(): Promise<Combo[]> {
  const result = await fetchClient<ComboListApiResponse>(API_ROUTES.combos);

  return result.combos;
}

async function createCombo(input: ComboFormInput): Promise<Combo> {
  const result = await fetchClient<ComboApiResponse>(API_ROUTES.combos, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  if (!isComboApiResponse(result)) {
    throw new Error(result.error ?? comboTexts.ownerCombos.errors.generic);
  }

  return result.combo;
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

  if (!isComboApiResponse(result)) {
    throw new Error(result.error ?? comboTexts.ownerCombos.errors.generic);
  }

  return result.combo;
}

async function deleteCombo(id: string): Promise<Combo> {
  const result = await fetchClient<ComboApiResponse>(
    API_ROUTES.comboDetail(id),
    {
      method: "DELETE",
    },
  );

  if (!isComboApiResponse(result)) {
    throw new Error(result.error ?? comboTexts.ownerCombos.errors.generic);
  }

  return result.combo;
}

export function useCombos() {
  const queryClient = useQueryClient();
  const combosQuery = useQuery({
    queryKey: COMBOS_QUERY_KEY,
    queryFn: getCombos,
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
