import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import { comboTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ComboRequestBody, UserRole } from "@/types";

type ComboRouteContext = {
  params: Promise<{ id?: string }> | { id?: string };
};

const COMBO_SELECT = {
  id: true,
  shopId: true,
  name: true,
  description: true,
  price: true,
  createdAt: true,
  comboServices: {
    select: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          isHaircut: true,
        },
      },
    },
  },
} as const;

function isComboRequestBody(body: unknown): body is ComboRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeComboInput(body: ComboRequestBody) {
  const serviceIds = Array.isArray(body.serviceIds)
    ? [...new Set(body.serviceIds.filter((id) => typeof id === "string"))]
    : [];

  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    description:
      typeof body.description === "string" ? body.description.trim() : "",
    price:
      typeof body.price === "number"
        ? body.price
        : Number.parseFloat(
            typeof body.price === "string" ? body.price.trim() : "",
          ),
    serviceIds,
  };
}

function formatComboResponse(combo: {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: { toString: () => string };
  createdAt: Date;
  comboServices: Array<{
    service: {
      id: string;
      name: string;
      price: { toString: () => string };
      isHaircut: boolean;
    };
  }>;
}) {
  return {
    id: combo.id,
    shopId: combo.shopId,
    name: combo.name,
    description: combo.description,
    price: Number(combo.price.toString()),
    createdAt: combo.createdAt,
    services: combo.comboServices.map(({ service }) => ({
      ...service,
      price: Number(service.price.toString()),
    })),
  };
}

async function getComboId(context: ComboRouteContext) {
  const params = await Promise.resolve(context.params);
  return typeof params.id === "string" ? params.id : "";
}

async function getOwnerShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: comboTexts.api.errors.unauthorized, status: 401 };
  }

  if (token.role !== ("owner" satisfies UserRole) || !token.shop_id) {
    return { error: comboTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

async function findCombo(comboId: string, shopId: string) {
  return prisma.combo.findFirst({
    where: {
      id: comboId,
      shopId,
    },
    select: COMBO_SELECT,
  });
}

async function validateServiceIds(serviceIds: string[], shopId: string) {
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      shopId,
    },
    select: { id: true },
  });

  return services.length === serviceIds.length;
}

export async function GET(request: NextRequest, context: ComboRouteContext) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const comboId = await getComboId(context);

  if (!comboId) {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingComboId },
      { status: 400 },
    );
  }

  const combo = await findCombo(comboId, authResult.shopId);

  if (!combo) {
    return NextResponse.json(
      { error: comboTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  return NextResponse.json({ combo: formatComboResponse(combo) });
}

export async function PATCH(request: NextRequest, context: ComboRouteContext) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const comboId = await getComboId(context);

  if (!comboId) {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingComboId },
      { status: 400 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isComboRequestBody(body)) {
    return NextResponse.json(
      { error: comboTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const comboInput = normalizeComboInput(body);

  if (!comboInput.name) {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingName },
      { status: 400 },
    );
  }

  if (!comboInput.description) {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingDescription },
      { status: 400 },
    );
  }

  if (body.price === undefined || body.price === null || body.price === "") {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingPrice },
      { status: 400 },
    );
  }

  if (!Number.isFinite(comboInput.price) || comboInput.price <= 0) {
    return NextResponse.json(
      { error: comboTexts.api.errors.invalidPrice },
      { status: 400 },
    );
  }

  if (comboInput.serviceIds.length === 0) {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingServices },
      { status: 400 },
    );
  }

  const combo = await findCombo(comboId, authResult.shopId);

  if (!combo) {
    return NextResponse.json(
      { error: comboTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const areServicesValid = await validateServiceIds(
    comboInput.serviceIds,
    authResult.shopId,
  );

  if (!areServicesValid) {
    return NextResponse.json(
      { error: comboTexts.api.errors.invalidServices },
      { status: 400 },
    );
  }

  const updatedCombo = await prisma.combo.update({
    where: { id: combo.id },
    data: {
      name: comboInput.name,
      description: comboInput.description,
      price: comboInput.price,
      comboServices: {
        deleteMany: {},
        create: comboInput.serviceIds.map((serviceId) => ({
          shopId: authResult.shopId,
          serviceId,
        })),
      },
    },
    select: COMBO_SELECT,
  });

  return NextResponse.json({ combo: formatComboResponse(updatedCombo) });
}

export async function DELETE(
  request: NextRequest,
  context: ComboRouteContext,
) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const comboId = await getComboId(context);

  if (!comboId) {
    return NextResponse.json(
      { error: comboTexts.api.errors.missingComboId },
      { status: 400 },
    );
  }

  const combo = await findCombo(comboId, authResult.shopId);

  if (!combo) {
    return NextResponse.json(
      { error: comboTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  try {
    await prisma.combo.delete({
      where: { id: combo.id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: comboTexts.api.errors.comboInUse },
        { status: 400 },
      );
    }

    throw error;
  }

  return NextResponse.json({ combo: formatComboResponse(combo) });
}
