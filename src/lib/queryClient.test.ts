import { describe, expect, it, vi } from "vitest";

import { commonTexts } from "@/constants/texts";
import {
  API_SERVER_ERROR_EVENT,
  createQueryClient,
} from "@/lib/queryClient";

describe("createQueryClient", () => {
  it("should dispatch a toast event for server errors", () => {
    const _dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const _queryClient = createQueryClient();

    _queryClient.getQueryCache().config.onError?.(
      new Error(commonTexts.api.errors.serverError),
      null as never,
      _queryClient,
    );

    expect(_dispatchSpy).toHaveBeenCalledTimes(1);
    const _event = _dispatchSpy.mock.calls[0]?.[0] as CustomEvent<string>;

    expect(_event.type).toBe(API_SERVER_ERROR_EVENT);
    expect(_event.detail).toBe(commonTexts.api.errors.serverErrorToast);
  });

  it("should ignore non server errors", () => {
    const _dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const _queryClient = createQueryClient();

    _queryClient.getQueryCache().config.onError?.(
      new Error("Network error"),
      null as never,
      _queryClient,
    );

    expect(_dispatchSpy).not.toHaveBeenCalled();
  });
});
