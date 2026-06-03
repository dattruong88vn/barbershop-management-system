import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { staffTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Staff,
  StaffApiResponse,
  StaffFormInput,
  StaffListApiResponse,
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
        password: input.password,
        role: input.role,
        branchId: input.branchId,
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

export function useStaff() {
  const queryClient = useQueryClient();
  const staffQuery = useQuery({
    queryKey: STAFF_QUERY_KEY,
    queryFn: getStaff,
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

  return {
    staff: staffQuery.data ?? [],
    error: staffQuery.error,
    isCreating: createStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
    isLoading: staffQuery.isLoading,
    isUpdating: updateStaffMutation.isPending,
    createStaff: createStaffMutation.mutateAsync,
    deleteStaff: deleteStaffMutation.mutateAsync,
    updateStaff: updateStaffMutation.mutateAsync,
  };
}
