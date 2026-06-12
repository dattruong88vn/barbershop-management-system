import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import { STAFF_ROLES } from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { StaffRequestBody, StaffRole, UserRole } from "@/types";

const STAFF_SELECT = {
  id: true,
  shopId: true,
  branchId: true,
  username: true,
  role: true,
  status: true,
  isFirstLogin: true,
  createdAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

function isStaffRequestBody(body: unknown): body is StaffRequestBody {
  return typeof body === "object" && body !== null;
}

function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === "string" && STAFF_ROLES.includes(role as StaffRole);
}

function normalizeStaffInput(body: StaffRequestBody) {
  return {
    username: typeof body.username === "string" ? body.username.trim() : "",
    password: typeof body.password === "string" ? body.password.trim() : "",
    role: isStaffRole(body.role) ? body.role : null,
    branchId:
      typeof body.branchId === "string" && body.branchId.trim()
        ? body.branchId.trim()
        : null,
  };
}

async function getOwnerShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: staffTexts.api.errors.unauthorized, status: 401 };
  }

  if (token.role !== ("owner" satisfies UserRole) || !token.shop_id) {
    return { error: staffTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

async function isBranchValid(branchId: string | null, shopId: string) {
  if (!branchId) {
    return true;
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      shopId,
    },
    select: { id: true },
  });

  return Boolean(branch);
}

export async function GET(request: NextRequest) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const staff = await prisma.user.findMany({
    where: {
      shopId: authResult.shopId,
      role: { in: [...STAFF_ROLES] },
      status: "active",
    },
    orderBy: { createdAt: "desc" },
    select: STAFF_SELECT,
  });

  return NextResponse.json({ staff });
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

  if (!isStaffRequestBody(body)) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const staffInput = normalizeStaffInput(body);

  if (!staffInput.username) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingUsername },
      { status: 400 },
    );
  }

  if (!staffInput.password) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingPassword },
      { status: 400 },
    );
  }

  if (staffInput.password.length < 8) {
    return NextResponse.json(
      { error: staffTexts.api.errors.passwordTooShort },
      { status: 400 },
    );
  }

  if (!staffInput.role) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidRole },
      { status: 400 },
    );
  }

  const isValidBranch = await isBranchValid(staffInput.branchId, authResult.shopId);

  if (!isValidBranch) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidBranch },
      { status: 400 },
    );
  }

  try {
    const staffMember = await prisma.user.create({
      data: {
        shopId: authResult.shopId,
        branchId: staffInput.branchId,
        username: staffInput.username,
        passwordHash: hashPassword(staffInput.password),
        role: staffInput.role,
        status: "active",
        isFirstLogin: true,
      },
      select: STAFF_SELECT,
    });

    return NextResponse.json({ staffMember }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: staffTexts.api.errors.duplicateUsername },
        { status: 400 },
      );
    }

    throw error;
  }
}
