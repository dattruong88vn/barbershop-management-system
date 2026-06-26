import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));

import { fetchServer } from "@/lib/fetchServer";

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
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("fetchServer", () => {
  it("should return parsed data on success", async () => {
    const _payload = { ok: true };
    vi.mocked(fetch).mockResolvedValue(createJsonResponse(_payload, 200));

    await expect(fetchServer<typeof _payload>("/api/test")).resolves.toEqual(
      _payload,
    );
    expect(fetch).toHaveBeenCalledWith("/api/test", { cache: "no-store" });
  });

  it("should redirect to login on 401", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 401));

    await expect(fetchServer("/api/test")).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith(ROUTES.login);
  });

  it("should redirect to login on 403", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 403));

    await expect(fetchServer("/api/test")).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith(ROUTES.login);
  });

  it("should call notFound on 404", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse({}, 404));

    await expect(fetchServer("/api/test")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });

  it("should surface message from error body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createJsonResponse({ error: "Service unavailable" }, 500),
    );

    await expect(fetchServer("/api/test")).rejects.toThrow(
      "Service unavailable",
    );
  });

  it("should fall back to generic server error for non-object body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("oops", {
        status: 500,
        headers: {
          "content-type": "text/plain",
        },
      }),
    );

    await expect(fetchServer("/api/test")).rejects.toThrow(
      commonTexts.api.errors.serverError,
    );
  });
});
