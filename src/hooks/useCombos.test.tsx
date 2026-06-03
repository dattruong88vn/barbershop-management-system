import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { comboTexts } from "@/constants/texts";
import type { Combo, ComboFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useCombos } from "@/hooks/useCombos";

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

function createCombo(): Combo {
  return {
    id: "combo-1",
    shopId: "shop-1",
    name: "Combo cắt gội",
    description: "Cắt tóc và gội đầu",
    price: 120000,
    createdAt: "2026-06-03T00:00:00.000Z",
    services: [
      {
        id: "service-1",
        name: "Cắt tóc nam",
        price: 80000,
        isHaircut: true,
      },
    ],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCombos", () => {
  it("should fetch combo list from the combos api", async () => {
    const combo = createCombo();

    mocks.fetchClient.mockResolvedValue({ combos: [combo] });

    const { result } = renderHook(() => useCombos(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.combos).toEqual([combo]);
      });
    });
    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.combos);
  });

  it("should create a combo and return created data", async () => {
    const input: ComboFormInput = {
      name: "Combo cắt gội",
      description: "Cắt tóc và gội đầu",
      price: 120000,
      serviceIds: ["service-1"],
    };
    const combo = createCombo();

    mocks.fetchClient
      .mockResolvedValueOnce({ combos: [] })
      .mockResolvedValueOnce({ combo });

    const { result } = renderHook(() => useCombos(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.createCombo(input);
      expect(mutationResult).toEqual(combo);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(API_ROUTES.combos, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  });

  it("should throw generic error when create combo response has no combo data", async () => {
    const input: ComboFormInput = {
      name: "Combo cắt gội",
      description: "Cắt tóc và gội đầu",
      price: 120000,
      serviceIds: ["service-1"],
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ combos: [] })
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useCombos(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createCombo(input)).rejects.toThrow(
        comboTexts.ownerCombos.errors.generic,
      );
    });
  });

  it("should update a combo by id", async () => {
    const input = {
      id: "combo-1",
      name: "Combo mới",
      description: "Mô tả mới",
      price: 150000,
      serviceIds: ["service-1"],
    };
    const combo = {
      ...createCombo(),
      name: input.name,
      description: input.description,
      price: input.price,
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ combos: [] })
      .mockResolvedValueOnce({ combo });

    const { result } = renderHook(() => useCombos(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.updateCombo(input);
      expect(mutationResult).toEqual(combo);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.comboDetail(input.id),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          price: input.price,
          serviceIds: input.serviceIds,
        }),
      },
    );
  });

  it("should delete a combo by id", async () => {
    const combo = createCombo();

    mocks.fetchClient
      .mockResolvedValueOnce({ combos: [] })
      .mockResolvedValueOnce({ combo });

    const { result } = renderHook(() => useCombos(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const mutationResult = await result.current.deleteCombo(combo.id);
      expect(mutationResult).toEqual(combo);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.comboDetail(combo.id),
      {
        method: "DELETE",
      },
    );
  });
});
