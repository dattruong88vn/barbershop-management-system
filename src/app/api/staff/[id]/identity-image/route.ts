import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { MANAGEMENT_ROLES, USER_ROLE_MANAGER, type ManagementRoleValue } from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import { R2_PRIVATE_BUCKET_NAME, r2Client } from "@/lib/r2";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.id || !token.shop_id) {
    return NextResponse.json({ error: staffTexts.api.errors.unauthorized }, { status: 401 });
  }

  if (typeof token.role !== "string" || !MANAGEMENT_ROLES.includes(token.role as ManagementRoleValue)) {
    return NextResponse.json({ error: staffTexts.api.errors.forbidden }, { status: 403 });
  }

  const { id } = await context.params;
  const side = request.nextUrl.searchParams.get("side");
  const staffMember = await prisma.user.findFirst({
    where: {
      id,
      shopId: token.shop_id,
      ...(token.role === USER_ROLE_MANAGER ? { branchId: token.branch_id ?? "" } : {}),
    },
    select: { identityCardBackKey: true, identityCardFrontKey: true },
  });

  const key = side === "front"
    ? staffMember?.identityCardFrontKey
    : side === "back"
      ? staffMember?.identityCardBackKey
      : null;

  if (!key) {
    return NextResponse.json({ error: staffTexts.api.errors.notFound }, { status: 404 });
  }

  const url = await getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: key }),
    { expiresIn: 300 },
  );

  return NextResponse.redirect(url);
}
