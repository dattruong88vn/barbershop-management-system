import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { customerTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaFindFirst: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: {
      findFirst: mocks.prismaFindFirst,
    },
  },
}));

import { GET } from "@/app/api/customers/[id]/visits/route";

function createRequest(): NextRequest {
  return new Request(
    "http://localhost/api/customers/customer-1/visits",
  ) as unknown as NextRequest;
}

function createRouteContext(customerId = "customer-1") {
  return {
    params: Promise.resolve({
      id: customerId,
    }),
  };
}

function createCustomerWithVisits() {
  return {
    id: "customer-1",
    name: "Nguyễn Văn Nam",
    phone: "0901234567",
    createdAt: new Date("2026-06-01T01:00:00.000Z"),
    visits: [
      {
        id: "visit-2",
        createdAt: new Date("2026-06-03T02:00:00.000Z"),
        completedAt: new Date("2026-06-03T03:00:00.000Z"),
        lastUpdatedBy: "user-1",
        status: "completed",
        totalPrice: { toString: () => "150000" },
        barber: {
          id: "barber-1",
          username: "barber01",
          status: "active",
        },
        skinner: {
          id: "skinner-1",
          username: "skinner01",
          status: "active",
        },
        visitPhotos: [
          {
            id: "photo-1",
            photoUrl: "https://example.com/photo.jpg",
            createdAt: new Date("2026-06-03T03:10:00.000Z"),
          },
        ],
        visitServices: [
          {
            id: "visit-service-1",
            serviceId: "service-1",
            comboId: null,
            price: { toString: () => "100000" },
            service: {
              isHaircut: true,
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
              comboServices: [],
              name: "Combo gội đầu",
            },
          },
        ],
      },
      {
        id: "visit-1",
        createdAt: new Date("2026-06-02T02:00:00.000Z"),
        completedAt: null,
        lastUpdatedBy: null,
        status: "pending",
        totalPrice: { toString: () => "0" },
        barber: null,
        skinner: null,
        visitPhotos: [],
        visitServices: [],
      },
    ],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/customers/[id]/visits", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createRequest(), createRouteContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.unauthorized,
    });
  });

  it("should return 403 when role is not allowed", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await GET(createRequest(), createRouteContext());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.forbidden,
    });
  });

  it("should return 404 when customer is outside session shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createRouteContext());

    expect(response.status).toBe(404);
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith({
      where: {
        id: "customer-1",
        shopId: "shop-1",
      },
      select: expect.any(Object),
    });
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.notFound,
    });
  });

  it("should return visit history and suggestions from the latest visit", async () => {
    const customer = createCustomerWithVisits();

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "barber",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(customer);

    const response = await GET(createRequest(), createRouteContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith({
      where: {
        id: "customer-1",
        shopId: "shop-1",
      },
      select: expect.objectContaining({
        visits: expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      }),
    });
    await expect(response.json()).resolves.toEqual({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.createdAt.toISOString(),
      },
      visits: [
        {
          id: "visit-2",
          createdAt: "2026-06-03T02:00:00.000Z",
          completedAt: "2026-06-03T03:00:00.000Z",
          lastUpdatedBy: "user-1",
          status: "completed",
          totalPrice: 150000,
          barber: {
            id: "barber-1",
            username: "barber01",
          },
          skinner: {
            id: "skinner-1",
            username: "skinner01",
          },
          photos: [
            {
              id: "photo-1",
              photoUrl: "https://example.com/photo.jpg",
              createdAt: "2026-06-03T03:10:00.000Z",
            },
          ],
          services: [
            {
              id: "visit-service-1",
              isHaircut: true,
              itemId: "service-1",
              name: "Cắt tóc nam",
              type: "service",
              price: 100000,
            },
            {
              id: "visit-service-2",
              isHaircut: false,
              itemId: "combo-1",
              name: "Combo gội đầu",
              type: "combo",
              price: 50000,
            },
          ],
        },
        {
          id: "visit-1",
          createdAt: "2026-06-02T02:00:00.000Z",
          completedAt: null,
          lastUpdatedBy: null,
          status: "pending",
          totalPrice: 0,
          barber: null,
          skinner: null,
          photos: [],
          services: [],
        },
      ],
      suggestions: {
        services: [
          {
            id: "visit-service-1",
            isHaircut: true,
            itemId: "service-1",
            name: "Cắt tóc nam",
            type: "service",
            price: 100000,
          },
          {
            id: "visit-service-2",
            isHaircut: false,
            itemId: "combo-1",
            name: "Combo gội đầu",
            type: "combo",
            price: 50000,
          },
        ],
        barber: {
          id: "barber-1",
          username: "barber01",
        },
        skinner: {
          id: "skinner-1",
          username: "skinner01",
        },
      },
    });
  });

  it("should keep inactive staff in history but omit them from suggestions", async () => {
    const customer = createCustomerWithVisits();
    customer.visits[0].barber = {
      id: "barber-1",
      username: "barber01",
      status: "inactive",
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "barber",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(customer);

    const response = await GET(createRequest(), createRouteContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      visits: [
        {
          barber: {
            id: "barber-1",
            username: "barber01",
          },
        },
        expect.any(Object),
      ],
      suggestions: {
        barber: null,
        skinner: {
          id: "skinner-1",
          username: "skinner01",
        },
      },
    });
  });
});
