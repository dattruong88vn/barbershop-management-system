import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_INACTIVE,
  USER_ROLE_OWNER,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id?: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const [token, params, body] = await Promise.all([
    getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }),
    context.params,
    request.json().catch(() => null) as Promise<unknown>,
  ]);

  if (!token?.id) {
    return NextResponse.json({ error: branchTexts.api.errors.unauthorized }, { status: 401 });
  }
  if (token.role !== USER_ROLE_OWNER || !token.shop_id) {
    return NextResponse.json({ error: branchTexts.api.errors.forbidden }, { status: 403 });
  }
  if (!params.id) {
    return NextResponse.json({ error: branchTexts.api.errors.missingBranchId }, { status: 400 });
  }

  const requestedStatus =
    typeof body === "object" && body !== null && "status" in body
      ? (body as { status?: unknown }).status
      : null;
  if (requestedStatus !== BRANCH_STATUS_ACTIVE && requestedStatus !== BRANCH_STATUS_INACTIVE) {
    return NextResponse.json({ error: branchTexts.api.errors.invalidStatus }, { status: 400 });
  }

  const branch = await prisma.branch.findFirst({
    where: { id: params.id, shopId: token.shop_id },
    select: { id: true, managerId: true, status: true },
  });
  if (!branch) {
    return NextResponse.json({ error: branchTexts.api.errors.notFound }, { status: 404 });
  }

  if (requestedStatus === BRANCH_STATUS_INACTIVE) {
    const openVisit = await prisma.visit.findFirst({
      where: {
        branchId: branch.id,
        shopId: token.shop_id,
        status: { in: [VISIT_STATUS_PENDING, VISIT_STATUS_IN_PROGRESS] },
      },
      select: { id: true },
    });

    if (openVisit) {
      return NextResponse.json({ error: branchTexts.api.errors.openVisits }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.branch.update({
        where: { id: branch.id },
        data: {
          status: BRANCH_STATUS_INACTIVE,
          deactivatedAt: new Date(),
          deactivatedBy: token.id,
        },
      }),
      prisma.user.updateMany({
        where: {
          shopId: token.shop_id,
          status: "active",
          OR: [
            { branchId: branch.id },
            ...(branch.managerId
              ? [
                  {
                    id: branch.managerId,
                    managedBranches: {
                      none: {
                        id: { not: branch.id },
                        status: BRANCH_STATUS_ACTIVE,
                      },
                    },
                  },
                ]
              : []),
          ],
        },
        data: { status: "branch_suspended" },
      }),
    ]);
  } else {
    await prisma.branch.update({
      where: { id: branch.id },
      data: {
        status: BRANCH_STATUS_ACTIVE,
        deactivatedAt: null,
        deactivatedBy: null,
      },
    });
  }

  const updatedBranch = await prisma.branch.findUnique({
    where: { id: branch.id },
    select: {
      id: true,
      shopId: true,
      managerId: true,
      name: true,
      address: true,
      status: true,
      createdAt: true,
      manager: { select: { fullName: true, id: true, username: true } },
    },
  });

  return NextResponse.json({ branch: updatedBranch });
}
