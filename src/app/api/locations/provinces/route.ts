import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { locationTexts } from "@/constants/texts";
import { getActiveProvinces } from "@/utils/locations";

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

  try {
    const provinces = await getActiveProvinces();
    return NextResponse.json({ provinces });
  } catch (error) {
    console.error("Failed to load active provinces", error);
    return NextResponse.json(
      { error: locationTexts.api.errors.unavailable },
      { status: 500 },
    );
  }
}
