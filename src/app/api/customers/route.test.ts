import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { customerTexts } from "@/constants/texts";
import type { CustomerFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaCreate: vi.fn(),
  prismaFindFirst: vi.fn(),
  prismaFindMany: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: {
      create: mocks.prismaCreate,
      findFirst: mocks.prismaFindFirst,
      findMany: mocks.prismaFindMany,
    },
  },
}));

import { GET, POST } from "@/app/api/customers/route";

function createGetRequest(searchTerm = ""): NextRequest {
  const url = searchTerm
    ? `http://localhost/api/customers?search=${encodeURIComponent(searchTerm)}`
    : "http://localhost/api/customers";

  return Object.assign(new Request(url), {
    nextUrl: new URL(url),
  }) as unknown as NextRequest;
}

function createPostRequest(
  body?: Partial<CustomerFormInput> | string,
): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/customers", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createCustomer() {
  return {
    id: "customer-1",
    shopId: "shop-1",
    name: "Nguyễn Văn Nam",
    phone: "0901234567",
    createdAt: new Date("2026-06-03T01:00:00.000Z"),
    visits: [
      {
        id: "visit-1",
        createdAt: new Date("2026-06-03T02:00:00.000Z"),
        completedAt: new Date("2026-06-03T03:00:00.000Z"),
        barber: {
          id: "barber-1",
          username: "barber01",
        },
        skinner: {
          id: "skinner-1",
          username: "skinner01",
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
            price: { toString: () => "80000" },
            service: {
              name: "Cắt tóc nam",
            },
            combo: null,
          },
        ],
      },
    ],
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/customers", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createGetRequest("Nam"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.unauthorized,
    });
  });

  it("should return 403 when role is not allowed", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "superadmin",
      shop_id: "shop-1",
    });

    const response = await GET(createGetRequest("Nam"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.forbidden,
    });
  });

  it("should allow owner and manager customer search", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaFindMany.mockResolvedValue([]);

    const response = await GET(createGetRequest("Nam"));

    expect(response.status).toBe(200);
    expect(mocks.prismaFindMany).toHaveBeenCalled();
  });

  it("should return empty customers when search term is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });

    const response = await GET(createGetRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaFindMany).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ customers: [] });
  });

  it("should search customers by session shop id and format last visit", async () => {
    const customer = createCustomer();

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "barber",
      shop_id: "shop-1",
    });
    mocks.prismaFindMany.mockResolvedValue([customer]);

    const response = await GET(createGetRequest("Nam"));

    expect(response.status).toBe(200);
    expect(mocks.prismaFindMany).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        OR: [
          { name: { contains: "Nam", mode: "insensitive" } },
          { phone: { contains: "Nam" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: expect.any(Object),
    });
    await expect(response.json()).resolves.toEqual({
      customers: [
        {
          id: customer.id,
          shopId: customer.shopId,
          name: customer.name,
          phone: customer.phone,
          createdAt: customer.createdAt.toISOString(),
          lastVisit: {
            id: customer.visits[0].id,
            createdAt: customer.visits[0].createdAt.toISOString(),
            completedAt: customer.visits[0].completedAt.toISOString(),
            barber: customer.visits[0].barber,
            skinner: customer.visits[0].skinner,
            photos: [
              {
                id: "photo-1",
                photoUrl: "https://example.com/photo.jpg",
                createdAt:
                  customer.visits[0].visitPhotos[0].createdAt.toISOString(),
              },
            ],
            services: [
              {
                id: "visit-service-1",
                name: "Cắt tóc nam",
                type: "service",
                price: 80000,
              },
            ],
          },
        },
      ],
    });
  });
});

describe("POST /api/customers", () => {
  it("should return 400 when request body is invalid", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });

    const response = await POST(createPostRequest("not-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.invalidRequestBody,
    });
  });

  it("should return 400 when customer name is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });

    const response = await POST(
      createPostRequest({
        name: "",
        phone: "0901234567",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.missingName,
    });
  });

  it("should return 400 when customer phone is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });

    const response = await POST(
      createPostRequest({
        name: "Nguyễn Văn Nam",
        phone: "",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.missingPhone,
    });
  });

  it("should create customer with session shop id", async () => {
    const customer = {
      ...createCustomer(),
      visits: [],
    };

    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "skinner",
      shop_id: "shop-1",
    });
    mocks.prismaCreate.mockResolvedValue(customer);
    mocks.prismaFindFirst.mockResolvedValue(null);

    const response = await POST(
      createPostRequest({
        name: " Nguyễn Văn Nam ",
        phone: " 0901234567 ",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.prismaFindFirst).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        phone: "0901234567",
      },
      select: { id: true },
    });
    expect(mocks.prismaCreate).toHaveBeenCalledWith({
      data: {
        shopId: "shop-1",
        name: "Nguyễn Văn Nam",
        phone: "0901234567",
      },
      select: expect.any(Object),
    });
    await expect(response.json()).resolves.toEqual({
      customer: {
        id: customer.id,
        shopId: customer.shopId,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.createdAt.toISOString(),
        lastVisit: null,
      },
    });
  });

  it("should return 400 when phone already exists in the same shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue({ id: "customer-1" });

    const response = await POST(
      createPostRequest({
        name: "Nguyễn Văn Nam",
        phone: "0901234567",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.prismaCreate).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.duplicatePhone,
    });
  });

  it("should return 400 when database unique constraint rejects duplicate phone", async () => {
    mocks.getToken.mockResolvedValue({
      id: "user-1",
      role: "receptionist",
      shop_id: "shop-1",
    });
    mocks.prismaFindFirst.mockResolvedValue(null);
    mocks.prismaCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        clientVersion: "6.19.3",
        code: "P2002",
      }),
    );

    const response = await POST(
      createPostRequest({
        name: "Nguyễn Văn Nam",
        phone: "0901234567",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: customerTexts.api.errors.duplicatePhone,
    });
  });
});
