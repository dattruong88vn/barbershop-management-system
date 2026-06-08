import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import type { CustomerVisit, VisitStaffUpdateInput } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useVisitDetail } from "@/hooks/useVisitDetail";

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

function createVisit(): CustomerVisit {
  return {
    id: "visit-1",
    createdAt: "2026-06-04T01:00:00.000Z",
    completedAt: "2026-06-04T02:00:00.000Z",
    lastUpdatedBy: null,
    status: "completed",
    totalPrice: 100000,
    barber: {
      id: "barber-1",
      username: "barber01",
    },
    skinner: null,
    photos: [],
    services: [],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useVisitDetail", () => {
  it("should not fetch when visit id is empty", () => {
    const { result } = renderHook(() => useVisitDetail(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.visit).toBeNull();
    expect(mocks.fetchClient).not.toHaveBeenCalled();
  });

  it("should fetch visit detail by id", async () => {
    const visit = createVisit();

    mocks.fetchClient.mockResolvedValue({ visit });

    const { result } = renderHook(() => useVisitDetail("visit-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.visit).toEqual(visit);
      });
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.visitDetail("visit-1"),
    );
  });

  it("should throw generic error when visit response has no visit data", async () => {
    mocks.fetchClient.mockResolvedValue({});

    const { result } = renderHook(() => useVisitDetail("visit-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });
    expect(result.current.error).toEqual(
      new Error(visitTexts.detail.errors.generic),
    );
  });

  it("should update visit staff and cache returned visit", async () => {
    const visit = createVisit();
    const updatedVisit: CustomerVisit = {
      ...visit,
      barber: null,
      skinner: {
        id: "skinner-1",
        username: "skinner01",
      },
    };
    const input: VisitStaffUpdateInput = {
      visitId: "visit-1",
      customerId: "",
      barberId: null,
      skinnerId: "skinner-1",
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ visit })
      .mockResolvedValueOnce({ visit: updatedVisit });

    const { result } = renderHook(() => useVisitDetail("visit-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.visit).toEqual(visit);
      });
    });
    await act(async () => {
      await expect(result.current.updateVisitStaff(input)).resolves.toEqual(
        updatedVisit,
      );
    });

    expect(mocks.fetchClient).toHaveBeenLastCalledWith(
      API_ROUTES.visitDetail("visit-1"),
      {
        method: "PATCH",
        headers: DEFAULT_JSON_HEADERS,
        body: JSON.stringify({
          barberId: null,
          skinnerId: "skinner-1",
        }),
      },
    );
    expect(result.current.visit).toEqual(updatedVisit);
  });
});
