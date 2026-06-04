import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import type {
  CustomerVisit,
  VisitCreateInput,
  VisitCreateOptions,
  VisitStaffUpdateInput,
} from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useVisits } from "@/hooks/useVisits";

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

function createVisitOptions(): VisitCreateOptions {
  return {
    services: [
      {
        id: "service-1",
        name: "Cắt tóc nam",
        price: 100000,
      },
    ],
    combos: [
      {
        id: "combo-1",
        name: "Combo gội đầu",
        price: 50000,
      },
    ],
    barbers: [
      {
        id: "barber-1",
        username: "barber01",
        role: "barber",
      },
    ],
    skinners: [
      {
        id: "skinner-1",
        username: "skinner01",
        role: "skinner",
      },
    ],
  };
}

function createVisit(): CustomerVisit {
  return {
    id: "visit-1",
    createdAt: "2026-06-04T01:00:00.000Z",
    completedAt: null,
    lastUpdatedBy: null,
    status: "pending",
    totalPrice: 150000,
    barber: {
      id: "barber-1",
      username: "barber01",
    },
    skinner: {
      id: "skinner-1",
      username: "skinner01",
    },
    photos: [],
    services: [],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useVisits", () => {
  it("should fetch visit create options", async () => {
    const visitOptions = createVisitOptions();

    mocks.fetchClient.mockResolvedValue(visitOptions);

    const { result } = renderHook(() => useVisits(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.services).toEqual(visitOptions.services);
      });
    });

    expect(result.current.combos).toEqual(visitOptions.combos);
    expect(result.current.barbers).toEqual(visitOptions.barbers);
    expect(result.current.skinners).toEqual(visitOptions.skinners);
    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.visits);
  });

  it("should create a visit and return created data", async () => {
    const visit = createVisit();
    const input: VisitCreateInput = {
      customerId: "customer-1",
      serviceIds: ["service-1"],
      comboIds: ["combo-1"],
      barberId: "barber-1",
      skinnerId: "skinner-1",
    };

    mocks.fetchClient
      .mockResolvedValueOnce(createVisitOptions())
      .mockResolvedValueOnce({ visit });

    const { result } = renderHook(() => useVisits(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.createVisit(input);
      expect(mutationResult).toEqual(visit);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.visits, {
      method: "POST",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify(input),
    });
  });

  it("should throw generic error when create visit response has no visit data", async () => {
    const input: VisitCreateInput = {
      customerId: "customer-1",
      serviceIds: ["service-1"],
      comboIds: [],
      barberId: null,
      skinnerId: null,
    };

    mocks.fetchClient
      .mockResolvedValueOnce(createVisitOptions())
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useVisits(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createVisit(input)).rejects.toThrow(
        visitTexts.create.errors.generic,
      );
    });
  });

  it("should update visit staff and return updated data", async () => {
    const visit = createVisit();
    const input: VisitStaffUpdateInput = {
      visitId: "visit-1",
      customerId: "customer-1",
      barberId: "barber-1",
      skinnerId: null,
    };

    mocks.fetchClient
      .mockResolvedValueOnce(createVisitOptions())
      .mockResolvedValueOnce({ visit });

    const { result } = renderHook(() => useVisits(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.updateVisitStaff(input);
      expect(mutationResult).toEqual(visit);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.visitDetail("visit-1"),
      {
        method: "PATCH",
        headers: DEFAULT_JSON_HEADERS,
        body: JSON.stringify({
          barberId: "barber-1",
          skinnerId: null,
        }),
      },
    );
  });
});
