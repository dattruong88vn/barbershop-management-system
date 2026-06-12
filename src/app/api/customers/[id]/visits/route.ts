import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  STAFF_ROLES,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
} from "@/constants/common";
import { customerTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { CustomerVisit } from "@/types";

const CUSTOMER_VISITS_SELECT = {
  id: true,
  name: true,
  phone: true,
  createdAt: true,
  visits: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      completedAt: true,
      lastUpdatedBy: true,
      status: true,
      totalPrice: true,
      barber: {
        select: {
          id: true,
          username: true,
          status: true,
        },
      },
      skinner: {
        select: {
          id: true,
          username: true,
          status: true,
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

type CustomerVisitsRecord = Prisma.CustomerGetPayload<{
  select: typeof CUSTOMER_VISITS_SELECT;
}>;

type CustomerVisitRecord = CustomerVisitsRecord["visits"][number];
type CustomerVisitStaffRecord = CustomerVisitRecord["barber"];

type CustomerVisitsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatVisitStaff(staff: CustomerVisitStaffRecord) {
  return staff
    ? {
        id: staff.id,
        username: staff.username,
      }
    : null;
}

function formatCustomerVisit(visit: CustomerVisitRecord): CustomerVisit {
  return {
    id: visit.id,
    createdAt: visit.createdAt.toISOString(),
    completedAt: visit.completedAt?.toISOString() ?? null,
    lastUpdatedBy: visit.lastUpdatedBy,
    status: visit.status,
    totalPrice: Number(visit.totalPrice.toString()),
    barber: formatVisitStaff(visit.barber),
    skinner: formatVisitStaff(visit.skinner),
    photos: visit.visitPhotos.map((photo) => ({
      id: photo.id,
      photoUrl: photo.photoUrl,
      createdAt: photo.createdAt.toISOString(),
    })),
    services: visit.visitServices.map((visitService) => ({
      id: visitService.id,
      itemId: visitService.serviceId ?? visitService.comboId,
      name:
        visitService.service?.name ??
        visitService.combo?.name ??
        customerTexts.detail.noServices,
      type: visitService.service
        ? VISIT_ITEM_TYPE_SERVICE
        : VISIT_ITEM_TYPE_COMBO,
      price: Number(visitService.price.toString()),
    })),
  };
}

function getActiveVisitStaffSuggestion(staff: CustomerVisitStaffRecord) {
  return staff?.status === "active" ? formatVisitStaff(staff) : null;
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

export async function GET(
  request: NextRequest,
  context: CustomerVisitsRouteContext,
) {
  const authResult = await getStaffShopId(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      shopId: authResult.shopId,
    },
    select: CUSTOMER_VISITS_SELECT,
  });

  if (!customer) {
    return NextResponse.json(
      { error: customerTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  const visits = customer.visits.map(formatCustomerVisit);
  const lastVisit = visits[0] ?? null;
  const lastVisitRecord = customer.visits[0] ?? null;

  return NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.createdAt.toISOString(),
    },
    visits,
    suggestions: lastVisit
      ? {
          services: lastVisit.services,
          barber: getActiveVisitStaffSuggestion(
            lastVisitRecord?.barber ?? null,
          ),
          skinner: getActiveVisitStaffSuggestion(
            lastVisitRecord?.skinner ?? null,
          ),
        }
      : null,
  });
}
