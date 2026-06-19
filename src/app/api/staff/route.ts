import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import {
  MANAGEMENT_ROLES,
  OWNER_STAFF_ROLES,
  STAFF_GENDERS,
  STAFF_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  type ManagementRoleValue,
} from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { StaffRequestBody, StaffRole } from "@/types";

const STAFF_SELECT = {
  id: true,
  shopId: true,
  branchId: true,
  username: true,
  fullName: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  hometown: true,
  currentAddress: true,
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
  managedBranches: {
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
  return (
    typeof role === "string" && OWNER_STAFF_ROLES.includes(role as StaffRole)
  );
}

function normalizeStaffInput(body: StaffRequestBody) {
  const dateOfBirth =
    typeof body.dateOfBirth === "string" && body.dateOfBirth.trim()
      ? new Date(`${body.dateOfBirth.trim()}T00:00:00.000Z`)
      : null;

  return {
    username: typeof body.username === "string" ? body.username.trim() : "",
    fullName: typeof body.fullName === "string" ? body.fullName.trim() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    dateOfBirth,
    gender:
      typeof body.gender === "string" &&
      STAFF_GENDERS.includes(body.gender as (typeof STAFF_GENDERS)[number])
        ? (body.gender as (typeof STAFF_GENDERS)[number])
        : null,
    hometown: typeof body.hometown === "string" ? body.hometown.trim() : "",
    currentAddress:
      typeof body.currentAddress === "string" ? body.currentAddress.trim() : "",
    identityCardFrontKey:
      typeof body.identityCardFrontKey === "string" ? body.identityCardFrontKey.trim() : "",
    identityCardBackKey:
      typeof body.identityCardBackKey === "string" ? body.identityCardBackKey.trim() : "",
    password: typeof body.password === "string" ? body.password.trim() : "",
    role: isStaffRole(body.role) ? body.role : null,
    branchId:
      typeof body.branchId === "string" && body.branchId.trim()
        ? body.branchId.trim()
        : null,
    managedBranchIds: Array.isArray(body.managedBranchIds)
      ? body.managedBranchIds.filter(
          (branchId): branchId is string =>
            typeof branchId === "string" && Boolean(branchId.trim()),
        )
      : [],
  };
}

async function getManagementAuth(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: staffTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.includes(token.role as ManagementRoleValue) ||
    !token.shop_id
  ) {
    return { error: staffTexts.api.errors.forbidden, status: 403 };
  }

  if (token.role === USER_ROLE_MANAGER && !token.branch_id) {
    return { error: staffTexts.api.errors.forbidden, status: 403 };
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
      return { error: staffTexts.api.errors.forbidden, status: 403 };
    }
  }

  return {
    branchId: token.role === USER_ROLE_MANAGER ? token.branch_id : null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
  };
}

async function isBranchValid(branchId: string | null, shopId: string) {
  if (!branchId) {
    return true;
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      shopId,
      status: "active",
    },
    select: { id: true },
  });

  return Boolean(branch);
}

async function areManagedBranchesValid(branchIds: string[], shopId: string) {
  if (branchIds.length === 0) {
    return false;
  }

  const uniqueBranchIds = Array.from(new Set(branchIds));
  const branches = await prisma.branch.findMany({
    where: {
      id: { in: uniqueBranchIds },
      shopId,
      status: "active",
    },
    select: { id: true },
  });

  return branches.length === uniqueBranchIds.length;
}

export async function GET(request: NextRequest) {
  const authResult = await getManagementAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const staff = await prisma.user.findMany({
    where: {
      shopId: authResult.shopId,
      ...(authResult.branchId ? { branchId: authResult.branchId } : {}),
      role: {
        in: authResult.branchId ? [...STAFF_ROLES] : [...OWNER_STAFF_ROLES],
      },
      status: "active",
    },
    orderBy: { createdAt: "desc" },
    select: STAFF_SELECT,
  });

  return NextResponse.json({ staff });
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

  if (!isStaffRequestBody(body)) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const staffInput = normalizeStaffInput(body);
  const isManagerRole = staffInput.role === USER_ROLE_MANAGER;
  const staffBranchId = isManagerRole
    ? null
    : authResult.branchId ?? staffInput.branchId;

  if (!staffInput.username) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingUsername },
      { status: 400 },
    );
  }

  if (!staffInput.fullName) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingFullName },
      { status: 400 },
    );
  }

  if (!staffInput.phone) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingPhone },
      { status: 400 },
    );
  }

  if (!staffInput.dateOfBirth || Number.isNaN(staffInput.dateOfBirth.getTime())) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidDateOfBirth },
      { status: 400 },
    );
  }

  if (!staffInput.gender) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidGender },
      { status: 400 },
    );
  }

  const identityKeyPrefix = `staff-documents/${authResult.shopId}/`;
  if (
    (staffInput.identityCardFrontKey &&
      !staffInput.identityCardFrontKey.startsWith(identityKeyPrefix)) ||
    (staffInput.identityCardBackKey &&
      !staffInput.identityCardBackKey.startsWith(identityKeyPrefix))
  ) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidIdentityImage },
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

  const staffRole = staffInput.role;

  if (isManagerRole && authResult.role !== USER_ROLE_OWNER) {
    return NextResponse.json(
      { error: staffTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const isValidBranch = isManagerRole
    ? await areManagedBranchesValid(
        staffInput.managedBranchIds,
        authResult.shopId,
      )
    : await isBranchValid(staffBranchId, authResult.shopId);

  if (!isValidBranch) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidBranch },
      { status: 400 },
    );
  }

  try {
    const staffMember = await prisma.$transaction(async (tx) => {
      const createdStaffMember = await tx.user.create({
        data: {
          shopId: authResult.shopId,
          branchId: staffBranchId,
          username: staffInput.username,
          fullName: staffInput.fullName,
          phone: staffInput.phone,
          dateOfBirth: staffInput.dateOfBirth,
          gender: staffInput.gender,
          hometown: staffInput.hometown || null,
          currentAddress: staffInput.currentAddress || null,
          identityCardFrontKey: staffInput.identityCardFrontKey || null,
          identityCardBackKey: staffInput.identityCardBackKey || null,
          passwordHash: hashPassword(staffInput.password),
          role: staffRole,
          status: "active",
          isFirstLogin: true,
        },
        select: { id: true },
      });

      if (isManagerRole) {
        await tx.branch.updateMany({
          where: {
            id: { in: Array.from(new Set(staffInput.managedBranchIds)) },
            shopId: authResult.shopId,
            status: "active",
          },
          data: { managerId: createdStaffMember.id },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: createdStaffMember.id },
        select: STAFF_SELECT,
      });
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
