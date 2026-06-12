import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import { STAFF_ROLES } from "@/constants/common";
import { customerTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { CustomerRequestBody } from "@/types";

type CustomerRouteContext = {
  params: Promise<{ id?: string }>;
};

const CUSTOMER_PROFILE_SELECT = {
  id: true,
  name: true,
  phone: true,
  createdAt: true,
} as const;

function isCustomerRequestBody(body: unknown): body is CustomerRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeCustomerInput(body: CustomerRequestBody) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
  };
}

async function getCustomerId(context: CustomerRouteContext) {
  const params = await context.params;
  return typeof params.id === "string" ? params.id : "";
}

async function getStaffShopId(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: customerTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !STAFF_ROLES.includes(token.role as (typeof STAFF_ROLES)[number]) ||
    !token.shop_id
  ) {
    return { error: customerTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

export async function PATCH(
  request: NextRequest,
  context: CustomerRouteContext,
) {
  const authResult = await getStaffShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const customerId = await getCustomerId(context);

  if (!customerId) {
    return NextResponse.json(
      { error: customerTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isCustomerRequestBody(body)) {
    return NextResponse.json(
      { error: customerTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const customerInput = normalizeCustomerInput(body);

  if (!customerInput.name) {
    return NextResponse.json(
      { error: customerTexts.api.errors.missingName },
      { status: 400 },
    );
  }

  if (!customerInput.phone) {
    return NextResponse.json(
      { error: customerTexts.api.errors.missingPhone },
      { status: 400 },
    );
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      shopId: authResult.shopId,
    },
    select: { id: true },
  });

  if (!customer) {
    return NextResponse.json(
      { error: customerTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const duplicateCustomer = await prisma.customer.findFirst({
    where: {
      id: { not: customer.id },
      shopId: authResult.shopId,
      phone: customerInput.phone,
    },
    select: { id: true },
  });

  if (duplicateCustomer) {
    return NextResponse.json(
      { error: customerTexts.detail.errors.duplicatePhone },
      { status: 400 },
    );
  }

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: customerInput.name,
        phone: customerInput.phone,
      },
      select: CUSTOMER_PROFILE_SELECT,
    });

    return NextResponse.json({
      customer: {
        ...updatedCustomer,
        createdAt: updatedCustomer.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: customerTexts.detail.errors.duplicatePhone },
        { status: 400 },
      );
    }

    throw error;
  }
}
