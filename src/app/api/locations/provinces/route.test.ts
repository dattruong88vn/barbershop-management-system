import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { locationTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getActiveProvinces: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/utils/locations", () => ({
  getActiveProvinces: mocks.getActiveProvinces,
}));

import { GET } from "@/app/api/locations/provinces/route";

function createRequest() {
  return new NextRequest("http://localhost/api/locations/provinces");
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/locations/provinces", () => {
  it("returns 401 without a session", async () => {
    mocks.getToken.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: locationTexts.api.errors.unauthorized,
    });
  });

  it("returns active provinces", async () => {
    const provinces = [
      { code: "01", fullName: "Thành phố Hà Nội", name: "Hà Nội", type: "city" },
    ];
    mocks.getToken.mockResolvedValue({ id: "user-1" });
    mocks.getActiveProvinces.mockResolvedValue(provinces);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ provinces });
  });

  it("returns JSON 500 when reference data is unavailable", async () => {
    mocks.getToken.mockResolvedValue({ id: "user-1" });
    mocks.getActiveProvinces.mockRejectedValue(new Error("FDW unavailable"));

    const response = await GET(createRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: locationTexts.api.errors.unavailable,
    });
  });
});
