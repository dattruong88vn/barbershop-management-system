import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaComboFindMany: vi.fn(),
  prismaBranchFindFirst: vi.fn(),
  prismaCustomerFindFirst: vi.fn(),
  prismaServiceFindMany: vi.fn(),
  prismaUserFindMany: vi.fn(),
  prismaVisitCreate: vi.fn(),
  prismaVisitFindMany: vi.fn(),
  prismaVisitFindFirst: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    combo: {
      findMany: mocks.prismaComboFindMany,
    },
    branch: {
      findFirst: mocks.prismaBranchFindFirst,
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
      findMany: mocks.prismaVisitFindMany,
      findFirst: mocks.prismaVisitFindFirst,
    },
  },
}));

import { GET, POST } from "@/app/api/visits/route";

function createGetRequest(): NextRequest {
  return new Request("http://localhost/api/visits") as unknown as NextRequest;
}

function createVisitListRequest(status = "pending"): NextRequest {
  return new Request(
    `http://localhost/api/visits?status=${status}`,
  ) as unknown as NextRequest;
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
    branchId: "branch-1",
    branchNameSnapshot: "Chi nhánh Quận 1",
    branchAddressSnapshot: "123 Lê Lợi",
    createdAt: new Date("2026-06-04T01:00:00.000Z"),
    completedAt: null,
    lastUpdatedBy: "user-1",
    status: "pending",
    totalPrice: { toString: () => "100000" },
    customer: {
      id: "customer-1",
      name: "Nguyễn Văn Nam",
      phone: "0901234567",
    },
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
          isHaircut: false,
          name: "Cắt tóc nam",
        },
        combo: null,
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
    expect(mocks.prismaServiceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ shopId: "shop-1" }),
      }),
    );
    expect(mocks.prismaUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          branchId: "branch-1",
          shopId: "shop-1",
          role: "barber",
          status: "active",
        }),
      }),
    );
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

  it("should allow owners to list visits across the shop without branch scope", async () => {
    const visit = createVisitRecord();

    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaVisitFindMany.mockResolvedValue([visit]);

    const response = await GET(createVisitListRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaVisitFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          branchId: expect.any(String),
        }),
      }),
    );
    expect(mocks.prismaVisitFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          shopId: "shop-1",
          status: "pending",
        }),
      }),
    );
    await expect(response.json()).resolves.toEqual({
      visits: [
        expect.objectContaining({
          id: visit.id,
          customer: visit.customer,
          status: visit.status,
        }),
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

  it("should return 400 when services and combos are selected together", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken());

    const response = await POST(
      createPostRequest({
        customerId: "customer-1",
        serviceIds: ["service-1"],
        comboIds: ["combo-1"],
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.prismaCustomerFindFirst).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.mixedItems,
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
    mocks.prismaVisitFindFirst.mockResolvedValue(null);
    mocks.prismaBranchFindFirst.mockResolvedValue({
      id: "branch-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
    });
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
        branchId: "branch-1",
        status: "active",
        OR: [{ id: "barber-1", role: "barber" }],
      },
      select: { id: true },
    });
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.invalidStaff,
    });
  });

  it("should create a pending visit from selected services", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken("skinner"));
    mocks.prismaCustomerFindFirst.mockResolvedValue({ id: "customer-1" });
    mocks.prismaVisitFindFirst.mockResolvedValue(null);
    mocks.prismaBranchFindFirst.mockResolvedValue({
      id: "branch-1",
      name: "Chi nhánh Quận 1",
      address: "123 Lê Lợi",
    });
    mocks.prismaServiceFindMany.mockResolvedValue([
      {
        id: "service-1",
        price: { toString: () => "100000" },
      },
    ]);
    mocks.prismaComboFindMany.mockResolvedValue([]);
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
        comboIds: [],
        barberId: "barber-1",
        skinnerId: "skinner-1",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.prismaVisitCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shopId: "shop-1",
          customerId: "customer-1",
          branchId: "branch-1",
          branchNameSnapshot: "Chi nhánh Quận 1",
          branchAddressSnapshot: "123 Lê Lợi",
          barberId: "barber-1",
          skinnerId: "skinner-1",
          status: "pending",
          totalPrice: 100000,
          createdBy: "user-1",
          visitServices: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                shopId: "shop-1",
                serviceId: "service-1",
                price: 100000,
              }),
            ]),
          }),
        }),
      }),
    );
    await expect(response.json()).resolves.toEqual({
      visit: {
        id: "visit-1",
        branch: {
          id: "branch-1",
          name: "Chi nhánh Quận 1",
          address: "123 Lê Lợi",
        },
        createdAt: "2026-06-04T01:00:00.000Z",
        completedAt: null,
        lastUpdatedBy: "user-1",
        status: "pending",
        totalPrice: 100000,
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
            isHaircut: false,
            itemId: "service-1",
            name: "Cắt tóc nam",
            type: "service",
            price: 100000,
          },
        ],
      },
    });
  });
});
