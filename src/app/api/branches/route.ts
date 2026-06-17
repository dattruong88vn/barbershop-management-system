import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  MANAGEMENT_ROLES,
  USER_ROLE_MANAGER,
  type ManagementRoleValue,
} from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { BranchRequestBody, UserRole } from "@/types";

function isBranchRequestBody(body: unknown): body is BranchRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeBranchInput(body: BranchRequestBody) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    address: typeof body.address === "string" ? body.address.trim() : "",
  };
}

async function getOwnerShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: branchTexts.api.errors.unauthorized, status: 401 };
  }

  if (token.role !== ("owner" satisfies UserRole) || !token.shop_id) {
    return { error: branchTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

async function getManagementShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: branchTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.includes(token.role as ManagementRoleValue) ||
    !token.shop_id
  ) {
    return { error: branchTexts.api.errors.forbidden, status: 403 };
  }

  if (token.role === USER_ROLE_MANAGER && !token.branch_id) {
    return { error: branchTexts.api.errors.forbidden, status: 403 };
  }

  return {
    branchId: token.role === USER_ROLE_MANAGER ? token.branch_id : null,
    shopId: token.shop_id,
  };
}

export async function GET(request: NextRequest) {
  const authResult = await getManagementShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const branches = await prisma.branch.findMany({
    where: {
      shopId: authResult.shopId,
      ...(authResult.branchId ? { id: authResult.branchId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      shopId: true,
      name: true,
      address: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ branches });
}

export async function POST(request: NextRequest) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isBranchRequestBody(body)) {
    return NextResponse.json(
      { error: branchTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const branchInput = normalizeBranchInput(body);

  if (!branchInput.name) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingName },
      { status: 400 },
    );
  }

  if (!branchInput.address) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingAddress },
      { status: 400 },
    );
  }

  const branch = await prisma.branch.create({
    data: {
      shopId: authResult.shopId,
      name: branchInput.name,
      address: branchInput.address,
    },
    select: {
      id: true,
      shopId: true,
      name: true,
      address: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ branch }, { status: 201 });
}
