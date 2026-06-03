import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { API_ROUTES } from "@/constants/routes";
import type {
  ChangePasswordInput,
  ChangePasswordResult,
} from "@/types";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

import { useChangePassword } from "@/hooks/useChangePassword";

function createWrapper() {
  const _queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={_queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useChangePassword", () => {
  it("should call the api and return the change password result", async () => {
    const _input: ChangePasswordInput = {
      password: "Secret123!",
      confirmPassword: "Secret123!",
    };
    const _result: ChangePasswordResult = {
      username: "dat",
      redirectTo: "/dashboard",
    };

    mocks.fetchClient.mockResolvedValue(_result);

    const { result } = renderHook(() => useChangePassword(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const _mutationResult = await result.current.mutateAsync(_input);
      expect(_mutationResult).toEqual(_result);
    });

    expect(mocks.fetchClient).toHaveBeenCalledWith(
      API_ROUTES.changePassword,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_input),
      },
    );
  });
});
