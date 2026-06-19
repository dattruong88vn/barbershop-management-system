import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { nanoid } from "nanoid";

import { MANAGEMENT_ROLES, type ManagementRoleValue } from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { R2_PRIVATE_BUCKET_NAME, r2Client } from "@/lib/r2";
import type { StaffIdentitySide } from "@/types";

const IDENTITY_SIDES: StaffIdentitySide[] = ["front", "back"];
const PRESIGNED_URL_EXPIRES_IN_SECONDS = 300;

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.id || !token.shop_id) {
    return NextResponse.json({ error: staffTexts.api.errors.unauthorized }, { status: 401 });
  }

  if (typeof token.role !== "string" || !MANAGEMENT_ROLES.includes(token.role as ManagementRoleValue)) {
    return NextResponse.json({ error: staffTexts.api.errors.forbidden }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: staffTexts.api.errors.invalidRequestBody }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const draftId = typeof input.draftId === "string" ? input.draftId.trim() : "";
  const fileType = typeof input.fileType === "string" ? input.fileType.trim() : "";
  const side = typeof input.side === "string" ? input.side : "";

  if (!draftId || !fileType.startsWith("image/") || !IDENTITY_SIDES.includes(side as StaffIdentitySide)) {
    return NextResponse.json({ error: staffTexts.api.errors.invalidIdentityImage }, { status: 400 });
  }

  const key = `staff-documents/${token.shop_id}/${draftId}/${side}-${nanoid()}`;
  const url = await getSignedUrl(
    r2Client,
    new PutObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: key, ContentType: fileType }),
    { expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS },
  );

  return NextResponse.json({ key, url });
}
