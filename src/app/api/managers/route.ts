import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { USER_ROLE_MANAGER, USER_ROLE_OWNER } from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json(
      { error: branchTexts.api.errors.unauthorized },
      { status: 401 },
    );
  }

  if (token.role !== USER_ROLE_OWNER || !token.shop_id) {
    return NextResponse.json(
      { error: branchTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const managers = await prisma.user.findMany({
    where: {
      shopId: token.shop_id,
      role: USER_ROLE_MANAGER,
      status: "active",
      ...(search
        ? { username: { contains: search, mode: "insensitive" } }
        : {}),
    },
    orderBy: { username: "asc" },
    select: {
      id: true,
      username: true,
    },
  });

  return NextResponse.json({ managers });
}
