import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import type { CustomerVisitHistory } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useCustomerVisits } from "@/hooks/useCustomerVisits";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
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

function createVisitHistory(): CustomerVisitHistory {
  return {
    customer: {
      id: "customer-1",
      name: "Nguyễn Văn Nam",
      phone: "0901234567",
      createdAt: "2026-06-01T01:00:00.000Z",
    },
    visits: [],
    suggestions: null,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCustomerVisits", () => {
  it("should not fetch visit history when customer id is empty", () => {
    const { result } = renderHook(() => useCustomerVisits(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.customer).toBeNull();
    expect(result.current.visits).toEqual([]);
    expect(mocks.fetchClient).not.toHaveBeenCalled();
  });

  it("should fetch visit history by customer id", async () => {
    const visitHistory = createVisitHistory();

    mocks.fetchClient.mockResolvedValue(visitHistory);

    const { result } = renderHook(() => useCustomerVisits("customer-1"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.customer).toEqual(visitHistory.customer);
      });
    });
    expect(result.current.visits).toEqual(visitHistory.visits);
    expect(result.current.suggestions).toBeNull();
    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.customerVisits("customer-1"),
    );
  });
});
