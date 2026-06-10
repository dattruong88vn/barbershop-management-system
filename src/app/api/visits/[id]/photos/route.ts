import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { visitTexts } from "@/constants/texts";
import { getPhotoUrl } from "@/lib/r2";
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

  if (token.role !== "barber" || !token.shop_id) {
    return NextResponse.json(
      { error: visitTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);

  if (!isVisitPhotoCreateRequestBody(body)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";

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
    },
  });

  if (!visit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
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
