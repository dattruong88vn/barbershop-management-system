import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { comboTexts } from "@/constants/texts";
import type { ComboFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaComboCreate: vi.fn(),
  prismaComboFindMany: vi.fn(),
  prismaServiceFindMany: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    combo: {
      create: mocks.prismaComboCreate,
      findMany: mocks.prismaComboFindMany,
    },
    service: {
      findMany: mocks.prismaServiceFindMany,
    },
  },
}));

import { GET, POST } from "@/app/api/combos/route";

function createRequest(body?: Partial<ComboFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/combos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createCombo() {
  return {
    id: "combo-1",
    shopId: "shop-1",
    name: "Combo cắt gội",
    description: "Cắt tóc và gội đầu",
    price: { toString: () => "120000" },
    createdAt: new Date("2026-06-03T00:00:00.000Z"),
    comboServices: [
      {
        service: {
          id: "service-1",
          name: "Cắt tóc nam",
          price: { toString: () => "80000" },
          isHaircut: true,
        },
      },
      {
        service: {
          id: "service-2",
          name: "Gội đầu",
          price: { toString: () => "50000" },
          isHaircut: false,
        },
      },
    ],
  };
}

function createExpectedCombo() {
  const combo = createCombo();

  return {
    id: combo.id,
    shopId: combo.shopId,
    name: combo.name,
    description: combo.description,
    price: 120000,
    createdAt: combo.createdAt.toISOString(),
    services: [
      {
        id: "service-1",
        name: "Cắt tóc nam",
        price: 80000,
        isHaircut: true,
      },
      {
        id: "service-2",
        name: "Gội đầu",
        price: 50000,
        isHaircut: false,
      },
    ],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/combos", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: comboTexts.api.errors.unauthorized,
    });
  });

  it("should return combos filtered by session shop id", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaComboFindMany.mockResolvedValue([createCombo()]);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaComboFindMany).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
      orderBy: { createdAt: "desc" },
      select: expect.objectContaining({
        id: true,
        shopId: true,
        name: true,
        description: true,
        price: true,
        createdAt: true,
      }),
    });
    await expect(response.json()).resolves.toEqual({
      combos: [createExpectedCombo()],
    });
  });
});

describe("POST /api/combos", () => {
  it("should return 400 when service list is empty", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(
      createRequest({
        name: "Combo cắt gội",
        description: "Cắt tóc và gội đầu",
        price: 120000,
        serviceIds: [],
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: comboTexts.api.errors.missingServices,
    });
  });

  it("should return 400 when selected services do not belong to shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaServiceFindMany.mockResolvedValue([{ id: "service-1" }]);

    const response = await POST(
      createRequest({
        name: "Combo cắt gội",
        description: "Cắt tóc và gội đầu",
        price: 120000,
        serviceIds: ["service-1", "service-2"],
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: comboTexts.api.errors.invalidServices,
    });
  });

  it("should create combo with selected services scoped to session shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaServiceFindMany.mockResolvedValue([
      { id: "service-1" },
      { id: "service-2" },
    ]);
    mocks.prismaComboCreate.mockResolvedValue(createCombo());

    const response = await POST(
      createRequest({
        name: " Combo cắt gội ",
        description: " Cắt tóc và gội đầu ",
        price: 120000,
        serviceIds: ["service-1", "service-2"],
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.prismaServiceFindMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["service-1", "service-2"] },
        shopId: "shop-1",
      },
      select: { id: true },
    });
    expect(mocks.prismaComboCreate).toHaveBeenCalledWith({
      data: {
        shopId: "shop-1",
        name: "Combo cắt gội",
        description: "Cắt tóc và gội đầu",
        price: 120000,
        comboServices: {
          create: [
            { shopId: "shop-1", serviceId: "service-1" },
            { shopId: "shop-1", serviceId: "service-2" },
          ],
        },
      },
      select: expect.objectContaining({
        id: true,
        shopId: true,
        name: true,
        description: true,
        price: true,
        createdAt: true,
      }),
    });
    await expect(response.json()).resolves.toEqual({
      combo: createExpectedCombo(),
    });
  });
});
