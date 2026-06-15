import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import { customerTexts, visitTexts } from "@/constants/texts";
import {
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import { prisma } from "@/lib/prisma";
import { buildVisitServiceSnapshots } from "@/utils/visits";
import { isVisitStatus } from "@/utils/visits/visitStatus";
import type {
  CustomerVisit,
  UserRole,
  VisitCreateInput,
  VisitRequestBody,
} from "@/types";

const VISIT_ROLES: UserRole[] = [
  "owner",
  "manager",
  "receptionist",
  "barber",
  "skinner",
];
const VISIT_SELECT = {
  id: true,
  createdAt: true,
  completedAt: true,
  lastUpdatedBy: true,
  status: true,
  totalPrice: true,
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  barber: {
    select: {
      id: true,
      username: true,
    },
  },
  skinner: {
    select: {
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
} as const;

type VisitRecord = Prisma.VisitGetPayload<{
  select: typeof VISIT_SELECT;
}>;

type StaffAuthResult =
  | {
      role: UserRole;
      userId: string;
      shopId: string;
      branchId: string;
    }
  | {
      error: string;
      status: number;
    };

function isVisitRequestBody(body: unknown): body is VisitRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter((item): item is string => typeof item === "string" && Boolean(item)),
    ),
  ];
}

function normalizeNullableId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeVisitInput(body: VisitRequestBody): VisitCreateInput {
  return {
    customerId:
      typeof body.customerId === "string" ? body.customerId.trim() : "",
    serviceIds: normalizeStringArray(body.serviceIds),
    comboIds: normalizeStringArray(body.comboIds),
    barberId: normalizeNullableId(body.barberId),
    skinnerId: normalizeNullableId(body.skinnerId),
  };
}

function formatVisitResponse(visit: VisitRecord): CustomerVisit {
  const services = visit.visitServices.reduce<CustomerVisit["services"]>(
    (items, visitService) => {
      if (visitService.comboId) {
        const hasCombo = items.some(
          (item) => item.itemId === visitService.comboId,
        );

        if (hasCombo) {
          return items;
        }

        return [
          ...items,
          {
            id: visitService.id,
            itemId: visitService.comboId,
            name:
              visitService.comboNameSnapshot ??
              visitService.combo?.name ??
              customerTexts.detail.noServices,
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
          itemId: visitService.serviceId,
          name:
            visitService.serviceNameSnapshot ??
            visitService.service?.name ??
            customerTexts.detail.noServices,
          type: VISIT_ITEM_TYPE_SERVICE,
          price: Number(visitService.price.toString()),
        },
      ];
    },
    [],
  );

  return {
    id: visit.id,
    createdAt: visit.createdAt.toISOString(),
    completedAt: visit.completedAt?.toISOString() ?? null,
    lastUpdatedBy: visit.lastUpdatedBy,
    status: visit.status,
    totalPrice: Number(visit.totalPrice.toString()),
    barber: visit.barber,
    skinner: visit.skinner,
    photos: visit.visitPhotos.map((photo) => ({
      id: photo.id,
      photoUrl: photo.photoUrl,
      createdAt: photo.createdAt.toISOString(),
    })),
    services,
  };
}

function formatVisitListResponse(visit: VisitRecord) {
  return {
    ...formatVisitResponse(visit),
    customer: visit.customer,
  };
}

async function getStaffAuth(request: NextRequest): Promise<StaffAuthResult> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: visitTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !VISIT_ROLES.includes(token.role as UserRole) ||
    !token.shop_id
  ) {
    return { error: visitTexts.api.errors.forbidden, status: 403 };
  }

  if (!token.branch_id) {
    return { error: visitTexts.api.errors.missingBranch, status: 400 };
  }

  return {
    role: token.role as UserRole,
    userId: token.id,
    shopId: token.shop_id,
    branchId: token.branch_id,
  };
}

async function isCustomerValid(customerId: string, shopId: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      shopId,
    },
    select: { id: true },
  });

  return Boolean(customer);
}

async function hasOpenVisit(customerId: string, shopId: string) {
  const visit = await prisma.visit.findFirst({
    where: {
      customerId,
      shopId,
      status: {
        in: [VISIT_STATUS_PENDING, VISIT_STATUS_IN_PROGRESS],
      },
    },
    select: { id: true },
  });

  return Boolean(visit);
}

async function validateStaff(
  barberId: string | null,
  skinnerId: string | null,
  shopId: string,
) {
  const staffIds = [barberId, skinnerId].filter(
    (staffId): staffId is string => Boolean(staffId),
  );

  if (!staffIds.length) {
    return true;
  }

  const roleFilters = [
    barberId ? { id: barberId, role: "barber" as const } : null,
    skinnerId ? { id: skinnerId, role: "skinner" as const } : null,
  ].filter((filter): filter is { id: string; role: "barber" | "skinner" } =>
    Boolean(filter),
  );

  const staff = await prisma.user.findMany({
    where: {
      id: { in: staffIds },
      shopId,
      status: "active",
      OR: roleFilters,
    },
    select: { id: true },
  });

  return staff.length === staffIds.length;
}

export async function GET(request: NextRequest) {
  const authResult = await getStaffAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const statusFilter = request.nextUrl.searchParams.get("status");

  if (isVisitStatus(statusFilter)) {
    const visits = await prisma.visit.findMany({
      where: {
        shopId: authResult.shopId,
        status: statusFilter,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: VISIT_SELECT,
    });

    return NextResponse.json({
      visits: visits.map(formatVisitListResponse),
    });
  }

  const [services, combos, barbers, skinners] = await Promise.all([
    prisma.service.findMany({
      where: { shopId: authResult.shopId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
      },
    }),
    prisma.combo.findMany({
      where: { shopId: authResult.shopId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
      },
    }),
    prisma.user.findMany({
      where: {
        shopId: authResult.shopId,
        role: "barber",
        status: "active",
      },
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        role: true,
      },
    }),
    prisma.user.findMany({
      where: {
        shopId: authResult.shopId,
        role: "skinner",
        status: "active",
      },
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        role: true,
      },
    }),
  ]);

  return NextResponse.json({
    services: services.map((service) => ({
      ...service,
      price: Number(service.price.toString()),
    })),
    combos: combos.map((combo) => ({
      ...combo,
      price: Number(combo.price.toString()),
    })),
    barbers,
    skinners,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await getStaffAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isVisitRequestBody(body)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const visitInput = normalizeVisitInput(body);

  if (!visitInput.customerId) {
    return NextResponse.json(
      { error: visitTexts.api.errors.missingCustomer },
      { status: 400 },
    );
  }

  if (!visitInput.serviceIds.length && !visitInput.comboIds.length) {
    return NextResponse.json(
      { error: visitTexts.api.errors.missingItems },
      { status: 400 },
    );
  }

  if (visitInput.serviceIds.length && visitInput.comboIds.length) {
    return NextResponse.json(
      { error: visitTexts.api.errors.mixedItems },
      { status: 400 },
    );
  }

  const isValidCustomer = await isCustomerValid(
    visitInput.customerId,
    authResult.shopId,
  );

  if (!isValidCustomer) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidCustomer },
      { status: 400 },
    );
  }

  const customerHasOpenVisit = await hasOpenVisit(
    visitInput.customerId,
    authResult.shopId,
  );

  if (customerHasOpenVisit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.openVisitExists },
      { status: 400 },
    );
  }

  const barberId =
    authResult.role === "barber" && !visitInput.barberId
      ? authResult.userId
      : visitInput.barberId;
  const skinnerId =
    authResult.role === "skinner" && !visitInput.skinnerId
      ? authResult.userId
      : visitInput.skinnerId;

  const [services, combos, isValidStaff] = await Promise.all([
    prisma.service.findMany({
      where: {
        id: { in: visitInput.serviceIds },
        shopId: authResult.shopId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        responsibleRole: true,
      },
    }),
    prisma.combo.findMany({
      where: {
        id: { in: visitInput.comboIds },
        shopId: authResult.shopId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        comboServices: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                responsibleRole: true,
              },
            },
          },
        },
      },
    }),
    validateStaff(barberId, skinnerId, authResult.shopId),
  ]);

  if (services.length !== visitInput.serviceIds.length) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidServices },
      { status: 400 },
    );
  }

  if (combos.length !== visitInput.comboIds.length) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidCombos },
      { status: 400 },
    );
  }

  if (combos.some((combo) => combo.comboServices.length === 0)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidCombos },
      { status: 400 },
    );
  }

  if (!isValidStaff) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidStaff },
      { status: 400 },
    );
  }

  const visitServiceSnapshots = buildVisitServiceSnapshots({
    combos,
    services,
    shopId: authResult.shopId,
  });

  const visit = await prisma.visit.create({
    data: {
      shopId: authResult.shopId,
      customerId: visitInput.customerId,
      branchId: authResult.branchId,
      barberId,
      skinnerId,
      status: VISIT_STATUS_PENDING,
      totalPrice: visitServiceSnapshots.totalPrice,
      createdBy: authResult.userId,
      visitServices: {
        create: visitServiceSnapshots.visitServices,
      },
    },
    select: VISIT_SELECT,
  });

  return NextResponse.json(
    { visit: formatVisitResponse(visit) },
    { status: 201 },
  );
}
