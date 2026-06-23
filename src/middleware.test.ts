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

  it("should allow unauthenticated users to access login", async () => {
    mocks.getToken.mockResolvedValue(null);

    const _response = await middleware(createRequest(ROUTES.login));

    expect(_response.status).toBe(200);
    expect(_response.headers.get("location")).toBeNull();
  });

  it("should redirect authenticated owner users away from login to dashboard", async () => {
    mocks.getToken.mockResolvedValue({
      role: "owner",
      is_first_login: false,
    });

    const _response = await middleware(createRequest(ROUTES.login));

    expect(_response.status).toBe(307);
    expect(_response.headers.get("location")).toBe(
      `http://localhost${ROUTES.dashboard}`,
    );
  });

  it("should redirect authenticated staff users away from login to customers", async () => {
    mocks.getToken.mockResolvedValue({
      role: "barber",
      is_first_login: false,
    });

    const _response = await middleware(createRequest(ROUTES.login));

    expect(_response.status).toBe(307);
    expect(_response.headers.get("location")).toBe(
      `http://localhost${ROUTES.customers}`,
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

  it("should allow owner access to visit routes", async () => {
    mocks.getToken.mockResolvedValue({
      role: "owner",
      is_first_login: false,
    });

    const _response = await middleware(
      createRequest(ROUTES.visitDetail("visit-1")),
    );

    expect(_response.status).toBe(200);
    expect(_response.headers.get("location")).toBeNull();
  });

  it("should allow manager with active branch access to visit routes", async () => {
    mocks.getToken.mockResolvedValue({
      active_branch_id: "branch-1",
      role: "manager",
      is_first_login: false,
    });

    const _response = await middleware(
      createRequest(ROUTES.visitDetail("visit-1")),
    );

    expect(_response.status).toBe(200);
    expect(_response.headers.get("location")).toBeNull();
  });

  it("should redirect staff users away from dashboard to customers", async () => {
    mocks.getToken.mockResolvedValue({
      role: "receptionist",
      is_first_login: false,
    });

    const _response = await middleware(createRequest(ROUTES.dashboard));

    expect(_response.status).toBe(307);
    expect(_response.headers.get("location")).toBe(
      `http://localhost${ROUTES.customers}`,
    );
  });
});
