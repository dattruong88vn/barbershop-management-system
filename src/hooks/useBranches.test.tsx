import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import type { Branch, BranchFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import {
  useBranches,
} from "@/hooks/useBranches";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useBranches", () => {
  it("should fetch branch list from the branches api", async () => {
    const branch: Branch = {
      id: "branch-1",
      shopId: "shop-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
      createdAt: "2026-06-03T00:00:00.000Z",
    };

    mocks.fetchClient.mockResolvedValue({ branches: [branch] });

    const { result } = renderHook(() => useBranches(), {
      wrapper: createWrapper(),
    });

    await vi.waitFor(() => {
      expect(result.current.branches).toEqual([branch]);
    });
    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.branches);
  });

  it("should create a branch and return created data", async () => {
    const input: BranchFormInput = {
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
    };
    const branch: Branch = {
      id: "branch-1",
      shopId: "shop-1",
      createdAt: "2026-06-03T00:00:00.000Z",
      ...input,
    };

    mocks.fetchClient.mockResolvedValue({ branch });

    const { result } = renderHook(() => useBranches(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.createBranch(input);
      expect(mutationResult).toEqual(branch);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.branches, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  });

  it("should update a branch by id", async () => {
    const input = {
      id: "branch-1",
      name: "Chi nhánh Quận 3",
      address: "456 Nguyễn Đình Chiểu",
    };
    const branch: Branch = {
      shopId: "shop-1",
      createdAt: "2026-06-03T00:00:00.000Z",
      ...input,
    };

    mocks.fetchClient.mockResolvedValue({ branch });

    const { result } = renderHook(() => useBranches(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.updateBranch(input);
      expect(mutationResult).toEqual(branch);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.branchDetail(input.id),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          address: input.address,
        }),
      },
    );
  });

  it("should delete a branch by id", async () => {
    const branch: Branch = {
      id: "branch-1",
      shopId: "shop-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
      createdAt: "2026-06-03T00:00:00.000Z",
    };

    mocks.fetchClient.mockResolvedValue({ branch });

    const { result } = renderHook(() => useBranches(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.deleteBranch(branch.id);
      expect(mutationResult).toEqual(branch);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.branchDetail(branch.id),
      {
        method: "DELETE",
      },
    );
  });
});
