import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  MANAGEMENT_ROLES,
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  type ManagementRoleValue,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
} from "@/constants/common";
import { comboTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { ComboRequestBody } from "@/types";

type ComboRouteContext = {
  params: Promise<{ id?: string }>;
};

const COMBO_SELECT = {
  id: true,
  shopId: true,
  branchId: true,
  name: true,
  description: true,
  price: true,
  createdBy: true,
  createdAt: true,
  deletedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  creator: {
    select: {
      id: true,
      role: true,
      username: true,
    },
  },
  _count: {
    select: {
      visitServices: true,
    },
  },
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
  _count: { visitServices: number };
  branch: { id: string; name: string } | null;
  branchId: string | null;
  createdBy: string;
  creator: { id: string; role: string; username: string };
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: { toString: () => string };
  createdAt: Date;
  deletedAt: Date | null;
  comboServices: Array<{
    service: {
      id: string;
      name: string;
      price: { toString: () => string };
      isHaircut: boolean;
    };
  }>;
}, auth: { role: ManagementRoleValue; userId: string }) {
  const isOwner = auth.role === USER_ROLE_OWNER;
  const isCreator = combo.createdBy === auth.userId;
  const isUsedInVisit = combo._count.visitServices > 0;

  return {
    id: combo.id,
    shopId: combo.shopId,
    branchId: combo.branchId,
    branch: combo.branch,
    canDelete: isOwner || combo.branchId !== null,
    canEdit: isCreator && !isUsedInVisit,
    createdBy: combo.createdBy,
    creator: combo.creator,
    isUsedInVisit,
    scope: combo.branchId ? SERVICE_SCOPE_BRANCH : SERVICE_SCOPE_SHOP,
    name: combo.name,
    description: combo.description,
    price: Number(combo.price.toString()),
    createdAt: combo.createdAt,
    deletedAt: combo.deletedAt,
    services: combo.comboServices.map(({ service }) => ({
      ...service,
      price: Number(service.price.toString()),
    })),
  };
}

async function getComboId(context: ComboRouteContext) {
  const params = await context.params;
  return typeof params.id === "string" ? params.id : "";
}

async function getManagementAuth(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: comboTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.includes(token.role as ManagementRoleValue) ||
    !token.shop_id
  ) {
    return { error: comboTexts.api.errors.forbidden, status: 403 };
  }

  if (token.role === USER_ROLE_MANAGER && !token.branch_id) {
    return { error: comboTexts.api.errors.forbidden, status: 403 };
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
      return { error: comboTexts.api.errors.forbidden, status: 403 };
    }
  }

  return {
    branchId: token.role === USER_ROLE_MANAGER ? token.branch_id : null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
    userId: token.id,
  };
}

async function findCombo(
  comboId: string,
  shopId: string,
  branchId: string | null,
) {
  return prisma.combo.findFirst({
    where: {
      deletedAt: null,
      id: comboId,
      shopId,
      ...(branchId
        ? {
            OR: [{ branchId: null }, { branchId }],
          }
        : {}),
    },
    select: COMBO_SELECT,
  });
}

async function validateServiceIds(
  serviceIds: string[],
  auth: { branchId: string | null; role: ManagementRoleValue; shopId: string },
) {
  const services = await prisma.service.findMany({
    where: {
      branchId: auth.role === USER_ROLE_OWNER ? null : auth.branchId,
      deletedAt: null,
      id: { in: serviceIds },
      shopId: auth.shopId,
    },
    select: { id: true },
  });

  return services.length === serviceIds.length;
}

export async function GET(request: NextRequest, context: ComboRouteContext) {
  const authResult = await getManagementAuth(request);

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

  const combo = await findCombo(
    comboId,
    authResult.shopId,
    authResult.branchId,
  );

  if (!combo) {
    return NextResponse.json(
      { error: comboTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  return NextResponse.json({ combo: formatComboResponse(combo, authResult) });
}

export async function PATCH(request: NextRequest, context: ComboRouteContext) {
  const authResult = await getManagementAuth(request);

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

  const combo = await findCombo(
    comboId,
    authResult.shopId,
    authResult.branchId,
  );

  if (!combo) {
    return NextResponse.json(
      { error: comboTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  if (combo.createdBy !== authResult.userId) {
    return NextResponse.json(
      { error: comboTexts.api.errors.protectedCombo },
      { status: 403 },
    );
  }

  if (combo._count.visitServices > 0) {
    return NextResponse.json(
      { error: comboTexts.api.errors.comboInUseEditBlocked },
      { status: 400 },
    );
  }

  const areServicesValid = await validateServiceIds(
    comboInput.serviceIds,
    authResult,
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

  return NextResponse.json({
    combo: formatComboResponse(updatedCombo, authResult),
  });
}

export async function DELETE(
  request: NextRequest,
  context: ComboRouteContext,
) {
  const authResult = await getManagementAuth(request);

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

  const combo = await findCombo(
    comboId,
    authResult.shopId,
    authResult.branchId,
  );

  if (!combo) {
    return NextResponse.json(
      { error: comboTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const canDelete =
    authResult.role === USER_ROLE_OWNER || combo.branchId === authResult.branchId;

  if (!canDelete) {
    return NextResponse.json(
      { error: comboTexts.api.errors.protectedCombo },
      { status: 403 },
    );
  }

  const deletedCombo = await prisma.combo.update({
    where: { id: combo.id },
    data: { deletedAt: new Date() },
    select: COMBO_SELECT,
  });

  return NextResponse.json({
    combo: formatComboResponse(deletedCombo, authResult),
  });
}
