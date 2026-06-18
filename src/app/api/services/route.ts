import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  CATALOG_STATUS_ACTIVE,
  CATALOG_STATUS_DELETED,
  MANAGEMENT_ROLES,
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  isCatalogStatus,
  type ManagementRoleValue,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  isServiceResponsibleRole,
} from "@/constants/common";
import { serviceTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ServiceRequestBody } from "@/types";

const SERVICE_SELECT = {
  id: true,
  shopId: true,
  branchId: true,
  name: true,
  price: true,
  responsibleRole: true,
  isHaircut: true,
  createdBy: true,
  deletedAt: true,
  createdAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  creator: {
    select: {
      id: true,
      username: true,
      role: true,
    },
  },
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

function formatServiceResponse(
  service: {
    branch: { id: string; name: string } | null;
    branchId: string | null;
    createdBy: string;
    deletedAt: Date | null;
    id: string;
    isHaircut: boolean;
    name: string;
    shopId: string;
    price: { toString: () => string };
    responsibleRole: string;
    createdAt: Date;
    creator: { id: string; role: string; username: string };
  },
  auth: { role: ManagementRoleValue; userId: string },
) {
  const isOwner = auth.role === USER_ROLE_OWNER;
  const isCreator = service.createdBy === auth.userId;
  const isDeleted = service.deletedAt !== null;

  return {
    ...service,
    canDelete: !isDeleted && (isOwner || isCreator),
    canEdit: !isDeleted && isCreator,
    scope: service.branchId ? SERVICE_SCOPE_BRANCH : SERVICE_SCOPE_SHOP,
    price: Number(service.price.toString()),
  };
}

function getCatalogStatus(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");

  return isCatalogStatus(status) ? status : CATALOG_STATUS_ACTIVE;
}

async function getManagementAuth(request: NextRequest) {
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

  if (token.role === USER_ROLE_MANAGER && !token.branch_id) {
    return { error: serviceTexts.api.errors.forbidden, status: 403 };
  }

  if (token.role === USER_ROLE_MANAGER) {
    const managedBranch = await prisma.branch.findFirst({
      where: {
        id: token.branch_id as string,
        managerId: token.id,
        shopId: token.shop_id,
        status: "active",
      },
      select: { id: true },
    });

    if (!managedBranch) {
      return { error: serviceTexts.api.errors.forbidden, status: 403 };
    }
  }

  return {
    branchId: token.role === USER_ROLE_MANAGER ? token.branch_id : null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
    userId: token.id,
  };
}

export async function GET(request: NextRequest) {
  const authResult = await getManagementAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const status = getCatalogStatus(request);
  const services = await prisma.service.findMany({
    where: {
      deletedAt:
        status === CATALOG_STATUS_DELETED
          ? { not: null }
          : null,
      shopId: authResult.shopId,
      ...(authResult.branchId
        ? {
            OR: [{ branchId: null }, { branchId: authResult.branchId }],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: SERVICE_SELECT,
  });

  return NextResponse.json({
    services: services.map((service) =>
      formatServiceResponse(service, authResult),
    ),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await getManagementAuth(request);

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
      branchId: authResult.branchId,
      name: serviceInput.name,
      price: serviceInput.price,
      responsibleRole,
      isHaircut: serviceInput.isHaircut,
      createdBy: authResult.userId,
    },
    select: SERVICE_SELECT,
  });

  return NextResponse.json(
    { service: formatServiceResponse(service, authResult) },
    { status: 201 },
  );
}
