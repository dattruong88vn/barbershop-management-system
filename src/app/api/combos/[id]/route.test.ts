import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { comboTexts } from "@/constants/texts";
import type { ComboFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaComboDelete: vi.fn(),
  prismaComboFindFirst: vi.fn(),
  prismaComboUpdate: vi.fn(),
  prismaServiceFindMany: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    combo: {
      delete: mocks.prismaComboDelete,
      findFirst: mocks.prismaComboFindFirst,
      update: mocks.prismaComboUpdate,
    },
    service: {
      findMany: mocks.prismaServiceFindMany,
    },
  },
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/combos/[id]/route";

function createRequest(body?: Partial<ComboFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/combos/combo-1", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createContext(id = "combo-1") {
  return {
    params: { id },
  };
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
    ],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/combos/[id]", () => {
  it("should return 404 when combo does not belong to session shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaComboFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(404);
    expect(mocks.prismaComboFindFirst).toHaveBeenCalledWith({
      where: {
        id: "combo-1",
        shopId: "shop-1",
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
      error: comboTexts.api.errors.notFound,
    });
  });
});

describe("PATCH /api/combos/[id]", () => {
  it("should return 400 when combo price is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await PATCH(
      createRequest({
        name: "Combo cắt gội",
        description: "Cắt tóc và gội đầu",
        price: 0,
        serviceIds: ["service-1"],
      }),
      createContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: comboTexts.api.errors.invalidPrice,
    });
  });

  it("should update an existing combo scoped to session shop", async () => {
    const combo = createCombo();
    const updatedCombo = {
      ...combo,
      name: "Combo mới",
      description: "Mô tả mới",
      price: { toString: () => "150000" },
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaComboFindFirst.mockResolvedValue(combo);
    mocks.prismaServiceFindMany.mockResolvedValue([{ id: "service-1" }]);
    mocks.prismaComboUpdate.mockResolvedValue(updatedCombo);

    const response = await PATCH(
      createRequest({
        name: " Combo mới ",
        description: " Mô tả mới ",
        price: 150000,
        serviceIds: ["service-1"],
      }),
      createContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.prismaComboUpdate).toHaveBeenCalledWith({
      where: { id: "combo-1" },
      data: {
        name: "Combo mới",
        description: "Mô tả mới",
        price: 150000,
        comboServices: {
          deleteMany: {},
          create: [{ shopId: "shop-1", serviceId: "service-1" }],
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
      combo: {
        ...createExpectedCombo(),
        name: "Combo mới",
        description: "Mô tả mới",
        price: 150000,
      },
    });
  });
});

describe("DELETE /api/combos/[id]", () => {
  it("should delete an existing combo scoped to session shop", async () => {
    const combo = createCombo();

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaComboFindFirst.mockResolvedValue(combo);
    mocks.prismaComboDelete.mockResolvedValue(combo);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaComboDelete).toHaveBeenCalledWith({
      where: { id: "combo-1" },
    });
    await expect(response.json()).resolves.toEqual({
      combo: createExpectedCombo(),
    });
  });
});
