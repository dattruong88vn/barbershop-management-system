import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { staffTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import { uploadFileToPresignedUrl } from "@/lib/r2UploadClient";
import type {
  Staff,
  StaffApiResponse,
  StaffFormInput,
  StaffIdentityUploadApiResponse,
  StaffIdentityUploadInput,
  StaffListApiResponse,
  StaffTransferApiResponse,
  StaffTransferInput,
} from "@/types";

const STAFF_QUERY_KEY = ["staff"] as const;
const STAFF_RESPONSE_DATA_KEY = "staffMember";

function getStaffResponseData(result: StaffApiResponse): Staff {
  if (
    !hasResponseData<typeof STAFF_RESPONSE_DATA_KEY, Staff>(
      result,
      STAFF_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? staffTexts.ownerStaff.errors.generic);
  }

  return result.staffMember;
}

async function getStaff(): Promise<Staff[]> {
  const result = await fetchClient<StaffListApiResponse>(API_ROUTES.staff);

  return result.staff;
}

async function getStaffMember(id: string): Promise<Staff> {
  const result = await fetchClient<StaffApiResponse>(API_ROUTES.staffDetail(id));
  return getStaffResponseData(result);
}

async function uploadStaffIdentityImage(
  input: StaffIdentityUploadInput & { file: File },
) {
  const result = await fetchClient<StaffIdentityUploadApiResponse>(
    API_ROUTES.staffIdentityUpload,
    {
      method: "POST",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        draftId: input.draftId,
        fileType: input.file.type,
        side: input.side,
      }),
    },
  );

  if (typeof result.key !== "string" || typeof result.url !== "string") {
    throw new Error(result.error ?? staffTexts.ownerStaff.errors.generic);
  }

  await uploadFileToPresignedUrl(result.url, input.file);
  return result.key;
}

async function createStaff(input: StaffFormInput): Promise<Staff> {
  const result = await fetchClient<StaffApiResponse>(API_ROUTES.staff, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getStaffResponseData(result);
}

async function updateStaff(input: StaffFormInput & { id: string }) {
  const result = await fetchClient<StaffApiResponse>(
    API_ROUTES.staffDetail(input.id),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        username: input.username,
        fullName: input.fullName,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        hometown: input.hometown,
        currentAddress: input.currentAddress,
        hometownProvinceCode: input.hometownProvinceCode,
        currentProvinceCode: input.currentProvinceCode,
        currentWardCode: input.currentWardCode,
        currentAddressLine: input.currentAddressLine,
        identityCardFrontKey: input.identityCardFrontKey,
        identityCardBackKey: input.identityCardBackKey,
        password: input.password,
        role: input.role,
        branchId: input.branchId,
        managedBranchIds: input.managedBranchIds,
      }),
    },
  );

  return getStaffResponseData(result);
}

async function deleteStaff(id: string): Promise<Staff> {
  const result = await fetchClient<StaffApiResponse>(
    API_ROUTES.staffDetail(id),
    {
      method: "DELETE",
    },
  );

  return getStaffResponseData(result);
}

async function transferStaff(input: StaffTransferInput) {
  return fetchClient<StaffTransferApiResponse>(API_ROUTES.staffTransfer, {
    method: "PATCH",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function useStaff(staffId?: string) {
  const queryClient = useQueryClient();
  const staffQuery = useQuery({
    queryKey: STAFF_QUERY_KEY,
    queryFn: getStaff,
  });
  const staffMemberQuery = useQuery({
    queryKey: [...STAFF_QUERY_KEY, staffId],
    queryFn: () => getStaffMember(staffId ?? ""),
    enabled: Boolean(staffId),
  });

  const createStaffMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY }),
  });

  const updateStaffMutation = useMutation({
    mutationFn: updateStaff,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY }),
  });

  const deleteStaffMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEY }),
  });
  const transferStaffMutation = useMutation({
    mutationFn: transferStaff,
    onSuccess: () => queryClient.invalidateQueries(),
  });
  const identityUploadMutation = useMutation({
    mutationFn: uploadStaffIdentityImage,
  });

  return {
    staff: staffQuery.data ?? [],
    staffMember: staffMemberQuery.data ?? null,
    error: staffQuery.error,
    isCreating: createStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
    isLoading: staffQuery.isLoading,
    isUpdating: updateStaffMutation.isPending,
    isTransferring: transferStaffMutation.isPending,
    isLoadingStaffMember: staffMemberQuery.isLoading,
    isUploadingIdentity: identityUploadMutation.isPending,
    createStaff: createStaffMutation.mutateAsync,
    deleteStaff: deleteStaffMutation.mutateAsync,
    updateStaff: updateStaffMutation.mutateAsync,
    transferStaff: transferStaffMutation.mutateAsync,
    uploadIdentityImage: identityUploadMutation.mutateAsync,
  };
}
