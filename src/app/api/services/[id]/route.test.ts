import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { serviceTexts } from "@/constants/texts";
import type { ServiceFormInput } from "@/types";

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
    service: {
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
    name: "Cắt tóc nam",
    price: { toString: () => "80000" },
    isHaircut: true,
    createdAt: new Date("2026-06-03T00:00:00.000Z"),
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
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith({
      where: {
        id: "service-1",
        shopId: "shop-1",
      },
      select: {
        id: true,
        shopId: true,
        name: true,
        price: true,
        isHaircut: true,
        createdAt: true,
      },
    });
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.notFound,
    });
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
        isHaircut: false,
      },
      select: {
        id: true,
        shopId: true,
        name: true,
        price: true,
        isHaircut: true,
        createdAt: true,
      },
    });
    await expect(response.json()).resolves.toEqual({
      service: {
        ...updatedService,
        price: 50000,
        createdAt: service.createdAt.toISOString(),
      },
    });
  });
});

describe("DELETE /api/services/[id]", () => {
  it("should delete an existing service scoped to session shop", async () => {
    const service = createService();

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(service);
    mocks.prismaDelete.mockResolvedValue(service);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaDelete).toHaveBeenCalledWith({
      where: { id: "service-1" },
    });
    await expect(response.json()).resolves.toEqual({
      service: {
        ...service,
        price: 80000,
        createdAt: service.createdAt.toISOString(),
      },
    });
  });
});
