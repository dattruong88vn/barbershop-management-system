import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import { uploadFileToPresignedUrl } from "@/lib/r2UploadClient";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  VisitDetailApiResponse,
  VisitPhotoApiResponse,
  VisitPhotoCreateInput,
  VisitPhotoUploadInput,
  VisitPresignedUploadApiResponse,
  VisitPresignedUploadInput,
  VisitStaffUpdateInput,
} from "@/types";

const VISIT_DETAIL_QUERY_KEY = "visit-detail";
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

function getPresignedUploadData(result: VisitPresignedUploadApiResponse) {
  if (typeof result.url !== "string" || typeof result.key !== "string") {
    throw new Error(result.error ?? visitTexts.detail.errors.generic);
  }

  return {
    key: result.key,
    url: result.url,
  };
}

async function getVisitDetail(visitId: string): Promise<CustomerVisit> {
  const result = await fetchClient<VisitDetailApiResponse>(
    API_ROUTES.visitDetail(visitId),
  );

  return getVisitResponseData(result);
}

async function getPresignedUploadUrl(
  input: VisitPresignedUploadInput,
): Promise<{ key: string; url: string }> {
  const result = await fetchClient<VisitPresignedUploadApiResponse>(
    API_ROUTES.uploadPresigned,
    {
      method: "POST",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify(input),
    },
  );

  return getPresignedUploadData(result);
}

async function createVisitPhoto(
  input: VisitPhotoCreateInput,
): Promise<CustomerVisitPhoto> {
  const result = await fetchClient<VisitPhotoApiResponse>(
    API_ROUTES.visitPhotos(input.visitId),
    {
      method: "POST",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        key: input.key,
      }),
    },
  );

  return getVisitPhotoResponseData(result);
}

async function uploadVisitPhoto({
  file,
  visitId,
}: VisitPhotoUploadInput): Promise<CustomerVisitPhoto> {
  const { key, url } = await getPresignedUploadUrl({
    fileType: file.type,
    visitId,
  });

  await uploadFileToPresignedUrl(url, file);

  return createVisitPhoto({
    key,
    visitId,
  });
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
  const uploadVisitPhotoMutation = useMutation({
    mutationFn: uploadVisitPhoto,
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

  return {
    error: visitQuery.error,
    isLoading: visitQuery.isLoading,
    isUploadingPhoto: uploadVisitPhotoMutation.isPending,
    isUpdatingStaff: updateVisitStaffMutation.isPending,
    visit: visitQuery.data ?? null,
    uploadVisitPhoto: uploadVisitPhotoMutation.mutateAsync,
    updateVisitStaff: updateVisitStaffMutation.mutateAsync,
  };
}
