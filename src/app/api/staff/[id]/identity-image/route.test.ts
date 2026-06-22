import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({ getSignedUrl: vi.fn(), getToken: vi.fn(), userFindFirst: vi.fn() }));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: mocks.getSignedUrl }));
vi.mock("@/lib/r2", () => ({ R2_PRIVATE_BUCKET_NAME: "private-bucket", r2Client: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findFirst: mocks.userFindFirst } } }));

import { GET } from "@/app/api/staff/[id]/identity-image/route";

const context = { params: Promise.resolve({ id: "staff-1" }) };

afterEach(() => vi.clearAllMocks());

describe("GET /api/staff/[id]/identity-image", () => {
  it("should scope manager access to the active branch", async () => {
    mocks.getToken.mockResolvedValue({
      id: "manager-1",
      role: "manager",
      shop_id: "shop-1",
      branch_id: "branch-1",
    });
    mocks.userFindFirst.mockResolvedValue(null);

    const response = await GET(
      new NextRequest("http://localhost/api/staff/staff-1/identity-image?side=front"),
      context,
    );

    expect(mocks.userFindFirst).toHaveBeenCalledWith({
      where: { id: "staff-1", shopId: "shop-1", branchId: "branch-1" },
      select: { identityCardBackKey: true, identityCardFrontKey: true },
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: staffTexts.api.errors.notFound });
  });

  it("should redirect an owner to a signed private identity image URL", async () => {
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });
    mocks.userFindFirst.mockResolvedValue({
      identityCardFrontKey: "staff-documents/shop-1/staff-1/front-id",
      identityCardBackKey: null,
    });
    mocks.getSignedUrl.mockResolvedValue("https://private.example/signed");

    const response = await GET(
      new NextRequest("http://localhost/api/staff/staff-1/identity-image?side=front"),
      context,
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://private.example/signed");
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ input: {
        Bucket: "private-bucket",
        Key: "staff-documents/shop-1/staff-1/front-id",
      } }),
      { expiresIn: 300 },
    );
  });
});
