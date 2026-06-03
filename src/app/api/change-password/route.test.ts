import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";
import type { ChangePasswordInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  hashPassword: vi.fn((password: string) => `hashed:${password}`),
  prismaUpdate: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: mocks.prismaUpdate,
    },
  },
}));

import { POST } from "@/app/api/change-password/route";

function createRequest(
  body?: Partial<ChangePasswordInput> | string,
): NextRequest {
  const _requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/change-password", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: _requestBody,
  }) as unknown as NextRequest;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/change-password", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const _response = await POST(createRequest());

    expect(_response.status).toBe(401);
    await expect(_response.json()).resolves.toEqual({
      error: authTexts.api.errors.unauthorized,
    });
  });

  it("should return 400 when request body is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      username: "dat",
    });

    const _response = await POST(createRequest("not-json"));

    expect(_response.status).toBe(400);
    await expect(_response.json()).resolves.toEqual({
      error: authTexts.api.errors.invalidRequestBody,
    });
  });

  it("should return 400 when password is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      username: "dat",
    });

    const _response = await POST(
      createRequest({
        password: "",
        confirmPassword: "Secret123!",
      }),
    );

    expect(_response.status).toBe(400);
    await expect(_response.json()).resolves.toEqual({
      error: authTexts.api.errors.missingPassword,
    });
  });

  it("should return 400 when password is too short", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      username: "dat",
    });

    const _response = await POST(
      createRequest({
        password: "short",
        confirmPassword: "short",
      }),
    );

    expect(_response.status).toBe(400);
    await expect(_response.json()).resolves.toEqual({
      error: authTexts.api.errors.passwordTooShort,
    });
  });

  it("should return 400 when password confirmation does not match", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      username: "dat",
    });

    const _response = await POST(
      createRequest({
        password: "Secret123!",
        confirmPassword: "Secret456!",
      }),
    );

    expect(_response.status).toBe(400);
    await expect(_response.json()).resolves.toEqual({
      error: authTexts.api.errors.passwordMismatch,
    });
  });

  it("should update the user password and return redirect payload", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      username: "dat",
    });
    mocks.prismaUpdate.mockResolvedValue({ id: "user-1" });

    const _response = await POST(
      createRequest({
        password: "Secret123!",
        confirmPassword: "Secret123!",
      }),
    );

    expect(_response.status).toBe(200);
    expect(mocks.hashPassword).toHaveBeenCalledWith("Secret123!");
    expect(mocks.prismaUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        passwordHash: "hashed:Secret123!",
        isFirstLogin: false,
      },
    });
    await expect(_response.json()).resolves.toEqual({
      username: "dat",
      redirectTo: ROUTES.dashboard,
    });
  });
});
