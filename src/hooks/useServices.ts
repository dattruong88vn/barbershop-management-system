import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CATALOG_STATUS_ACTIVE,
  type CatalogStatusValue,
} from "@/constants/common";
import { API_ROUTES } from "@/constants/routes";
import { serviceTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Service,
  ServiceApiResponse,
  ServiceFormInput,
  ServiceListApiResponse,
} from "@/types";

const SERVICES_QUERY_KEY = ["services"] as const;
const SERVICE_RESPONSE_DATA_KEY = "service";

function getServiceResponseData(result: ServiceApiResponse): Service {
  if (
    !hasResponseData<typeof SERVICE_RESPONSE_DATA_KEY, Service>(
      result,
      SERVICE_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? serviceTexts.ownerServices.errors.generic);
  }

  return result.service;
}

async function getServices(status: CatalogStatusValue): Promise<Service[]> {
  const result = await fetchClient<ServiceListApiResponse>(
    API_ROUTES.services({ status }),
  );

  return result.services;
}

async function createService(input: ServiceFormInput): Promise<Service> {
  const result = await fetchClient<ServiceApiResponse>(API_ROUTES.services(), {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getServiceResponseData(result);
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
        responsibleRole: input.responsibleRole,
        isHaircut: input.isHaircut,
      }),
    },
  );

  return getServiceResponseData(result);
}

async function deleteService(id: string): Promise<Service> {
  const result = await fetchClient<ServiceApiResponse>(
    API_ROUTES.serviceDetail(id),
    {
      method: "DELETE",
    },
  );

  return getServiceResponseData(result);
}

export function useServices(status: CatalogStatusValue = CATALOG_STATUS_ACTIVE) {
  const queryClient = useQueryClient();
  const servicesQuery = useQuery({
    queryKey: [...SERVICES_QUERY_KEY, status],
    queryFn: () => getServices(status),
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
