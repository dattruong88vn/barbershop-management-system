import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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
import { R2_PRIVATE_BUCKET_NAME, r2Client } from "@/lib/r2";
import type { StaffRequestBody, StaffRole } from "@/types";

type StaffRouteContext = {
  params: Promise<{ id?: string }>;
};

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

const STAFF_INTERNAL_SELECT = {
  ...STAFF_SELECT,
  identityCardFrontKey: true,
  identityCardBackKey: true,
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

async function getStaffId(context: StaffRouteContext) {
  const params = await context.params;
  return typeof params.id === "string" ? params.id : "";
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

async function findStaffMember(
  staffId: string,
  shopId: string,
  branchId: string | null,
) {
  return prisma.user.findFirst({
    where: {
      id: staffId,
      shopId,
      ...(branchId ? { branchId } : {}),
      role: { in: branchId ? [...STAFF_ROLES] : [...OWNER_STAFF_ROLES] },
      status: "active",
    },
    select: STAFF_INTERNAL_SELECT,
  });
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

export async function GET(request: NextRequest, context: StaffRouteContext) {
  const authResult = await getManagementAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const staffId = await getStaffId(context);

  if (!staffId) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingStaffId },
      { status: 400 },
    );
  }

  const staffMember = await findStaffMember(
    staffId,
    authResult.shopId,
    authResult.branchId,
  );

  if (!staffMember) {
    return NextResponse.json(
      { error: staffTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const {
    identityCardFrontKey,
    identityCardBackKey,
    ...publicStaffMember
  } = staffMember;

  return NextResponse.json({
    staffMember: {
      ...publicStaffMember,
      hasIdentityCardFront: Boolean(identityCardFrontKey),
      hasIdentityCardBack: Boolean(identityCardBackKey),
    },
  });
}

export async function PATCH(request: NextRequest, context: StaffRouteContext) {
  const authResult = await getManagementAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const staffId = await getStaffId(context);

  if (!staffId) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingStaffId },
      { status: 400 },
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

  if (!staffInput.role) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidRole },
      { status: 400 },
    );
  }

  const staffRole = staffInput.role;

  if (staffInput.password && staffInput.password.length < 8) {
    return NextResponse.json(
      { error: staffTexts.api.errors.passwordTooShort },
      { status: 400 },
    );
  }

  const staffMember = await findStaffMember(
    staffId,
    authResult.shopId,
    authResult.branchId,
  );

  if (!staffMember) {
    return NextResponse.json(
      { error: staffTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const identityCardFrontKey =
    staffInput.identityCardFrontKey || staffMember.identityCardFrontKey || "";
  const identityCardBackKey =
    staffInput.identityCardBackKey || staffMember.identityCardBackKey || "";
  const identityKeyPrefix = `staff-documents/${authResult.shopId}/`;

  if (
    (identityCardFrontKey && !identityCardFrontKey.startsWith(identityKeyPrefix)) ||
    (identityCardBackKey && !identityCardBackKey.startsWith(identityKeyPrefix))
  ) {
    return NextResponse.json(
      { error: staffTexts.api.errors.invalidIdentityImage },
      { status: 400 },
    );
  }

  const isManagerRole = staffInput.role === USER_ROLE_MANAGER;
  const staffBranchId = isManagerRole
    ? null
    : authResult.branchId ?? staffInput.branchId;

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

  const updatedPasswordData = staffInput.password
    ? {
        passwordHash: hashPassword(staffInput.password),
        isFirstLogin: true,
      }
    : {};

  try {
    const updatedStaffMember = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: staffMember.id },
        data: {
          username: staffInput.username,
          fullName: staffInput.fullName,
          phone: staffInput.phone,
          dateOfBirth: staffInput.dateOfBirth,
          gender: staffInput.gender,
          hometown: staffInput.hometown || null,
          currentAddress: staffInput.currentAddress || null,
          identityCardFrontKey: identityCardFrontKey || null,
          identityCardBackKey: identityCardBackKey || null,
          role: staffRole,
          branchId: staffBranchId,
          ...updatedPasswordData,
        },
        select: { id: true },
      });

      if (authResult.role === USER_ROLE_OWNER) {
        await tx.branch.updateMany({
          where: {
            managerId: staffMember.id,
            shopId: authResult.shopId,
          },
          data: { managerId: null },
        });
      }

      if (isManagerRole) {
        await tx.branch.updateMany({
          where: {
            id: { in: Array.from(new Set(staffInput.managedBranchIds)) },
            shopId: authResult.shopId,
            status: "active",
          },
          data: { managerId: staffMember.id },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: staffMember.id },
        select: STAFF_SELECT,
      });
    });

    const staleIdentityKeys = [
      staffMember.identityCardFrontKey !== identityCardFrontKey
        ? staffMember.identityCardFrontKey
        : null,
      staffMember.identityCardBackKey !== identityCardBackKey
        ? staffMember.identityCardBackKey
        : null,
    ].filter((key): key is string => Boolean(key));

    await Promise.allSettled(
      staleIdentityKeys.map((key) =>
        r2Client.send(
          new DeleteObjectCommand({ Bucket: R2_PRIVATE_BUCKET_NAME, Key: key }),
        ),
      ),
    );

    return NextResponse.json({ staffMember: updatedStaffMember });
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

export async function DELETE(
  request: NextRequest,
  context: StaffRouteContext,
) {
  const authResult = await getManagementAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const staffId = await getStaffId(context);

  if (!staffId) {
    return NextResponse.json(
      { error: staffTexts.api.errors.missingStaffId },
      { status: 400 },
    );
  }

  const staffMember = await findStaffMember(
    staffId,
    authResult.shopId,
    authResult.branchId,
  );

  if (!staffMember) {
    return NextResponse.json(
      { error: staffTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const inactiveStaffMember = await prisma.$transaction(async (tx) => {
    await tx.branch.updateMany({
      where: {
        managerId: staffMember.id,
        shopId: authResult.shopId,
      },
      data: { managerId: null },
    });

    return tx.user.update({
      where: { id: staffMember.id },
      data: { status: "inactive" },
      select: STAFF_SELECT,
    });
  });

  return NextResponse.json({ staffMember: inactiveStaffMember });
}
