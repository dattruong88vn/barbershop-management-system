import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { APP_NAVIGATION_EVENT } from "@/lib/appNavigation";
import { fetchClient } from "@/lib/fetchClient";

function createJsonResponse(
  body: unknown,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchClient", () => {
  it("should return parsed data on success", async () => {
    const _payload = { ok: true };
    vi.mocked(fetch).mockResolvedValue(createJsonResponse(_payload, 200));

    await expect(fetchClient<typeof _payload>("/api/test")).resolves.toEqual(
      _payload,
    );
  });

  it("should redirect to login on 401", async () => {
    const navigationListener = vi.fn();
    window.addEventListener(APP_NAVIGATION_EVENT, navigationListener);
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 401));

    await expect(fetchClient("/api/test")).rejects.toThrow(
      commonTexts.api.errors.unauthorized,
    );
    expect(navigationListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          href: ROUTES.login,
          signOut: true,
        },
      }),
    );
    window.removeEventListener(APP_NAVIGATION_EVENT, navigationListener);
  });

  it("should redirect to login on 403", async () => {
    const navigationListener = vi.fn();
    window.addEventListener(APP_NAVIGATION_EVENT, navigationListener);
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 403));

    await expect(fetchClient("/api/test")).rejects.toThrow(
      commonTexts.api.errors.forbidden,
    );
    expect(navigationListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          href: ROUTES.login,
          signOut: true,
        },
      }),
    );
    window.removeEventListener(APP_NAVIGATION_EVENT, navigationListener);
  });

  it("should redirect to not found on 404", async () => {
    const navigationListener = vi.fn();
    window.addEventListener(APP_NAVIGATION_EVENT, navigationListener);
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 404));

    await expect(fetchClient("/api/test")).rejects.toThrow(
      commonTexts.api.errors.notFound,
    );
    expect(navigationListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          href: ROUTES.notFound,
        },
      }),
    );
    window.removeEventListener(APP_NAVIGATION_EVENT, navigationListener);
  });

  it("should throw server error on 500", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 500));

    await expect(fetchClient("/api/test")).rejects.toThrow(
      commonTexts.api.errors.serverError,
    );
  });

  it("should surface message from error body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createJsonResponse({ error: "Bad request" }, 400),
    );

    await expect(fetchClient("/api/test")).rejects.toThrow("Bad request");
  });
});
