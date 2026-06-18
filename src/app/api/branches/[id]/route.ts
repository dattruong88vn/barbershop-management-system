import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  STAFF_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
} from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { BranchRequestBody } from "@/types";

type BranchRouteContext = { params: Promise<{ id?: string }> };

const BRANCH_DETAIL_SELECT = {
  id: true,
  shopId: true,
  managerId: true,
  name: true,
  address: true,
  status: true,
  createdAt: true,
  manager: { select: { id: true, username: true } },
  users: {
    where: { role: { in: [...STAFF_ROLES] }, status: "active" as const },
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      shopId: true,
      branchId: true,
      username: true,
      role: true,
      status: true,
      isFirstLogin: true,
      createdAt: true,
      branch: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.BranchSelect;

function normalizeBranchInput(body: BranchRequestBody) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    address: typeof body.address === "string" ? body.address.trim() : "",
    managerId:
      typeof body.managerId === "string" && body.managerId.trim()
        ? body.managerId.trim()
        : null,
  };
}

async function getContext(request: NextRequest, context: BranchRouteContext) {
  const [token, params] = await Promise.all([
    getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }),
    context.params,
  ]);

  if (!token?.id) {
    return { error: branchTexts.api.errors.unauthorized, status: 401 };
  }
  if (
    (token.role !== USER_ROLE_OWNER && token.role !== USER_ROLE_MANAGER) ||
    !token.shop_id
  ) {
    return { error: branchTexts.api.errors.forbidden, status: 403 };
  }
  if (!params.id) {
    return { error: branchTexts.api.errors.missingBranchId, status: 400 };
  }

  return {
    branchId: params.id,
    role: token.role,
    shopId: token.shop_id,
    userId: token.id,
  };
}

export async function GET(request: NextRequest, context: BranchRouteContext) {
  const auth = await getContext(request, context);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: auth.branchId,
      shopId: auth.shopId,
      ...(auth.role === USER_ROLE_MANAGER ? { managerId: auth.userId } : {}),
    },
    select: BRANCH_DETAIL_SELECT,
  });

  if (!branch) {
    return NextResponse.json(
      { error: branchTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const { users, ...branchData } = branch;
  return NextResponse.json({ branch: { ...branchData, staff: users } });
}

export async function PATCH(request: NextRequest, context: BranchRouteContext) {
  const auth = await getContext(request, context);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== USER_ROLE_OWNER) {
    return NextResponse.json(
      { error: branchTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: branchTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const input = normalizeBranchInput(body as BranchRequestBody);
  if (!input.name || !input.address) {
    return NextResponse.json(
      {
        error: !input.name
          ? branchTexts.api.errors.missingName
          : branchTexts.api.errors.missingAddress,
      },
      { status: 400 },
    );
  }

  const [branch, manager] = await Promise.all([
    prisma.branch.findFirst({
      where: { id: auth.branchId, shopId: auth.shopId },
      select: { id: true, status: true },
    }),
    input.managerId
      ? prisma.user.findFirst({
          where: {
            id: input.managerId,
            shopId: auth.shopId,
            role: USER_ROLE_MANAGER,
            status: "active",
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!branch) {
    return NextResponse.json(
      { error: branchTexts.api.errors.notFound },
      { status: 404 },
    );
  }
  if (branch.status === "inactive") {
    return NextResponse.json(
      { error: branchTexts.api.errors.inactiveBranch },
      { status: 400 },
    );
  }
  if (input.managerId && !manager) {
    return NextResponse.json(
      { error: branchTexts.api.errors.invalidManager },
      { status: 400 },
    );
  }

  const updatedBranch = await prisma.branch.update({
    where: { id: branch.id },
    data: input,
    select: BRANCH_DETAIL_SELECT,
  });
  const { users, ...branchData } = updatedBranch;
  return NextResponse.json({ branch: { ...branchData, staff: users } });
}

export async function DELETE(
  _request: NextRequest,
  _context: BranchRouteContext,
) {
  void _request;
  void _context;

  return NextResponse.json(
    { error: branchTexts.api.errors.branchInUse },
    { status: 405 },
  );
}
