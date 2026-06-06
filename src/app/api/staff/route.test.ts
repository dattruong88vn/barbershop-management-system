import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffTexts } from "@/constants/texts";
import type { StaffFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  hashPassword: vi.fn((password: string) => `hashed:${password}`),
  prismaBranchFindFirst: vi.fn(),
  prismaUserCreate: vi.fn(),
  prismaUserFindMany: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/lib/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: {
      findFirst: mocks.prismaBranchFindFirst,
    },
    user: {
      create: mocks.prismaUserCreate,
      findMany: mocks.prismaUserFindMany,
    },
  },
}));

import { GET, POST } from "@/app/api/staff/route";

function createRequest(body?: Partial<StaffFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/staff", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createStaffMember() {
  return {
    id: "staff-1",
    shopId: "shop-1",
    branchId: "branch-1",
    username: "barber01",
    role: "barber",
    status: "active",
    isFirstLogin: true,
    createdAt: new Date("2026-06-03T00:00:00.000Z"),
    branch: {
      id: "branch-1",
      name: "Chi nhánh Quận 1",
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/staff", () => {
  it("should return 401 when token is missing", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: staffTexts.api.errors.unauthorized,
    });
  });

  it("should return staff filtered by session shop id and staff roles", async () => {
    const staffMember = createStaffMember();

    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaUserFindMany.mockResolvedValue([staffMember]);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.prismaUserFindMany).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        role: { in: ["receptionist", "barber", "skinner"] },
        status: "active",
      },
      orderBy: { createdAt: "desc" },
      select: expect.objectContaining({
        id: true,
        shopId: true,
        branchId: true,
        username: true,
        role: true,
        status: true,
        isFirstLogin: true,
        createdAt: true,
      }),
    });
    await expect(response.json()).resolves.toEqual({
      staff: [
        {
          ...staffMember,
          createdAt: staffMember.createdAt.toISOString(),
        },
      ],
    });
  });
});

describe("POST /api/staff", () => {
  it("should return 400 when password is missing", async () => {
    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });

    const response = await POST(
      createRequest({
        username: "barber01",
        role: "barber",
        branchId: "branch-1",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: staffTexts.api.errors.missingPassword,
    });
  });

  it("should return 400 when branch does not belong to shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaBranchFindFirst.mockResolvedValue(null);

    const response = await POST(
      createRequest({
        username: "barber01",
        password: "Secret123!",
        role: "barber",
        branchId: "branch-2",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: staffTexts.api.errors.invalidBranch,
    });
  });

  it("should create staff with hashed password and first login flag", async () => {
    const staffMember = createStaffMember();

    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaBranchFindFirst.mockResolvedValue({ id: "branch-1" });
    mocks.prismaUserCreate.mockResolvedValue(staffMember);

    const response = await POST(
      createRequest({
        username: " barber01 ",
        password: "Secret123!",
        role: "barber",
        branchId: "branch-1",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.hashPassword).toHaveBeenCalledWith("Secret123!");
    expect(mocks.prismaUserCreate).toHaveBeenCalledWith({
      data: {
        shopId: "shop-1",
        branchId: "branch-1",
        username: "barber01",
        passwordHash: "hashed:Secret123!",
        role: "barber",
        status: "active",
        isFirstLogin: true,
      },
      select: expect.objectContaining({
        id: true,
        shopId: true,
        branchId: true,
        username: true,
        role: true,
        status: true,
        isFirstLogin: true,
        createdAt: true,
      }),
    });
    await expect(response.json()).resolves.toEqual({
      staffMember: {
        ...staffMember,
        createdAt: staffMember.createdAt.toISOString(),
      },
    });
  });
});
