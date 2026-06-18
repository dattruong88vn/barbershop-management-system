import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import type { BranchStatusValue } from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Branch,
  BranchApiResponse,
  BranchFormInput,
  BranchListApiResponse,
  BranchManagerListApiResponse,
} from "@/types";

const BRANCHES_QUERY_KEY = ["branches"] as const;
const BRANCH_RESPONSE_DATA_KEY = "branch";
const BRANCH_MANAGERS_QUERY_KEY = ["branch-managers"] as const;

function getBranchResponseData(result: BranchApiResponse): Branch {
  if (
    !hasResponseData<typeof BRANCH_RESPONSE_DATA_KEY, Branch>(
      result,
      BRANCH_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? branchTexts.ownerBranches.errors.generic);
  }

  return result.branch;
}

async function getBranches(): Promise<Branch[]> {
  const result = await fetchClient<BranchListApiResponse>(API_ROUTES.branches);

  return result.branches;
}

async function getBranch(id: string): Promise<Branch> {
  const result = await fetchClient<BranchApiResponse>(
    API_ROUTES.branchDetail(id),
  );

  return getBranchResponseData(result);
}

async function getBranchManagers() {
  const result = await fetchClient<BranchManagerListApiResponse>(
    API_ROUTES.branchManagers(),
  );

  return result.managers;
}

async function createBranch(input: BranchFormInput): Promise<Branch> {
  const result = await fetchClient<BranchApiResponse>(API_ROUTES.branches, {
    method: "POST",
    headers: DEFAULT_JSON_HEADERS,
    body: JSON.stringify(input),
  });

  return getBranchResponseData(result);
}

async function updateBranch(input: BranchFormInput & { id: string }) {
  const result = await fetchClient<BranchApiResponse>(
    API_ROUTES.branchDetail(input.id),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({
        name: input.name,
        address: input.address,
        managerId: input.managerId,
      }),
    },
  );

  return getBranchResponseData(result);
}

async function updateBranchStatus(input: {
  id: string;
  status: BranchStatusValue;
}): Promise<Branch> {
  const result = await fetchClient<BranchApiResponse>(
    API_ROUTES.branchStatus(input.id),
    {
      method: "PATCH",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify({ status: input.status }),
    },
  );

  return getBranchResponseData(result);
}

export function useBranches(
  enabled = true,
  includeManagers = false,
  branchId?: string,
) {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
    enabled,
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: getBranches,
  });
  const managersQuery = useQuery({
    enabled: enabled && includeManagers,
    queryKey: BRANCH_MANAGERS_QUERY_KEY,
    queryFn: getBranchManagers,
  });
  const branchDetailQuery = useQuery({
    enabled: enabled && Boolean(branchId),
    queryKey: [...BRANCHES_QUERY_KEY, branchId],
    queryFn: () => getBranch(branchId ?? ""),
  });

  const createBranchMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY }),
  });

  const updateBranchMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY }),
  });

  const updateBranchStatusMutation = useMutation({
    mutationFn: updateBranchStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY }),
  });

  return {
    branches: branchesQuery.data ?? [],
    branch: branchDetailQuery.data ?? null,
    error: branchesQuery.error,
    isCreating: createBranchMutation.isPending,
    isUpdatingStatus: updateBranchStatusMutation.isPending,
    isLoading: branchesQuery.isLoading || branchDetailQuery.isLoading,
    isLoadingManagers: managersQuery.isLoading,
    isUpdating: updateBranchMutation.isPending,
    createBranch: createBranchMutation.mutateAsync,
    updateBranchStatus: updateBranchStatusMutation.mutateAsync,
    updateBranch: updateBranchMutation.mutateAsync,
    managers: managersQuery.data ?? [],
  };
}
