import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { serviceTexts } from "@/constants/texts";
import type { ServiceFormInput } from "@/types";

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
    service: {
      create: mocks.prismaCreate,
      findMany: mocks.prismaFindMany,
    },
  },
}));

import { GET, POST } from "@/app/api/services/route";

function createRequest(body?: Partial<ServiceFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/services", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
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

describe("GET /api/services", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.unauthorized,
    });
  });

  it("should return 403 when user is not owner", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "manager",
      shop_id: "shop-1",
    });

    const response = await GET(createRequest());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.forbidden,
    });
  });

  it("should return services filtered by session shop id", async () => {
    const service = createService();

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindMany.mockResolvedValue([service]);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaFindMany).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
      orderBy: { createdAt: "desc" },
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
      services: [
        {
          ...service,
          price: 80000,
          createdAt: service.createdAt.toISOString(),
        },
      ],
    });
  });
});

describe("POST /api/services", () => {
  it("should return 400 when request body is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(createRequest("not-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.invalidRequestBody,
    });
  });

  it("should return 400 when service name is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(
      createRequest({
        name: "",
        price: 80000,
        isHaircut: true,
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.missingName,
    });
  });

  it("should return 400 when service price is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(
      createRequest({
        name: "Cắt tóc nam",
        price: 0,
        isHaircut: true,
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: serviceTexts.api.errors.invalidPrice,
    });
  });

  it("should create service with session shop id", async () => {
    const service = createService();

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaCreate.mockResolvedValue(service);

    const response = await POST(
      createRequest({
        name: " Cắt tóc nam ",
        price: 80000,
        isHaircut: true,
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.prismaCreate).toHaveBeenCalledWith({
      data: {
        shopId: "shop-1",
        name: "Cắt tóc nam",
        price: 80000,
        isHaircut: true,
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
        ...service,
        price: 80000,
        createdAt: service.createdAt.toISOString(),
      },
    });
  });
});
