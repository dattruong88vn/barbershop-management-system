import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  STAFF_ROLES,
  USER_ROLE_OWNER,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { StaffTransferInput } from "@/types";

function normalizeBody(body: unknown): StaffTransferInput | null {
  if (typeof body !== "object" || body === null) return null;

  const input = body as Record<string, unknown>;
  const staffIds = Array.isArray(input.staffIds)
    ? [...new Set(input.staffIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())))]
    : [];
  const targetBranchId =
    typeof input.targetBranchId === "string" ? input.targetBranchId.trim() : "";

  return staffIds.length && targetBranchId ? { staffIds, targetBranchId } : null;
}

export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.id) {
    return NextResponse.json({ error: staffTexts.api.errors.unauthorized }, { status: 401 });
  }
  if (token.role !== USER_ROLE_OWNER || !token.shop_id) {
    return NextResponse.json({ error: staffTexts.api.errors.forbidden }, { status: 403 });
  }

  const input = normalizeBody(await request.json().catch(() => null));
  if (!input) {
    return NextResponse.json({ error: staffTexts.ownerStaff.errors.invalidTransfer }, { status: 400 });
  }

  const [targetBranch, staff, openVisit] = await Promise.all([
    prisma.branch.findFirst({
      where: { id: input.targetBranchId, shopId: token.shop_id, status: "active" },
      select: { id: true },
    }),
    prisma.user.findMany({
      where: {
        id: { in: input.staffIds },
        shopId: token.shop_id,
        role: { in: [...STAFF_ROLES] },
        status: { in: ["active", "branch_suspended"] },
      },
      select: { id: true },
    }),
    prisma.visit.findFirst({
      where: {
        shopId: token.shop_id,
        status: { in: [VISIT_STATUS_PENDING, VISIT_STATUS_IN_PROGRESS] },
        OR: [
          { barberId: { in: input.staffIds } },
          { skinnerId: { in: input.staffIds } },
        ],
      },
      select: { id: true },
    }),
  ]);

  if (!targetBranch || staff.length !== input.staffIds.length) {
    return NextResponse.json({ error: staffTexts.ownerStaff.errors.invalidTransfer }, { status: 400 });
  }
  if (openVisit) {
    return NextResponse.json({ error: staffTexts.ownerStaff.errors.openVisits }, { status: 400 });
  }

  const result = await prisma.$transaction(async (transaction) =>
    transaction.user.updateMany({
      where: { id: { in: input.staffIds }, shopId: token.shop_id },
      data: { branchId: targetBranch.id, status: "active" },
    }),
  );

  return NextResponse.json({ transferredCount: result.count });
}
