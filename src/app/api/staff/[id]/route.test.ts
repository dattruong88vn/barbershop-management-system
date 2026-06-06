import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffTexts } from "@/constants/texts";
import type { StaffFormInput } from "@/types";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  hashPassword: vi.fn((password: string) => `hashed:${password}`),
  prismaBranchFindFirst: vi.fn(),
  prismaUserFindFirst: vi.fn(),
  prismaUserUpdate: vi.fn(),
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
      findFirst: mocks.prismaUserFindFirst,
      update: mocks.prismaUserUpdate,
    },
  },
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/staff/[id]/route";

function createRequest(body?: Partial<StaffFormInput> | string): NextRequest {
  const requestBody =
    typeof body === "string" ? body : JSON.stringify(body ?? {});

  return new Request("http://localhost/api/staff/staff-1", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: requestBody,
  }) as unknown as NextRequest;
}

function createContext(id = "staff-1") {
  return {
    params: Promise.resolve({ id }),
  };
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

describe("GET /api/staff/[id]", () => {
  it("should return 404 when staff does not belong to session shop", async () => {
    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaUserFindFirst.mockResolvedValue(null);

    const response = await GET(createRequest(), createContext());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: staffTexts.api.errors.notFound,
    });
  });
});

describe("PATCH /api/staff/[id]", () => {
  it("should update staff and reassign branch", async () => {
    const staffMember = createStaffMember();
    const updatedStaffMember = {
      ...staffMember,
      branchId: "branch-2",
      role: "skinner",
      branch: {
        id: "branch-2",
        name: "Chi nhánh Quận 2",
      },
    };

    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaUserFindFirst.mockResolvedValue(staffMember);
    mocks.prismaBranchFindFirst.mockResolvedValue({ id: "branch-2" });
    mocks.prismaUserUpdate.mockResolvedValue(updatedStaffMember);

    const response = await PATCH(
      createRequest({
        username: "barber01",
        role: "skinner",
        branchId: "branch-2",
      }),
      createContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.prismaUserUpdate).toHaveBeenCalledWith({
      where: { id: "staff-1" },
      data: {
        username: "barber01",
        role: "skinner",
        branchId: "branch-2",
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
        ...updatedStaffMember,
        createdAt: updatedStaffMember.createdAt.toISOString(),
      },
    });
  });
});

describe("DELETE /api/staff/[id]", () => {
  it("should mark staff inactive scoped to session shop", async () => {
    const staffMember = createStaffMember();
    const inactiveStaffMember = {
      ...staffMember,
      status: "inactive",
    };

    mocks.getToken.mockResolvedValue({
      id: "owner-1",
      role: "owner",
      shop_id: "shop-1",
    });
    mocks.prismaUserFindFirst.mockResolvedValue(staffMember);
    mocks.prismaUserUpdate.mockResolvedValue(inactiveStaffMember);

    const response = await DELETE(createRequest(), createContext());

    expect(response.status).toBe(200);
    expect(mocks.prismaUserUpdate).toHaveBeenCalledWith({
      where: { id: "staff-1" },
      data: { status: "inactive" },
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
        ...inactiveStaffMember,
        createdAt: inactiveStaffMember.createdAt.toISOString(),
      },
    });
  });
});
