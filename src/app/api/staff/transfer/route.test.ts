import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  branchFindFirst: vi.fn(),
  transaction: vi.fn(),
  userFindMany: vi.fn(),
  userUpdateMany: vi.fn(),
  visitFindFirst: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    branch: { findFirst: mocks.branchFindFirst },
    user: { findMany: mocks.userFindMany },
    visit: { findFirst: mocks.visitFindFirst },
  },
}));

import { PATCH } from "@/app/api/staff/transfer/route";

const request = (body: unknown) =>
  new Request("http://localhost/api/staff/transfer", {
    method: "PATCH",
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

afterEach(() => vi.clearAllMocks());

describe("PATCH /api/staff/transfer", () => {
  it("should reject managers", async () => {
    mocks.getToken.mockResolvedValue({ id: "manager-1", role: "manager", shop_id: "shop-1" });

    const response = await PATCH(request({ staffIds: ["staff-1"], targetBranchId: "branch-2" }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: staffTexts.api.errors.forbidden });
  });

  it("should block transfer when selected staff has an open visit", async () => {
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });
    mocks.branchFindFirst.mockResolvedValue({ id: "branch-2" });
    mocks.userFindMany.mockResolvedValue([{ id: "staff-1" }]);
    mocks.visitFindFirst.mockResolvedValue({ id: "visit-1" });

    const response = await PATCH(request({ staffIds: ["staff-1"], targetBranchId: "branch-2" }));

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: staffTexts.ownerStaff.errors.openVisits });
  });

  it("should transfer tenant staff to an active tenant branch", async () => {
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });
    mocks.branchFindFirst.mockResolvedValue({ id: "branch-2" });
    mocks.userFindMany.mockResolvedValue([{ id: "staff-1" }, { id: "staff-2" }]);
    mocks.visitFindFirst.mockResolvedValue(null);
    mocks.transaction.mockImplementation(async (callback: (transaction: { user: { updateMany: typeof mocks.userUpdateMany } }) => unknown) =>
      callback({ user: { updateMany: mocks.userUpdateMany } }),
    );
    mocks.userUpdateMany.mockResolvedValue({ count: 2 });

    const response = await PATCH(request({ staffIds: ["staff-1", "staff-2"], targetBranchId: "branch-2" }));

    expect(response.status).toBe(200);
    expect(mocks.branchFindFirst).toHaveBeenCalledWith({
      where: { id: "branch-2", shopId: "shop-1", status: "active" },
      select: { id: true },
    });
    expect(mocks.userUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["staff-1", "staff-2"] }, shopId: "shop-1" },
      data: { branchId: "branch-2", status: "active" },
    });
    await expect(response.json()).resolves.toEqual({ transferredCount: 2 });
  });
});
