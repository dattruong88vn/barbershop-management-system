import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import { serviceTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ServiceRequestBody, UserRole } from "@/types";

type ServiceRouteContext = {
  params: Promise<{ id?: string }> | { id?: string };
};

const SERVICE_SELECT = {
  id: true,
  shopId: true,
  name: true,
  price: true,
  isHaircut: true,
  createdAt: true,
} as const;

function isServiceRequestBody(body: unknown): body is ServiceRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeServiceInput(body: ServiceRequestBody) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    price:
      typeof body.price === "number"
        ? body.price
        : Number.parseFloat(
            typeof body.price === "string" ? body.price.trim() : "",
          ),
    isHaircut: body.isHaircut === true,
  };
}

function formatServiceResponse(service: {
  id: string;
  shopId: string;
  name: string;
  price: { toString: () => string };
  isHaircut: boolean;
  createdAt: Date;
}) {
  return {
    ...service,
    price: Number(service.price.toString()),
  };
}

async function getServiceId(context: ServiceRouteContext) {
  const params = await Promise.resolve(context.params);
  return typeof params.id === "string" ? params.id : "";
}

async function getOwnerShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: serviceTexts.api.errors.unauthorized, status: 401 };
  }

  if (token.role !== ("owner" satisfies UserRole) || !token.shop_id) {
    return { error: serviceTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

async function findService(serviceId: string, shopId: string) {
  return prisma.service.findFirst({
    where: {
      id: serviceId,
      shopId,
    },
    select: SERVICE_SELECT,
  });
}

export async function GET(request: NextRequest, context: ServiceRouteContext) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const serviceId = await getServiceId(context);

  if (!serviceId) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.missingServiceId },
      { status: 400 },
    );
  }

  const service = await findService(serviceId, authResult.shopId);

  if (!service) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  return NextResponse.json({ service: formatServiceResponse(service) });
}

export async function PATCH(request: NextRequest, context: ServiceRouteContext) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const serviceId = await getServiceId(context);

  if (!serviceId) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.missingServiceId },
      { status: 400 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isServiceRequestBody(body)) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const serviceInput = normalizeServiceInput(body);

  if (!serviceInput.name) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.missingName },
      { status: 400 },
    );
  }

  if (body.price === undefined || body.price === null || body.price === "") {
    return NextResponse.json(
      { error: serviceTexts.api.errors.missingPrice },
      { status: 400 },
    );
  }

  if (!Number.isFinite(serviceInput.price) || serviceInput.price <= 0) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.invalidPrice },
      { status: 400 },
    );
  }

  const service = await findService(serviceId, authResult.shopId);

  if (!service) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const updatedService = await prisma.service.update({
    where: { id: service.id },
    data: serviceInput,
    select: SERVICE_SELECT,
  });

  return NextResponse.json({
    service: formatServiceResponse(updatedService),
  });
}

export async function DELETE(
  request: NextRequest,
  context: ServiceRouteContext,
) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const serviceId = await getServiceId(context);

  if (!serviceId) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.missingServiceId },
      { status: 400 },
    );
  }

  const service = await findService(serviceId, authResult.shopId);

  if (!service) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  try {
    await prisma.service.delete({
      where: { id: service.id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: serviceTexts.api.errors.serviceInUse },
        { status: 400 },
      );
    }

    throw error;
  }

  return NextResponse.json({ service: formatServiceResponse(service) });
}
