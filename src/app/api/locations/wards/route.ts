import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { locationTexts } from "@/constants/texts";
import {
  getActiveWards,
  isActiveProvince,
} from "@/utils/locations";

const MAX_LOCATION_CODE_LENGTH = 20;

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json(
      { error: locationTexts.api.errors.unauthorized },
      { status: 401 },
    );
  }

  const provinceCode = request.nextUrl.searchParams
    .get("provinceCode")
    ?.trim();

  if (!provinceCode) {
    return NextResponse.json(
      { error: locationTexts.api.errors.missingProvinceCode },
      { status: 400 },
    );
  }

  if (provinceCode.length > MAX_LOCATION_CODE_LENGTH) {
    return NextResponse.json(
      { error: locationTexts.api.errors.invalidProvince },
      { status: 400 },
    );
  }

  try {
    if (!(await isActiveProvince(provinceCode))) {
      return NextResponse.json(
        { error: locationTexts.api.errors.invalidProvince },
        { status: 400 },
      );
    }

    const wards = await getActiveWards(provinceCode);
    return NextResponse.json({ wards });
  } catch (error) {
    console.error("Failed to load active wards", error);
    return NextResponse.json(
      { error: locationTexts.api.errors.unavailable },
      { status: 500 },
    );
  }
}
