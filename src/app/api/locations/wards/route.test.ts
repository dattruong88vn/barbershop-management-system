import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { locationTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  getActiveWards: vi.fn(),
  getToken: vi.fn(),
  isActiveProvince: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

vi.mock("@/utils/locations", () => ({
  getActiveWards: mocks.getActiveWards,
  isActiveProvince: mocks.isActiveProvince,
}));

import { GET } from "@/app/api/locations/wards/route";

function createRequest(provinceCode?: string) {
  const url = new URL("http://localhost/api/locations/wards");
  if (provinceCode !== undefined) {
    url.searchParams.set("provinceCode", provinceCode);
  }
  return new NextRequest(url);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/locations/wards", () => {
  it("returns 400 when provinceCode is missing", async () => {
    mocks.getToken.mockResolvedValue({ id: "user-1" });

    const response = await GET(createRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: locationTexts.api.errors.missingProvinceCode,
    });
  });

  it("returns 400 when province is inactive or unknown", async () => {
    mocks.getToken.mockResolvedValue({ id: "user-1" });
    mocks.isActiveProvince.mockResolvedValue(false);

    const response = await GET(createRequest("unknown"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: locationTexts.api.errors.invalidProvince,
    });
  });

  it("returns active wards for the selected province", async () => {
    const wards = [
      {
        code: "00001",
        fullName: "Phường mẫu",
        name: "Phường mẫu",
        provinceCode: "01",
        type: "ward",
      },
    ];
    mocks.getToken.mockResolvedValue({ id: "user-1" });
    mocks.isActiveProvince.mockResolvedValue(true);
    mocks.getActiveWards.mockResolvedValue(wards);

    const response = await GET(createRequest("01"));

    expect(response.status).toBe(200);
    expect(mocks.getActiveWards).toHaveBeenCalledWith("01");
    await expect(response.json()).resolves.toEqual({ wards });
  });

  it("returns JSON 500 when reference data is unavailable", async () => {
    mocks.getToken.mockResolvedValue({ id: "user-1" });
    mocks.isActiveProvince.mockRejectedValue(new Error("FDW unavailable"));

    const response = await GET(createRequest("01"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: locationTexts.api.errors.unavailable,
    });
  });
});
