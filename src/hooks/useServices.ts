import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { serviceTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Service,
  ServiceApiResponse,
  ServiceFormInput,
  ServiceListApiResponse,
} from "@/types";

const SERVICES_QUERY_KEY = ["services"] as const;

function isServiceApiResponse(
  response: ServiceApiResponse,
): response is Required<Pick<ServiceApiResponse, "service">> {
  return typeof response.service === "object" && response.service !== null;
}

async function getServices(): Promise<Service[]> {
  const result = await fetchClient<ServiceListApiResponse>(API_ROUTES.services);

  return result.services;
}

async function createService(input: ServiceFormInput): Promise<Service> {
  const result = await fetchClient<ServiceApiResponse>(API_ROUTES.services, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  if (!isServiceApiResponse(result)) {
    throw new Error(result.error ?? serviceTexts.ownerServices.errors.generic);
  }

  return result.service;
}

async function updateService(input: ServiceFormInput & { id: string }) {
  const result = await fetchClient<ServiceApiResponse>(
    API_ROUTES.serviceDetail(input.id),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        name: input.name,
        price: input.price,
        isHaircut: input.isHaircut,
      }),
    },
  );

  if (!isServiceApiResponse(result)) {
    throw new Error(result.error ?? serviceTexts.ownerServices.errors.generic);
  }

  return result.service;
}

async function deleteService(id: string): Promise<Service> {
  const result = await fetchClient<ServiceApiResponse>(
    API_ROUTES.serviceDetail(id),
    {
      method: "DELETE",
    },
  );

  if (!isServiceApiResponse(result)) {
    throw new Error(result.error ?? serviceTexts.ownerServices.errors.generic);
  }

  return result.service;
}

export function useServices() {
  const queryClient = useQueryClient();
  const servicesQuery = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: getServices,
  });

  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY }),
  });

  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY }),
  });

  return {
    services: servicesQuery.data ?? [],
    error: servicesQuery.error,
    isCreating: createServiceMutation.isPending,
    isDeleting: deleteServiceMutation.isPending,
    isLoading: servicesQuery.isLoading,
    isUpdating: updateServiceMutation.isPending,
    createService: createServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
  };
}
