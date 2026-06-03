import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import { branchTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { BranchRequestBody, UserRole } from "@/types";

type BranchRouteContext = {
  params: Promise<{ id?: string }> | { id?: string };
};

function isBranchRequestBody(body: unknown): body is BranchRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeBranchInput(body: BranchRequestBody) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    address: typeof body.address === "string" ? body.address.trim() : "",
  };
}

async function getBranchId(context: BranchRouteContext) {
  const params = await Promise.resolve(context.params);
  return typeof params.id === "string" ? params.id : "";
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

async function findBranch(branchId: string, shopId: string) {
  return prisma.branch.findFirst({
    where: {
      id: branchId,
      shopId,
    },
    select: {
      id: true,
      shopId: true,
      name: true,
      address: true,
      createdAt: true,
    },
  });
}

export async function GET(request: NextRequest, context: BranchRouteContext) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const branchId = await getBranchId(context);

  if (!branchId) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingBranchId },
      { status: 400 },
    );
  }

  const branch = await findBranch(branchId, authResult.shopId);

  if (!branch) {
    return NextResponse.json(
      { error: branchTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  return NextResponse.json({ branch });
}

export async function PATCH(request: NextRequest, context: BranchRouteContext) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const branchId = await getBranchId(context);

  if (!branchId) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingBranchId },
      { status: 400 },
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

  const branch = await findBranch(branchId, authResult.shopId);

  if (!branch) {
    return NextResponse.json(
      { error: branchTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const updatedBranch = await prisma.branch.update({
    where: { id: branch.id },
    data: branchInput,
    select: {
      id: true,
      shopId: true,
      name: true,
      address: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ branch: updatedBranch });
}

export async function DELETE(
  request: NextRequest,
  context: BranchRouteContext,
) {
  const authResult = await getOwnerShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const branchId = await getBranchId(context);

  if (!branchId) {
    return NextResponse.json(
      { error: branchTexts.api.errors.missingBranchId },
      { status: 400 },
    );
  }

  const branch = await findBranch(branchId, authResult.shopId);

  if (!branch) {
    return NextResponse.json(
      { error: branchTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  try {
    await prisma.branch.delete({
      where: { id: branch.id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: branchTexts.api.errors.branchInUse },
        { status: 400 },
      );
    }

    throw error;
  }

  return NextResponse.json({ branch });
}
