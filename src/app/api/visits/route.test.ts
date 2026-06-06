import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaComboFindMany: vi.fn(),
  prismaCustomerFindFirst: vi.fn(),
  prismaServiceFindMany: vi.fn(),
  prismaUserFindMany: vi.fn(),
  prismaVisitCreate: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    combo: {
      findMany: mocks.prismaComboFindMany,
    },
    customer: {
      findFirst: mocks.prismaCustomerFindFirst,
    },
    service: {
      findMany: mocks.prismaServiceFindMany,
    },
    user: {
      findMany: mocks.prismaUserFindMany,
    },
    visit: {
      create: mocks.prismaVisitCreate,
    },
  },
}));

import { GET, POST } from "@/app/api/visits/route";

function createGetRequest(): NextRequest {
  return new Request("http://localhost/api/visits") as unknown as NextRequest;
}

function createPostRequest(body?: Record<string, unknown> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/visits", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createStaffToken(role = "receptionist") {
  return {
    id: "user-1",
    role,
    shop_id: "shop-1",
    branch_id: "branch-1",
  };
}

function createVisitRecord() {
  return {
    id: "visit-1",
    createdAt: new Date("2026-06-04T01:00:00.000Z"),
    completedAt: null,
    lastUpdatedBy: "user-1",
    status: "pending",
    totalPrice: { toString: () => "150000" },
    barber: {
      id: "barber-1",
      username: "barber01",
    },
    skinner: {
      id: "skinner-1",
      username: "skinner01",
    },
    visitPhotos: [],
    visitServices: [
      {
        id: "visit-service-1",
        serviceId: "service-1",
        comboId: null,
        price: { toString: () => "100000" },
        service: {
          name: "Cắt tóc nam",
        },
        combo: null,
      },
      {
        id: "visit-service-2",
        serviceId: null,
        comboId: "combo-1",
        price: { toString: () => "50000" },
        service: null,
        combo: {
          name: "Combo gội đầu",
        },
      },
    ],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/visits", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createGetRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.unauthorized,
    });
  });

  it("should return visit create options filtered by session shop", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken("barber"));
    mocks.prismaServiceFindMany.mockResolvedValue([
      {
        id: "service-1",
        name: "Cắt tóc nam",
        price: { toString: () => "100000" },
      },
    ]);
    mocks.prismaComboFindMany.mockResolvedValue([
      {
        id: "combo-1",
        name: "Combo gội đầu",
        price: { toString: () => "50000" },
      },
    ]);
    mocks.prismaUserFindMany
      .mockResolvedValueOnce([
        {
          id: "barber-1",
          username: "barber01",
          role: "barber",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "skinner-1",
          username: "skinner01",
          role: "skinner",
        },
      ]);

    const response = await GET(createGetRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaServiceFindMany).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
    expect(mocks.prismaUserFindMany).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        role: "barber",
        status: "active",
      },
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
    await expect(response.json()).resolves.toEqual({
      services: [
        {
          id: "service-1",
          name: "Cắt tóc nam",
          price: 100000,
        },
      ],
      combos: [
        {
          id: "combo-1",
          name: "Combo gội đầu",
          price: 50000,
        },
      ],
      barbers: [
        {
          id: "barber-1",
          username: "barber01",
          role: "barber",
        },
      ],
      skinners: [
        {
          id: "skinner-1",
          username: "skinner01",
          role: "skinner",
        },
      ],
    });
  });
});

describe("POST /api/visits", () => {
  it("should return 400 when staff has no branch assignment", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });

    const response = await POST(createPostRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.missingBranch,
    });
  });

  it("should return 400 when no services or combos are selected", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken());

    const response = await POST(
      createPostRequest({
        customerId: "customer-1",
        serviceIds: [],
        comboIds: [],
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.missingItems,
    });
  });

  it("should return 400 when customer is outside session shop", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken());
    mocks.prismaCustomerFindFirst.mockResolvedValue(null);

    const response = await POST(
      createPostRequest({
        customerId: "customer-1",
        serviceIds: ["service-1"],
        comboIds: [],
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.prismaCustomerFindFirst).toHaveBeenCalledWith({
      where: {
        id: "customer-1",
        shopId: "shop-1",
      },
      select: { id: true },
    });
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.invalidCustomer,
    });
  });

  it("should return 400 when selected staff does not match shop and role", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken());
    mocks.prismaCustomerFindFirst.mockResolvedValue({ id: "customer-1" });
    mocks.prismaServiceFindMany.mockResolvedValue([
      {
        id: "service-1",
        price: { toString: () => "100000" },
      },
    ]);
    mocks.prismaComboFindMany.mockResolvedValue([]);
    mocks.prismaUserFindMany.mockResolvedValue([]);

    const response = await POST(
      createPostRequest({
        customerId: "customer-1",
        serviceIds: ["service-1"],
        comboIds: [],
        barberId: "barber-1",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.prismaUserFindMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["barber-1"] },
        shopId: "shop-1",
        status: "active",
        OR: [{ id: "barber-1", role: "barber" }],
      },
      select: { id: true },
    });
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.invalidStaff,
    });
  });

  it("should create a pending visit from selected services and combos", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken("skinner"));
    mocks.prismaCustomerFindFirst.mockResolvedValue({ id: "customer-1" });
    mocks.prismaServiceFindMany.mockResolvedValue([
      {
        id: "service-1",
        price: { toString: () => "100000" },
      },
    ]);
    mocks.prismaComboFindMany.mockResolvedValue([
      {
        id: "combo-1",
        price: { toString: () => "50000" },
      },
    ]);
    mocks.prismaUserFindMany.mockResolvedValue([
      {
        id: "barber-1",
      },
      {
        id: "skinner-1",
      },
    ]);
    mocks.prismaVisitCreate.mockResolvedValue(createVisitRecord());

    const response = await POST(
      createPostRequest({
        customerId: "customer-1",
        serviceIds: ["service-1"],
        comboIds: ["combo-1"],
        barberId: "barber-1",
        skinnerId: "skinner-1",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.prismaVisitCreate).toHaveBeenCalledWith({
      data: {
        shopId: "shop-1",
        customerId: "customer-1",
        branchId: "branch-1",
        barberId: "barber-1",
        skinnerId: "skinner-1",
        status: "pending",
        totalPrice: 150000,
        createdBy: "user-1",
        visitServices: {
          create: [
            {
              shopId: "shop-1",
              serviceId: "service-1",
              price: 100000,
            },
            {
              shopId: "shop-1",
              comboId: "combo-1",
              price: 50000,
            },
          ],
        },
      },
      select: expect.any(Object),
    });
    await expect(response.json()).resolves.toEqual({
      visit: {
        id: "visit-1",
        createdAt: "2026-06-04T01:00:00.000Z",
        completedAt: null,
        lastUpdatedBy: "user-1",
        status: "pending",
        totalPrice: 150000,
        barber: {
          id: "barber-1",
          username: "barber01",
        },
        skinner: {
          id: "skinner-1",
          username: "skinner01",
        },
        photos: [],
        services: [
          {
            id: "visit-service-1",
            itemId: "service-1",
            name: "Cắt tóc nam",
            type: "service",
            price: 100000,
          },
          {
            id: "visit-service-2",
            itemId: "combo-1",
            name: "Combo gội đầu",
            type: "combo",
            price: 50000,
          },
        ],
      },
    });
  });
});
