import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
} from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { BranchRequestBody } from "@/types";

const BRANCH_SELECT = {
  id: true,
  shopId: true,
  managerId: true,
  name: true,
  address: true,
  status: true,
  createdAt: true,
  manager: {
    select: {
      fullName: true,
      id: true,
      username: true,
    },
  },
  _count: {
    select: {
      users: true,
    },
  },
} as const;

function isBranchRequestBody(body: unknown): body is BranchRequestBody {
  return typeof body === "object" && body !== null;
}

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

async function getBranchAuth(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: branchTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    (token.role !== USER_ROLE_OWNER && token.role !== USER_ROLE_MANAGER) ||
    !token.shop_id
  ) {
    return { error: branchTexts.api.errors.forbidden, status: 403 };
  }

  return {
    role: token.role,
    shopId: token.shop_id,
    userId: token.id,
  };
}

async function isManagerValid(managerId: string | null, shopId: string) {
  if (!managerId) return true;

  const manager = await prisma.user.findFirst({
    where: {
      id: managerId,
      shopId,
      role: USER_ROLE_MANAGER,
      status: "active",
    },
    select: { id: true },
  });

  return Boolean(manager);
}

export async function GET(request: NextRequest) {
  const authResult = await getBranchAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const searchParams = request.nextUrl?.searchParams ?? new URL(request.url).searchParams;
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status");
  const branches = await prisma.branch.findMany({
    where: {
      shopId: authResult.shopId,
      ...(authResult.role === USER_ROLE_MANAGER
        ? { managerId: authResult.userId }
        : {}),
      ...(status === "active" || status === "inactive" ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: BRANCH_SELECT,
  });

  return NextResponse.json({ branches });
}

export async function POST(request: NextRequest) {
  const authResult = await getBranchAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  if (authResult.role !== USER_ROLE_OWNER) {
    return NextResponse.json(
      { error: branchTexts.api.errors.forbidden },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isBranchRequestBody(body)) {
    return NextResponse.json(
      { error: branchTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const input = normalizeBranchInput(body);

  if (!input.name) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingName },
      { status: 400 },
    );
  }

  if (!input.address) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingAddress },
      { status: 400 },
    );
  }

  if (!(await isManagerValid(input.managerId, authResult.shopId))) {
    return NextResponse.json(
      { error: branchTexts.api.errors.invalidManager },
      { status: 400 },
    );
  }

  const branch = await prisma.branch.create({
    data: {
      shopId: authResult.shopId,
      ...input,
    },
    select: BRANCH_SELECT,
  });

  return NextResponse.json({ branch }, { status: 201 });
}
