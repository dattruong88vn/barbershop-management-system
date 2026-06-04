import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import type { Customer, CustomerFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useCustomers } from "@/hooks/useCustomers";

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

function createCustomer(): Customer {
  return {
    id: "customer-1",
    shopId: "shop-1",
    name: "Nguyễn Văn Nam",
    phone: "0901234567",
    createdAt: "2026-06-03T01:00:00.000Z",
    lastVisit: null,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCustomers", () => {
  it("should not fetch customers when search term is empty", () => {
    const { result } = renderHook(() => useCustomers(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.customers).toEqual([]);
    expect(mocks.fetchClient).not.toHaveBeenCalled();
  });

  it("should fetch customers by search term", async () => {
    const customer = createCustomer();

    mocks.fetchClient.mockResolvedValue({ customers: [customer] });

    const { result } = renderHook(() => useCustomers(" Nam "), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.customers).toEqual([customer]);
      });
    });
    expect(mocks.fetchClient).toHaveBeenCalledWith(
      `${API_ROUTES.customers}?search=Nam`,
    );
  });

  it("should create a customer and return created data", async () => {
    const input: CustomerFormInput = {
      name: "Nguyễn Văn Nam",
      phone: "0901234567",
    };
    const customer = createCustomer();

    mocks.fetchClient
      .mockResolvedValueOnce({ customers: [] })
      .mockResolvedValueOnce({ customer });

    const { result } = renderHook(() => useCustomers("Nam"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.createCustomer(input);
      expect(mutationResult).toEqual(customer);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.customers, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  });

  it("should throw generic error when create customer response has no customer data", async () => {
    const input: CustomerFormInput = {
      name: "Nguyễn Văn Nam",
      phone: "0901234567",
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ customers: [] })
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useCustomers("Nam"), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createCustomer(input)).rejects.toThrow(
        customerTexts.lookup.errors.generic,
      );
    });
  });
});
