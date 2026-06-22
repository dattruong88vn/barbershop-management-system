import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({ getSignedUrl: vi.fn(), getToken: vi.fn(), nanoid: vi.fn() }));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: mocks.getSignedUrl }));
vi.mock("nanoid", () => ({ nanoid: mocks.nanoid }));
vi.mock("@/lib/r2", () => ({ R2_PRIVATE_BUCKET_NAME: "private-bucket", r2Client: {} }));

import { POST } from "@/app/api/staff/identity-upload/route";

const request = (body: unknown) =>
  new Request("http://localhost/api/staff/identity-upload", {
    method: "POST",
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

afterEach(() => vi.clearAllMocks());

describe("POST /api/staff/identity-upload", () => {
  it("should reject invalid identity image input", async () => {
    mocks.getToken.mockResolvedValue({ id: "owner-1", role: "owner", shop_id: "shop-1" });

    const response = await POST(request({ draftId: "draft-1", fileType: "application/pdf", side: "front" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: staffTexts.api.errors.invalidIdentityImage });
  });

  it("should create a private tenant-scoped upload URL for management roles", async () => {
    mocks.getToken.mockResolvedValue({ id: "manager-1", role: "manager", shop_id: "shop-1" });
    mocks.nanoid.mockReturnValue("random-id");
    mocks.getSignedUrl.mockResolvedValue("https://upload.example/signed");

    const response = await POST(request({ draftId: "draft-1", fileType: "image/jpeg", side: "back" }));

    expect(response.status).toBe(200);
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ input: {
        Bucket: "private-bucket",
        ContentType: "image/jpeg",
        Key: "staff-documents/shop-1/draft-1/back-random-id",
      } }),
      { expiresIn: 300 },
    );
    await expect(response.json()).resolves.toEqual({
      key: "staff-documents/shop-1/draft-1/back-random-id",
      url: "https://upload.example/signed",
    });
  });
});
