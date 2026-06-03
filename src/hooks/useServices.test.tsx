import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { serviceTexts } from "@/constants/texts";
import type { Service, ServiceFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useServices } from "@/hooks/useServices";

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

describe("useServices", () => {
  it("should fetch service list from the services api", async () => {
    const service: Service = {
      id: "service-1",
      shopId: "shop-1",
      name: "Cắt tóc nam",
      price: 80000,
      isHaircut: true,
      createdAt: "2026-06-03T00:00:00.000Z",
    };

    mocks.fetchClient.mockResolvedValue({ services: [service] });

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.services).toEqual([service]);
      });
    });
    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.services);
  });

  it("should create a service and return created data", async () => {
    const input: ServiceFormInput = {
      name: "Cắt tóc nam",
      price: 80000,
      isHaircut: true,
    };
    const service: Service = {
      id: "service-1",
      shopId: "shop-1",
      createdAt: "2026-06-03T00:00:00.000Z",
      ...input,
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ services: [] })
      .mockResolvedValueOnce({ service });

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.createService(input);
      expect(mutationResult).toEqual(service);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.services, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  });

  it("should throw generic error when create service response has no service data", async () => {
    const input: ServiceFormInput = {
      name: "Cắt tóc nam",
      price: 80000,
      isHaircut: true,
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ services: [] })
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createService(input)).rejects.toThrow(
        serviceTexts.ownerServices.errors.generic,
      );
    });
  });

  it("should update a service by id", async () => {
    const input = {
      id: "service-1",
      name: "Gội đầu",
      price: 50000,
      isHaircut: false,
    };
    const service: Service = {
      shopId: "shop-1",
      createdAt: "2026-06-03T00:00:00.000Z",
      ...input,
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ services: [] })
      .mockResolvedValueOnce({ service });

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.updateService(input);
      expect(mutationResult).toEqual(service);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.serviceDetail(input.id),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          price: input.price,
          isHaircut: input.isHaircut,
        }),
      },
    );
  });

  it("should delete a service by id", async () => {
    const service: Service = {
      id: "service-1",
      shopId: "shop-1",
      name: "Cắt tóc nam",
      price: 80000,
      isHaircut: true,
      createdAt: "2026-06-03T00:00:00.000Z",
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ services: [] })
      .mockResolvedValueOnce({ service });

    const { result } = renderHook(() => useServices(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.deleteService(service.id);
      expect(mutationResult).toEqual(service);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.serviceDetail(service.id),
      {
        method: "DELETE",
      },
    );
  });
});
