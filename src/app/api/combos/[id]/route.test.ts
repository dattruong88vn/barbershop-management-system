import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { comboTexts } from "@/constants/texts";
import type { ComboFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  branchFindFirst: vi.fn(),
  getToken: vi.fn(),
  prismaComboFindFirst: vi.fn(),
  prismaComboUpdate: vi.fn(),
  prismaServiceFindMany: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: { findFirst: mocks.branchFindFirst },
    combo: {
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
    params: Promise.resolve({ id }),
  };
}

function createCombo() {
  return {
    id: "combo-1",
    shopId: "shop-1",
    branchId: null,
    branch: null,
    name: "Combo cắt gội",
    description: "Cắt tóc và gội đầu",
    price: { toString: () => "120000" },
    createdBy: "user-1",
    creator: { id: "user-1", role: "owner", username: "owner" },
    createdAt: new Date("2026-06-03T00:00:00.000Z"),
    deletedAt: null,
    _count: { visitServices: 0 },
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
    branchId: null,
    branch: null,
    canDelete: true,
    canEdit: true,
    createdBy: "user-1",
    creator: combo.creator,
    isUsedInVisit: false,
    scope: "shop",
    name: combo.name,
    description: combo.description,
    price: 120000,
    createdAt: combo.createdAt.toISOString(),
    deletedAt: null,
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
    expect(mocks.prismaComboFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "combo-1",
          deletedAt: null,
          shopId: "shop-1",
        },
      }),
    );
    await expect(response.json()).resolves.toEqual({
      error: comboTexts.api.errors.notFound,
    });
  });

  it("should reject a manager whose selected branch is no longer managed", async () => {
    mocks.getToken.mockResolvedValue({
      id: "manager-1",
      role: "manager",
      shop_id: "shop-1",
      branch_id: "branch-2",
    });
    mocks.branchFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(403);
    expect(mocks.prismaComboFindFirst).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: comboTexts.api.errors.forbidden });
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
  it("should soft delete an existing combo scoped to session shop", async () => {
    const combo = createCombo();
    const deletedCombo = {
      ...combo,
      deletedAt: new Date("2026-06-22T00:00:00.000Z"),
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaComboFindFirst.mockResolvedValue(combo);
    mocks.prismaComboUpdate.mockResolvedValue(deletedCombo);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaComboUpdate).toHaveBeenCalledWith({
      where: { id: "combo-1" },
      data: { deletedAt: expect.any(Date) },
      select: expect.objectContaining({ id: true, deletedAt: true }),
    });
    await expect(response.json()).resolves.toEqual({
      combo: {
        ...createExpectedCombo(),
        deletedAt: deletedCombo.deletedAt.toISOString(),
      },
    });
  });
});
