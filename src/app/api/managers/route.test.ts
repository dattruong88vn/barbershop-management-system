import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { branchTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({ getToken: vi.fn(), userFindMany: vi.fn() }));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findMany: mocks.userFindMany } } }));

import { GET } from "@/app/api/managers/route";

afterEach(() => vi.clearAllMocks());

describe("GET /api/managers", () => {
  it("should reject non-owner roles", async () => {
    mocks.getToken.mockResolvedValue({ id: "manager-1", role: "manager", shop_id: "shop-1" });

    const response = await GET(new NextRequest("http://localhost/api/managers"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: branchTexts.api.errors.forbidden });
  });

  it("should search active managers within the session shop", async () => {
    const managers = [{ id: "manager-1", username: "quanly", fullName: "Quản lý" }];
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });
    mocks.userFindMany.mockResolvedValue(managers);

    const response = await GET(new NextRequest("http://localhost/api/managers?search=quan%20ly"));

    expect(response.status).toBe(200);
    expect(mocks.userFindMany).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        role: "manager",
        status: "active",
        OR: [
          { fullName: { contains: "quan ly", mode: "insensitive" } },
          { username: { contains: "quan ly", mode: "insensitive" } },
        ],
      },
      orderBy: { username: "asc" },
      select: { fullName: true, id: true, username: true },
    });
    await expect(response.json()).resolves.toEqual({ managers });
  });
});
