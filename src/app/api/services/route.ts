import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  MANAGEMENT_ROLES,
  type ManagementRoleValue,
  isServiceResponsibleRole,
} from "@/constants/common";
import { serviceTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ServiceRequestBody } from "@/types";

const SERVICE_SELECT = {
  id: true,
  shopId: true,
  name: true,
  price: true,
  responsibleRole: true,
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
    responsibleRole: isServiceResponsibleRole(body.responsibleRole)
      ? body.responsibleRole
      : null,
    isHaircut: body.isHaircut === true,
  };
}

function formatServiceResponse(service: {
  id: string;
  shopId: string;
  name: string;
  price: { toString: () => string };
  responsibleRole: string;
  isHaircut: boolean;
  createdAt: Date;
}) {
  return {
    ...service,
    price: Number(service.price.toString()),
  };
}

async function getManagementShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: serviceTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.includes(token.role as ManagementRoleValue) ||
    !token.shop_id
  ) {
    return { error: serviceTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

export async function GET(request: NextRequest) {
  const authResult = await getManagementShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const services = await prisma.service.findMany({
    where: { shopId: authResult.shopId },
    orderBy: { createdAt: "desc" },
    select: SERVICE_SELECT,
  });

  return NextResponse.json({
    services: services.map(formatServiceResponse),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await getManagementShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
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

  const responsibleRole = serviceInput.responsibleRole;

  if (!responsibleRole) {
    return NextResponse.json(
      { error: serviceTexts.api.errors.missingResponsibleRole },
      { status: 400 },
    );
  }

  const service = await prisma.service.create({
    data: {
      shopId: authResult.shopId,
      name: serviceInput.name,
      price: serviceInput.price,
      responsibleRole,
      isHaircut: serviceInput.isHaircut,
    },
    select: SERVICE_SELECT,
  });

  return NextResponse.json(
    { service: formatServiceResponse(service) },
    { status: 201 },
  );
}
