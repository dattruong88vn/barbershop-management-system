import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { branchTexts } from "@/constants/texts";
import type { BranchFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaDelete: vi.fn(),
  prismaFindFirst: vi.fn(),
  prismaUpdate: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: {
      delete: mocks.prismaDelete,
      findFirst: mocks.prismaFindFirst,
      update: mocks.prismaUpdate,
    },
  },
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/branches/[id]/route";

function createRequest(body?: Partial<BranchFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/branches/branch-1", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createContext(id = "branch-1") {
  return {
    params: Promise.resolve({ id }),
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/branches/[id]", () => {
  it("should return 404 when branch does not belong to session shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(404);
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith({
      where: {
        id: "branch-1",
        shopId: "shop-1",
      },
      select: {
        id: true,
        shopId: true,
        name: true,
        address: true,
        createdAt: true,
      },
    });
    await expect(response.json()).resolves.toEqual({
      error: branchTexts.api.errors.notFound,
    });
  });
});

describe("PATCH /api/branches/[id]", () => {
  it("should return 400 when branch address is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await PATCH(
      createRequest({
        name: "Chi nhánh Quận 1",
        address: "",
      }),
      createContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: branchTexts.api.errors.missingAddress,
    });
  });

  it("should update an existing branch scoped to session shop", async () => {
    const createdAt = new Date("2026-06-03T00:00:00.000Z");
    const branch = {
      id: "branch-1",
      shopId: "shop-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
      createdAt,
    };
    const updatedBranch = {
      ...branch,
      name: "Chi nhánh Quận 3",
      address: "456 Nguyễn Đình Chiểu",
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(branch);
    mocks.prismaUpdate.mockResolvedValue(updatedBranch);

    const response = await PATCH(
      createRequest({
        name: " Chi nhánh Quận 3 ",
        address: " 456 Nguyễn Đình Chiểu ",
      }),
      createContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.prismaUpdate).toHaveBeenCalledWith({
      where: { id: "branch-1" },
      data: {
        name: "Chi nhánh Quận 3",
        address: "456 Nguyễn Đình Chiểu",
      },
      select: {
        id: true,
        shopId: true,
        name: true,
        address: true,
        createdAt: true,
      },
    });
    await expect(response.json()).resolves.toEqual({
      branch: {
        ...updatedBranch,
        createdAt: createdAt.toISOString(),
      },
    });
  });
});

describe("DELETE /api/branches/[id]", () => {
  it("should delete an existing branch scoped to session shop", async () => {
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
    mocks.prismaFindFirst.mockResolvedValue(branch);
    mocks.prismaDelete.mockResolvedValue(branch);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaDelete).toHaveBeenCalledWith({
      where: { id: "branch-1" },
    });
    await expect(response.json()).resolves.toEqual({
      branch: {
        ...branch,
        createdAt: createdAt.toISOString(),
      },
    });
  });
});
