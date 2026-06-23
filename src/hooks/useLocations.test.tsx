import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import type { Province, Ward } from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import {
  LOCATION_PROVINCES_QUERY_KEY,
  LOCATION_WARDS_STALE_TIME_MS,
  locationWardsQueryKey,
  useLocations,
} from "@/hooks/useLocations";

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

afterEach(() => {
  vi.clearAllMocks();
});

describe("useLocations", () => {
  it("should fetch provinces and wards by selected province code", async () => {
    const province: Province = {
      code: "79",
      fullName: "Thành phố Hồ Chí Minh",
      name: "Hồ Chí Minh",
      type: "municipality",
    };
    const ward: Ward = {
      code: "26734",
      fullName: "Phường Bến Nghé",
      name: "Bến Nghé",
      provinceCode: province.code,
      type: "ward",
    };

    mocks.fetchClient
      .mockResolvedValueOnce({ provinces: [province] })
      .mockResolvedValueOnce({ wards: [ward] });

    const { result } = renderHook(() => useLocations(province.code), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.provinces).toEqual([province]);
        expect(result.current.wards).toEqual([ward]);
      });
    });
    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.locationProvinces,
    );
    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.locationWards(province.code),
    );
  });

  it("should expose stable location query keys", () => {
    expect(LOCATION_PROVINCES_QUERY_KEY).toEqual(["locations", "provinces"]);
    expect(LOCATION_WARDS_STALE_TIME_MS).toBe(1000 * 60 * 60 * 24);
    expect(locationWardsQueryKey("79")).toEqual(["locations", "wards", "79"]);
  });
});
