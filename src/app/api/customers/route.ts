import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Prisma } from "@prisma/client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MANAGEMENT_ROLES,
  STAFF_ROLES,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
  VISIT_STATUS_COMPLETED,
} from "@/constants/common";
import { customerTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type {
  CustomerLastVisitService,
  CustomerRequestBody,
  UserRole,
} from "@/types";

const CUSTOMER_ACCESS_ROLES: UserRole[] = [
  ...MANAGEMENT_ROLES,
  ...STAFF_ROLES,
];
const CUSTOMER_SELECT = {
  id: true,
  shopId: true,
  name: true,
  phone: true,
  createdAt: true,
  visits: {
    where: {
      status: VISIT_STATUS_COMPLETED,
    },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      createdAt: true,
      completedAt: true,
      barber: {
        select: {
          fullName: true,
          id: true,
          username: true,
        },
      },
      skinner: {
        select: {
          fullName: true,
          id: true,
          username: true,
        },
      },
      visitPhotos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          photoUrl: true,
          createdAt: true,
        },
      },
      visitServices: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          serviceId: true,
          comboId: true,
          price: true,
          serviceNameSnapshot: true,
          comboNameSnapshot: true,
          comboPriceSnapshot: true,
          service: {
            select: {
              name: true,
            },
          },
          combo: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
} as const;

type CustomerRecord = Prisma.CustomerGetPayload<{
  select: typeof CUSTOMER_SELECT;
}>;

function isCustomerRequestBody(body: unknown): body is CustomerRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeCustomerInput(body: CustomerRequestBody) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
  };
}

function getCustomerPage(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page"));

  return Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
}

function formatCustomerResponse(customer: CustomerRecord) {
  const lastVisit = customer.visits[0] ?? null;
  const seenComboIds = new Set<string>();
  const services = lastVisit
    ? lastVisit.visitServices.reduce<CustomerLastVisitService[]>(
      (items, visitService) => {
        if (visitService.comboId) {
          if (seenComboIds.has(visitService.comboId)) {
            return items;
          }

          seenComboIds.add(visitService.comboId);

          return [
            ...items,
            {
              id: visitService.id,
              name:
                visitService.comboNameSnapshot ??
                visitService.combo?.name ??
                customerTexts.lookup.noServices,
              type: VISIT_ITEM_TYPE_COMBO,
              price: Number(
                (
                  visitService.comboPriceSnapshot ?? visitService.price
                ).toString(),
              ),
            },
          ];
        }

        return [
          ...items,
          {
            id: visitService.id,
            name:
              visitService.serviceNameSnapshot ??
              visitService.service?.name ??
              customerTexts.lookup.noServices,
            type: VISIT_ITEM_TYPE_SERVICE,
            price: Number(visitService.price.toString()),
          },
        ];
      },
      [],
    )
    : [];

  return {
    id: customer.id,
    shopId: customer.shopId,
    name: customer.name,
    phone: customer.phone,
    createdAt: customer.createdAt.toISOString(),
    lastVisit: lastVisit
      ? {
          id: lastVisit.id,
          createdAt: lastVisit.createdAt.toISOString(),
          completedAt: lastVisit.completedAt?.toISOString() ?? null,
          barber: lastVisit.barber,
          skinner: lastVisit.skinner,
          photos: lastVisit.visitPhotos.map((photo) => ({
            id: photo.id,
            photoUrl: photo.photoUrl,
            createdAt: photo.createdAt.toISOString(),
          })),
          services,
        }
      : null,
  };
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
    !CUSTOMER_ACCESS_ROLES.includes(token.role as UserRole) ||
    !token.shop_id
  ) {
    return { error: customerTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id, staffId: token.id };
}

export async function GET(request: NextRequest) {
  const authResult = await getStaffShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const searchTerm = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const page = getCustomerPage(request);

  const customers = await prisma.customer.findMany({
    where: {
      shopId: authResult.shopId,
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { phone: { contains: searchTerm } },
            ],
          }
        : {
            visits: {
              some: {
                createdBy: authResult.staffId,
              },
            },
          }),
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * DEFAULT_PAGE_SIZE,
    take: DEFAULT_PAGE_SIZE,
    select: CUSTOMER_SELECT,
  });

  return NextResponse.json({
    customers: customers.map(formatCustomerResponse),
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await getStaffShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
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

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      shopId: authResult.shopId,
      phone: customerInput.phone,
    },
    select: { id: true },
  });

  if (existingCustomer) {
    return NextResponse.json(
      { error: customerTexts.api.errors.duplicatePhone },
      { status: 400 },
    );
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        shopId: authResult.shopId,
        name: customerInput.name,
        phone: customerInput.phone,
      },
      select: CUSTOMER_SELECT,
    });

    return NextResponse.json(
      { customer: formatCustomerResponse(customer) },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: customerTexts.api.errors.duplicatePhone },
        { status: 400 },
      );
    }

    throw error;
  }
}
