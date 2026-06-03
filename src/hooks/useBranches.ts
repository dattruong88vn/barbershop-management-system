import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { branchTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Branch,
  BranchApiResponse,
  BranchFormInput,
  BranchListApiResponse,
} from "@/types";

const BRANCHES_QUERY_KEY = ["branches"] as const;

function isBranchApiResponse(
  response: BranchApiResponse,
): response is Required<Pick<BranchApiResponse, "branch">> {
  return typeof response.branch === "object" && response.branch !== null;
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

  if (!isBranchApiResponse(result)) {
    throw new Error(result.error ?? branchTexts.ownerBranches.errors.generic);
  }

  return result.branch;
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
      }),
    },
  );

  if (!isBranchApiResponse(result)) {
    throw new Error(result.error ?? branchTexts.ownerBranches.errors.generic);
  }

  return result.branch;
}

async function deleteBranch(id: string): Promise<Branch> {
  const result = await fetchClient<BranchApiResponse>(
    API_ROUTES.branchDetail(id),
    {
      method: "DELETE",
    },
  );

  if (!isBranchApiResponse(result)) {
    throw new Error(result.error ?? branchTexts.ownerBranches.errors.generic);
  }

  return result.branch;
}

export function useBranches() {
  const queryClient = useQueryClient();
  const branchesQuery = useQuery({
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
