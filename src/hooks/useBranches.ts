import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { branchTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Branch,
  BranchApiResponse,
  BranchFormInput,
  BranchListApiResponse,
} from "@/types";

const BRANCHES_QUERY_KEY = ["branches"] as const;
const BRANCH_RESPONSE_DATA_KEY = "branch";

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

async function deleteBranch(id: string): Promise<Branch> {
  const result = await fetchClient<BranchApiResponse>(
    API_ROUTES.branchDetail(id),
    {
      method: "DELETE",
    },
  );

  return getBranchResponseData(result);
}

export function useBranches(enabled = true) {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
    enabled,
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: getBranches,
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

  const deleteBranchMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY }),
  });

  return {
    branches: branchesQuery.data ?? [],
    error: branchesQuery.error,
    isCreating: createBranchMutation.isPending,
    isDeleting: deleteBranchMutation.isPending,
    isLoading: branchesQuery.isLoading,
    isUpdating: updateBranchMutation.isPending,
    createBranch: createBranchMutation.mutateAsync,
    deleteBranch: deleteBranchMutation.mutateAsync,
    updateBranch: updateBranchMutation.mutateAsync,
  };
}
