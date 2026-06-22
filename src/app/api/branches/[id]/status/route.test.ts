import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { branchTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  branchFindFirst: vi.fn(),
  branchFindUnique: vi.fn(),
  branchUpdate: vi.fn(),
  transaction: vi.fn(),
  userUpdateMany: vi.fn(),
  visitFindFirst: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    branch: {
      findFirst: mocks.branchFindFirst,
      findUnique: mocks.branchFindUnique,
      update: mocks.branchUpdate,
    },
    user: { updateMany: mocks.userUpdateMany },
    visit: { findFirst: mocks.visitFindFirst },
  },
}));

import { PATCH } from "@/app/api/branches/[id]/status/route";

const context = { params: Promise.resolve({ id: "branch-1" }) };
const request = (status: string) =>
  new Request("http://localhost/api/branches/branch-1/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }) as unknown as NextRequest;

afterEach(() => vi.clearAllMocks());

describe("PATCH /api/branches/[id]/status", () => {
  it("should reject managers", async () => {
    mocks.getToken.mockResolvedValue({ id: "manager-1", role: "manager", shop_id: "shop-1" });

    const response = await PATCH(request("inactive"), context);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: branchTexts.api.errors.forbidden });
  });

  it("should block deactivation when the branch has an open visit", async () => {
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });
    mocks.branchFindFirst.mockResolvedValue({ id: "branch-1", managerId: null, status: "active" });
    mocks.visitFindFirst.mockResolvedValue({ id: "visit-1" });

    const response = await PATCH(request("inactive"), context);

    expect(response.status).toBe(400);
    expect(mocks.visitFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ branchId: "branch-1", shopId: "shop-1" }),
    }));
    expect(mocks.transaction).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: branchTexts.api.errors.openVisits });
  });

  it("should deactivate the branch and suspend its staff in one transaction", async () => {
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });
    mocks.branchFindFirst.mockResolvedValue({ id: "branch-1", managerId: "manager-1", status: "active" });
    mocks.visitFindFirst.mockResolvedValue(null);
    mocks.branchUpdate.mockReturnValue({ operation: "branch-update" });
    mocks.userUpdateMany.mockReturnValue({ operation: "staff-update" });
    mocks.branchFindUnique.mockResolvedValue({ id: "branch-1", status: "inactive" });

    const response = await PATCH(request("inactive"), context);

    expect(response.status).toBe(200);
    expect(mocks.transaction).toHaveBeenCalledWith([
      { operation: "branch-update" },
      { operation: "staff-update" },
    ]);
    expect(mocks.userUpdateMany).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        status: "active",
        OR: [
          { branchId: "branch-1" },
          {
            id: "manager-1",
            managedBranches: {
              none: {
                id: { not: "branch-1" },
                status: "active",
              },
            },
          },
        ],
      },
      data: { status: "branch_suspended" },
    });
    await expect(response.json()).resolves.toEqual({ branch: { id: "branch-1", status: "inactive" } });
  });
});
