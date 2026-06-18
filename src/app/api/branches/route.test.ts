import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { branchTexts } from "@/constants/texts";
import type { BranchFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaCreate: vi.fn(),
  prismaFindMany: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: {
      create: mocks.prismaCreate,
      findMany: mocks.prismaFindMany,
    },
  },
}));

import { GET, POST } from "@/app/api/branches/route";

function createRequest(body?: Partial<BranchFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/branches", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/branches", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: branchTexts.api.errors.unauthorized,
    });
  });

  it("should return 403 when user is not owner", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "manager",
      shop_id: null,
    });

    const response = await GET(createRequest());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: branchTexts.api.errors.forbidden,
    });
  });

  it("should return branches filtered by session shop id", async () => {
    const createdAt = new Date("2026-06-03T00:00:00.000Z");
    const branch = {
      id: "branch-1",
      shopId: "shop-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
      createdAt,
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindMany.mockResolvedValue([branch]);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { shopId: "shop-1" },
        orderBy: { createdAt: "desc" },
      }),
    );
    await expect(response.json()).resolves.toEqual({
      branches: [
        {
          ...branch,
          createdAt: createdAt.toISOString(),
        },
      ],
    });
  });
});

describe("POST /api/branches", () => {
  it("should return 400 when request body is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(createRequest("not-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: branchTexts.api.errors.invalidRequestBody,
    });
  });

  it("should return 400 when branch name is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(
      createRequest({
        name: "",
        address: "123 Lê Lợi",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: branchTexts.api.errors.missingName,
    });
  });

  it("should create branch with session shop id", async () => {
    const createdAt = new Date("2026-06-03T00:00:00.000Z");
    const branch = {
      id: "branch-1",
      shopId: "shop-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
      createdAt,
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaCreate.mockResolvedValue(branch);

    const response = await POST(
      createRequest({
        name: " Chi nhánh Quận 1 ",
        address: " 123 Lê Lợi ",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.prismaCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          shopId: "shop-1",
          name: "Chi nhánh Quận 1",
          address: "123 Lê Lợi",
          managerId: null,
        },
      }),
    );
    await expect(response.json()).resolves.toEqual({
      branch: {
        ...branch,
        createdAt: createdAt.toISOString(),
      },
    });
  });
});
