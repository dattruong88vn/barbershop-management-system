import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { serviceTexts } from "@/constants/texts";
import type { ServiceFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  branchFindFirst: vi.fn(),
  getToken: vi.fn(),
  prismaFindFirst: vi.fn(),
  prismaUpdate: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: { findFirst: mocks.branchFindFirst },
    service: {
      findFirst: mocks.prismaFindFirst,
      update: mocks.prismaUpdate,
    },
  },
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/services/[id]/route";

function createRequest(body?: Partial<ServiceFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/services/service-1", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createContext(id = "service-1") {
  return {
    params: Promise.resolve({ id }),
  };
}

function createService() {
  return {
    id: "service-1",
    shopId: "shop-1",
    branchId: null,
    branch: null,
    name: "Cắt tóc nam",
    price: { toString: () => "80000" },
    responsibleRole: "barber",
    isHaircut: true,
    createdBy: "user-1",
    creator: {
      id: "user-1",
      fullName: "Chủ tiệm",
      role: "owner",
      username: "owner",
    },
    createdAt: new Date("2026-06-03T00:00:00.000Z"),
    deletedAt: null,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/services/[id]", () => {
  it("should return 404 when service does not belong to session shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(404);
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "service-1",
          deletedAt: null,
          shopId: "shop-1",
        },
      }),
    );
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.notFound,
    });
  });

  it("should limit managers to shop services and their selected managed branch", async () => {
    mocks.getToken.mockResolvedValue({
      id: "manager-1",
      role: "manager",
      shop_id: "shop-1",
      branch_id: "branch-2",
    });
    mocks.branchFindFirst.mockResolvedValue({ id: "branch-2" });
    mocks.prismaFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(mocks.branchFindFirst).toHaveBeenCalledWith({
      where: {
        id: "branch-2",
        managerId: "manager-1",
        shopId: "shop-1",
        status: "active",
      },
      select: { id: true },
    });
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: "service-1",
        deletedAt: null,
        shopId: "shop-1",
        OR: [{ branchId: null }, { branchId: "branch-2" }],
      },
    }));
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/services/[id]", () => {
  it("should return 400 when service price is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await PATCH(
      createRequest({
        name: "Cắt tóc nam",
        price: 0,
        responsibleRole: "barber",
        isHaircut: true,
      }),
      createContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.invalidPrice,
    });
  });

  it("should update an existing service scoped to session shop", async () => {
    const service = createService();
    const updatedService = {
      ...service,
      name: "Gội đầu",
      price: { toString: () => "50000" },
      responsibleRole: "skinner",
      isHaircut: false,
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(service);
    mocks.prismaUpdate.mockResolvedValue(updatedService);

    const response = await PATCH(
      createRequest({
        name: " Gội đầu ",
        price: 50000,
        responsibleRole: "skinner",
        isHaircut: false,
      }),
      createContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.prismaUpdate).toHaveBeenCalledWith({
      where: { id: "service-1" },
      data: {
        name: "Gội đầu",
        price: 50000,
        responsibleRole: "skinner",
        isHaircut: false,
      },
      select: expect.objectContaining({ id: true, deletedAt: true }),
    });
    await expect(response.json()).resolves.toEqual({
      service: {
        ...updatedService,
        canDelete: true,
        canEdit: true,
        price: 50000,
        scope: "shop",
        createdAt: service.createdAt.toISOString(),
      },
    });
  });
});

describe("DELETE /api/services/[id]", () => {
  it("should soft delete an existing service scoped to session shop", async () => {
    const service = createService();
    const deletedService = {
      ...service,
      deletedAt: new Date("2026-06-22T00:00:00.000Z"),
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(service);
    mocks.prismaUpdate.mockResolvedValue(deletedService);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaUpdate).toHaveBeenCalledWith({
      where: { id: "service-1" },
      data: { deletedAt: expect.any(Date) },
      select: expect.objectContaining({ id: true, deletedAt: true }),
    });
    await expect(response.json()).resolves.toEqual({
      service: expect.objectContaining({
        id: "service-1",
        deletedAt: deletedService.deletedAt.toISOString(),
        price: 80000,
      }),
    });
  });
});
