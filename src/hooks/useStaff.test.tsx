import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { staffTexts } from "@/constants/texts";
import type { Staff, StaffFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useStaff } from "@/hooks/useStaff";

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

function createStaffMember(): Staff {
  return {
    id: "staff-1",
    shopId: "shop-1",
    branchId: "branch-1",
    username: "barber01",
    role: "barber",
    status: "active",
    isFirstLogin: true,
    createdAt: "2026-06-03T00:00:00.000Z",
    branch: {
      id: "branch-1",
      name: "Chi nhánh Quận 1",
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useStaff", () => {
  it("should fetch staff list from the staff api", async () => {
    const staffMember = createStaffMember();

    mocks.fetchClient.mockResolvedValue({ staff: [staffMember] });

    const { result } = renderHook(() => useStaff(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.staff).toEqual([staffMember]);
      });
    });
    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.staff);
  });

  it("should create staff and return created data", async () => {
    const input: StaffFormInput = {
      username: "barber01",
      password: "Secret123!",
      role: "barber",
      branchId: "branch-1",
    };
    const staffMember = createStaffMember();

    mocks.fetchClient
      .mockResolvedValueOnce({ staff: [] })
      .mockResolvedValueOnce({ staffMember });

    const { result } = renderHook(() => useStaff(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.createStaff(input);
      expect(mutationResult).toEqual(staffMember);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.staff, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  });

  it("should throw generic error when create staff response has no staff member data", async () => {
    const input: StaffFormInput = {
      username: "barber01",
      password: "Secret123!",
      role: "barber",
      branchId: "branch-1",
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ staff: [] })
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useStaff(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createStaff(input)).rejects.toThrow(
        staffTexts.ownerStaff.errors.generic,
      );
    });
  });

  it("should update staff by id", async () => {
    const input = {
      id: "staff-1",
      username: "barber01",
      role: "skinner" as const,
      branchId: "branch-2",
    };
    const staffMember = {
      ...createStaffMember(),
      role: input.role,
      branchId: input.branchId,
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ staff: [] })
      .mockResolvedValueOnce({ staffMember });

    const { result } = renderHook(() => useStaff(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.updateStaff(input);
      expect(mutationResult).toEqual(staffMember);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.staffDetail(input.id),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: input.username,
          password: undefined,
          role: input.role,
          branchId: input.branchId,
        }),
      },
    );
  });

  it("should mark staff inactive by id", async () => {
    const staffMember = createStaffMember();

    mocks.fetchClient
      .mockResolvedValueOnce({ staff: [] })
      .mockResolvedValueOnce({ staffMember });

    const { result } = renderHook(() => useStaff(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.deleteStaff(staffMember.id);
      expect(mutationResult).toEqual(staffMember);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.staffDetail(staffMember.id),
      {
        method: "DELETE",
      },
    );
  });
});
