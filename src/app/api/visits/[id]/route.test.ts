import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  prismaUserFindMany: vi.fn(),
  prismaVisitFindFirst: vi.fn(),
  prismaVisitUpdate: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mocks.prismaUserFindMany,
    },
    visit: {
      findFirst: mocks.prismaVisitFindFirst,
      update: mocks.prismaVisitUpdate,
    },
  },
}));

import { PATCH } from "@/app/api/visits/[id]/route";

function createRequest(body?: Record<string, unknown> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/visits/visit-1", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createRouteContext(visitId = "visit-1") {
  return {
    params: Promise.resolve({
      id: visitId,
    }),
  };
}

function createStaffToken(role = "receptionist") {
  return {
    id: "user-1",
    role,
    shop_id: "shop-1",
  };
}

function createVisitRecord() {
  return {
    id: "visit-1",
    createdAt: new Date("2026-06-04T01:00:00.000Z"),
    completedAt: new Date("2026-06-04T02:00:00.000Z"),
    lastUpdatedBy: "user-1",
    status: "completed",
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
        price: { toString: () => "150000" },
        service: {
          name: "Cắt tóc nam",
        },
        combo: null,
      },
    ],
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("PATCH /api/visits/[id]", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await PATCH(createRequest(), createRouteContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.unauthorized,
    });
  });

  it("should return 400 when completed visit is past the edit window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-04T06:00:01.000Z"));
    mocks.getToken.mockResolvedValue(createStaffToken());
    mocks.prismaVisitFindFirst.mockResolvedValue({
      id: "visit-1",
      completedAt: new Date("2026-06-04T03:00:00.000Z"),
      status: "completed",
    });

    const response = await PATCH(
      createRequest({
        barberId: "barber-1",
        skinnerId: "skinner-1",
      }),
      createRouteContext(),
    );

    expect(response.status).toBe(400);
    expect(mocks.prismaVisitUpdate).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.lockedStaffEdit,
    });
  });

  it("should return 400 when visit is not completed", async () => {
    mocks.getToken.mockResolvedValue(createStaffToken());
    mocks.prismaVisitFindFirst.mockResolvedValue({
      id: "visit-1",
      completedAt: null,
      status: "pending",
    });

    const response = await PATCH(
      createRequest({
        barberId: "barber-1",
      }),
      createRouteContext(),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.notCompleted,
    });
  });

  it("should validate selected staff by session shop and role", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-04T04:00:00.000Z"));
    mocks.getToken.mockResolvedValue(createStaffToken("barber"));
    mocks.prismaVisitFindFirst.mockResolvedValue({
      id: "visit-1",
      completedAt: new Date("2026-06-04T03:00:00.000Z"),
      status: "completed",
    });
    mocks.prismaUserFindMany.mockResolvedValue([]);

    const response = await PATCH(
      createRequest({
        barberId: "barber-1",
        skinnerId: "skinner-1",
      }),
      createRouteContext(),
    );

    expect(response.status).toBe(400);
    expect(mocks.prismaUserFindMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["barber-1", "skinner-1"] },
        shopId: "shop-1",
        OR: [
          { id: "barber-1", role: "barber" },
          { id: "skinner-1", role: "skinner" },
        ],
      },
      select: { id: true },
    });
    await expect(response.json()).resolves.toEqual({
      error: visitTexts.api.errors.invalidStaff,
    });
  });

  it("should update barber, skinner, and last updated user within edit window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-04T04:00:00.000Z"));
    mocks.getToken.mockResolvedValue(createStaffToken("skinner"));
    mocks.prismaVisitFindFirst.mockResolvedValue({
      id: "visit-1",
      completedAt: new Date("2026-06-04T03:00:00.000Z"),
      status: "completed",
    });
    mocks.prismaUserFindMany.mockResolvedValue([
      {
        id: "barber-1",
      },
      {
        id: "skinner-1",
      },
    ]);
    mocks.prismaVisitUpdate.mockResolvedValue(createVisitRecord());

    const response = await PATCH(
      createRequest({
        barberId: "barber-1",
        skinnerId: "skinner-1",
      }),
      createRouteContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.prismaVisitUpdate).toHaveBeenCalledWith({
      where: { id: "visit-1" },
      data: {
        barberId: "barber-1",
        skinnerId: "skinner-1",
        lastUpdatedBy: "user-1",
      },
      select: expect.any(Object),
    });
    await expect(response.json()).resolves.toEqual({
      visit: {
        id: "visit-1",
        createdAt: "2026-06-04T01:00:00.000Z",
        completedAt: "2026-06-04T02:00:00.000Z",
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
        photos: [],
        services: [
          {
            id: "visit-service-1",
            itemId: "service-1",
            name: "Cắt tóc nam",
            type: "service",
            price: 150000,
          },
        ],
      },
    });
  });
});
