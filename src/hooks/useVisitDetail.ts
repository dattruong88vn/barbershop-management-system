import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  VisitDetailApiResponse,
  VisitDetailUpdateInput,
  VisitPhotoApiResponse,
  VisitPhotoDeleteInput,
  VisitPhotoUploadInput,
  VisitStaffUpdateInput,
  VisitStatusUpdateInput,
} from "@/types";

const VISIT_DETAIL_QUERY_KEY = "visit-detail";
const CUSTOMER_VISITS_QUERY_KEY = ["customer-visits"] as const;
const VISIT_LIST_QUERY_KEY = ["visits"] as const;
const VISIT_RESPONSE_DATA_KEY = "visit";
const VISIT_PHOTO_RESPONSE_DATA_KEY = "photo";

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

function getVisitPhotoResponseData(
  result: VisitPhotoApiResponse,
): CustomerVisitPhoto {
  if (
    !hasResponseData<typeof VISIT_PHOTO_RESPONSE_DATA_KEY, CustomerVisitPhoto>(
      result,
      VISIT_PHOTO_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? visitTexts.detail.errors.generic);
  }

  return result.photo;
}

async function getVisitDetail(visitId: string): Promise<CustomerVisit> {
  const result = await fetchClient<VisitDetailApiResponse>(
    API_ROUTES.visitDetail(visitId),
  );

  return getVisitResponseData(result);
}

async function createVisitPhoto({
  file,
  visitId,
}: VisitPhotoUploadInput): Promise<CustomerVisitPhoto> {
  const formData = new FormData();
  formData.set("file", file);

  const result = await fetchClient<VisitPhotoApiResponse>(
    API_ROUTES.visitPhotos(visitId),
    {
      method: "POST",
      body: formData,
    },
  );

  return getVisitPhotoResponseData(result);
}

async function deleteVisitPhoto(
  input: VisitPhotoDeleteInput,
): Promise<CustomerVisitPhoto> {
  const result = await fetchClient<VisitPhotoApiResponse>(
    API_ROUTES.visitPhotoDetail(input.visitId, input.photoId),
    {
      method: "DELETE",
      headers: DEFAULT_JSON_HEADERS,
    },
  );

  return getVisitPhotoResponseData(result);
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
        noHaircut: input.noHaircut,
        noSkinnerService: input.noSkinnerService,
        skinnerId: input.skinnerId,
      }),
    },
  );

  return getVisitResponseData(result);
}

async function updateVisitStatus(
  input: VisitStatusUpdateInput,
): Promise<CustomerVisit> {
  const result = await fetchClient<VisitDetailApiResponse>(
    API_ROUTES.visitDetail(input.visitId),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        noHaircut: input.noHaircut,
        noSkinnerService: input.noSkinnerService,
        status: input.status,
      }),
    },
  );

  return getVisitResponseData(result);
}

async function updateVisitDetail(
  input: VisitDetailUpdateInput,
): Promise<CustomerVisit> {
  const result = await fetchClient<VisitDetailApiResponse>(
    API_ROUTES.visitDetail(input.visitId),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        barberId: input.barberId,
        comboIds: input.comboIds,
        noHaircut: input.noHaircut,
        noSkinnerService: input.noSkinnerService,
        serviceIds: input.serviceIds,
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
  async function refreshVisitDetail() {
    const result = await visitQuery.refetch();

    if (result.error) {
      throw result.error;
    }

    return result.data ?? null;
  }

  const updateVisitStaffMutation = useMutation({
    mutationFn: updateVisitStaff,
    onSuccess: (visit, input) =>
      queryClient.setQueryData([VISIT_DETAIL_QUERY_KEY, visit.id], {
        ...visit,
        noHaircut: input.noHaircut,
        noSkinnerService: input.noSkinnerService,
      }),
  });
  const updateVisitStatusMutation = useMutation({
    mutationFn: updateVisitStatus,
    onSuccess: (visit, input) => {
      queryClient.setQueryData([VISIT_DETAIL_QUERY_KEY, visit.id], visit);
      queryClient.invalidateQueries({
        queryKey: VISIT_LIST_QUERY_KEY,
      });

      if (input.customerId) {
        queryClient.invalidateQueries({
          queryKey: [...CUSTOMER_VISITS_QUERY_KEY, input.customerId],
        });
      }
    },
  });
  const updateVisitDetailMutation = useMutation({
    mutationFn: updateVisitDetail,
    onSuccess: (visit, input) => {
      queryClient.setQueryData([VISIT_DETAIL_QUERY_KEY, visit.id], {
        ...visit,
        noHaircut: input.noHaircut,
        noSkinnerService: input.noSkinnerService,
      });
      queryClient.invalidateQueries({
        queryKey: VISIT_LIST_QUERY_KEY,
      });

      if (input.customerId) {
        queryClient.invalidateQueries({
          queryKey: [...CUSTOMER_VISITS_QUERY_KEY, input.customerId],
        });
      }
    },
  });
  const uploadVisitPhotoMutation = useMutation({
    mutationFn: createVisitPhoto,
    onSuccess: (photo, input) =>
      queryClient.setQueryData<CustomerVisit | null>(
        [VISIT_DETAIL_QUERY_KEY, input.visitId],
        (visit) =>
          visit
            ? {
                ...visit,
                photos: [photo, ...visit.photos],
              }
            : visit,
      ),
  });
  const deleteVisitPhotoMutation = useMutation({
    mutationFn: deleteVisitPhoto,
    onSuccess: (photo, input) =>
      queryClient.setQueryData<CustomerVisit | null>(
        [VISIT_DETAIL_QUERY_KEY, input.visitId],
        (visit) =>
          visit
            ? {
                ...visit,
                photos: visit.photos.filter(
                  (visitPhoto) => visitPhoto.id !== photo.id,
                ),
              }
            : visit,
      ),
  });

  return {
    deleteVisitPhoto: deleteVisitPhotoMutation.mutateAsync,
    error: visitQuery.error,
    isDeletingPhoto: deleteVisitPhotoMutation.isPending,
    isLoading: visitQuery.isLoading,
    isRefreshingDetail: visitQuery.isRefetching,
    isUpdatingDetail: updateVisitDetailMutation.isPending,
    isUploadingPhoto: uploadVisitPhotoMutation.isPending,
    isUpdatingStaff: updateVisitStaffMutation.isPending,
    isUpdatingStatus: updateVisitStatusMutation.isPending,
    refreshVisitDetail,
    updateVisitDetail: updateVisitDetailMutation.mutateAsync,
    visit: visitQuery.data ?? null,
    uploadVisitPhoto: uploadVisitPhotoMutation.mutateAsync,
    updateVisitStaff: updateVisitStaffMutation.mutateAsync,
    updateVisitStatus: updateVisitStatusMutation.mutateAsync,
  };
}
