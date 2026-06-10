import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { nanoid } from "nanoid";

import { visitTexts } from "@/constants/texts";
import { R2_BUCKET_NAME, r2Client } from "@/lib/r2";
import type { UserRole } from "@/types";

const UPLOAD_PRESIGNED_ROLES: UserRole[] = [
  "barber",
  "skinner",
  "receptionist",
];
const PRESIGNED_URL_EXPIRES_IN_SECONDS = 300;

type PresignedUploadRequestBody = {
  fileType?: unknown;
  visitId?: unknown;
};

function isPresignedUploadRequestBody(
  body: unknown,
): body is PresignedUploadRequestBody {
  return typeof body === "object" && body !== null;
}

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json(
      { error: visitTexts.api.errors.unauthorized },
      { status: 401 },
    );
  }

  if (
    typeof token.role !== "string" ||
    !UPLOAD_PRESIGNED_ROLES.includes(token.role as UserRole)
  ) {
    return NextResponse.json(
      { error: visitTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isPresignedUploadRequestBody(body)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const visitId = typeof body.visitId === "string" ? body.visitId.trim() : "";
  const fileType = typeof body.fileType === "string" ? body.fileType.trim() : "";

  if (!visitId || !fileType.startsWith("image/")) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidPhoto },
      { status: 400 },
    );
  }

  const key = `visits/${visitId}/${nanoid()}.webp`;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
  const url = await getSignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
  });

  return NextResponse.json({ url, key });
}
