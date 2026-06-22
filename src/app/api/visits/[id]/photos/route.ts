import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { nanoid } from "nanoid";

import { USER_ROLE_BARBER, VISIT_STATUS_COMPLETED } from "@/constants/common";
import { visitTexts } from "@/constants/texts";
import { getPhotoUrl, R2_BUCKET_NAME, r2Client } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import type { VisitPhotoCreateRequestBody } from "@/types";

type VisitPhotoRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isVisitPhotoCreateRequestBody(
  body: unknown,
): body is VisitPhotoCreateRequestBody {
  return typeof body === "object" && body !== null;
}

function formatPhotoResponse(photo: {
  id: string;
  photoUrl: string;
  createdAt: Date;
}) {
  return {
    id: photo.id,
    photoUrl: photo.photoUrl,
    createdAt: photo.createdAt.toISOString(),
  };
}

async function getPhotoKeyFromRequest(request: NextRequest, visitId: string) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return "";
    }

    if (!R2_BUCKET_NAME) {
      throw new Error(visitTexts.api.errors.photoStorageUnavailable);
    }

    const key = `visits/${visitId}/${nanoid()}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2Client.send(
      new PutObjectCommand({
        Body: buffer,
        Bucket: R2_BUCKET_NAME,
        ContentType: file.type,
        Key: key,
      }),
    );

    return key;
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isVisitPhotoCreateRequestBody(body)) {
    return "";
  }

  return typeof body.key === "string" ? body.key.trim() : "";
}

export async function POST(
  request: NextRequest,
  context: VisitPhotoRouteContext,
) {
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

  if (token.role !== USER_ROLE_BARBER || !token.shop_id) {
    return NextResponse.json(
      { error: visitTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  let key = "";

  try {
    key = await getPhotoKeyFromRequest(request, id);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : visitTexts.api.errors.invalidPhoto,
      },
      { status: 503 },
    );
  }

  if (!key || !key.startsWith(`visits/${id}/`)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidPhoto },
      { status: 400 },
    );
  }

  const visit = await prisma.visit.findFirst({
    where: {
      id,
      shopId: token.shop_id,
    },
    select: {
      id: true,
      shopId: true,
      status: true,
    },
  });

  if (!visit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  if (visit.status === VISIT_STATUS_COMPLETED) {
    return NextResponse.json(
      { error: visitTexts.api.errors.lockedPhotoEdit },
      { status: 400 },
    );
  }

  const photo = await prisma.visitPhoto.create({
    data: {
      shopId: visit.shopId,
      visitId: visit.id,
      photoUrl: getPhotoUrl(key),
      uploadedBy: token.id,
    },
    select: {
      id: true,
      photoUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ photo: formatPhotoResponse(photo) });
}

export async function DELETE(
  request: NextRequest,
  context: VisitPhotoRouteContext,
) {
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

  if (token.role !== USER_ROLE_BARBER || !token.shop_id) {
    return NextResponse.json(
      { error: visitTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const photoId = request.nextUrl.searchParams.get("photoId")?.trim() ?? "";

  if (!photoId) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidPhoto },
      { status: 400 },
    );
  }

  const visit = await prisma.visit.findFirst({
    where: {
      id,
      shopId: token.shop_id,
    },
    select: {
      status: true,
    },
  });

  if (!visit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  if (visit.status === VISIT_STATUS_COMPLETED) {
    return NextResponse.json(
      { error: visitTexts.api.errors.lockedPhotoEdit },
      { status: 400 },
    );
  }

  const photo = await prisma.visitPhoto.findFirst({
    where: {
      id: photoId,
      shopId: token.shop_id,
      visitId: id,
    },
    select: {
      id: true,
      photoUrl: true,
      createdAt: true,
    },
  });

  if (!photo) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  await prisma.visitPhoto.delete({
    where: {
      id: photo.id,
    },
  });

  return NextResponse.json({ photo: formatPhotoResponse(photo) });
}
