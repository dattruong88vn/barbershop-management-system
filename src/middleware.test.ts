import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

import { middleware } from "@/middleware";

function createRequest(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("middleware", () => {
  it("should redirect unauthenticated users to login", async () => {
    mocks.getToken.mockResolvedValue(null);

    const _response = await middleware(createRequest(ROUTES.dashboard));

    expect(_response.status).toBe(307);
    expect(_response.headers.get("location")).toBe(
      `http://localhost${ROUTES.login}`,
    );
  });

  it("should force first login users to change password", async () => {
    mocks.getToken.mockResolvedValue({
      role: "owner",
      is_first_login: true,
    });

    const _response = await middleware(createRequest(ROUTES.dashboard));

    expect(_response.status).toBe(307);
    expect(_response.headers.get("location")).toBe(
      `http://localhost${ROUTES.changePassword}`,
    );
  });

  it("should allow first login users to access change password page", async () => {
    mocks.getToken.mockResolvedValue({
      role: "owner",
      is_first_login: true,
    });

    const _response = await middleware(createRequest(ROUTES.changePassword));

    expect(_response.status).toBe(200);
    expect(_response.headers.get("location")).toBeNull();
  });

  it("should allow owner access to owner service pages", async () => {
    mocks.getToken.mockResolvedValue({
      role: "owner",
      is_first_login: false,
    });

    const _response = await middleware(createRequest(ROUTES.ownerServices));

    expect(_response.status).toBe(200);
    expect(_response.headers.get("location")).toBeNull();
  });

  it("should redirect owner away from forbidden routes", async () => {
    mocks.getToken.mockResolvedValue({
      role: "owner",
      is_first_login: false,
    });

    const _response = await middleware(createRequest(ROUTES.visits));

    expect(_response.status).toBe(307);
    expect(_response.headers.get("location")).toBe(
      `http://localhost${ROUTES.dashboard}`,
    );
  });
});
