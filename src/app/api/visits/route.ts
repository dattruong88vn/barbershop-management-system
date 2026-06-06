import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import { customerTexts, visitTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type {
  CustomerVisit,
  UserRole,
  VisitCreateInput,
  VisitRequestBody,
} from "@/types";

const STAFF_ROLES: UserRole[] = ["receptionist", "barber", "skinner"];
const VISIT_SELECT = {
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
    services: visit.visitServices.map((visitService) => ({
      id: visitService.id,
      itemId: visitService.serviceId ?? visitService.comboId,
      name:
        visitService.service?.name ??
        visitService.combo?.name ??
        customerTexts.detail.noServices,
      type: visitService.service ? "service" : "combo",
      price: Number(visitService.price.toString()),
    })),
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
    !STAFF_ROLES.includes(token.role as UserRole) ||
    !token.shop_id
  ) {
    return { error: visitTexts.api.errors.forbidden, status: 403 };
  }

  if (!token.branch_id) {
    return { error: visitTexts.api.errors.missingBranch, status: 400 };
  }

  return {
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

  const [services, combos, isValidStaff] = await Promise.all([
    prisma.service.findMany({
      where: {
        id: { in: visitInput.serviceIds },
        shopId: authResult.shopId,
      },
      select: {
        id: true,
        price: true,
      },
    }),
    prisma.combo.findMany({
      where: {
        id: { in: visitInput.comboIds },
        shopId: authResult.shopId,
      },
      select: {
        id: true,
        price: true,
      },
    }),
    validateStaff(visitInput.barberId, visitInput.skinnerId, authResult.shopId),
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

  if (!isValidStaff) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidStaff },
      { status: 400 },
    );
  }

  const totalPrice = [...services, ...combos].reduce(
    (total, item) => total + Number(item.price.toString()),
    0,
  );

  const visit = await prisma.visit.create({
    data: {
      shopId: authResult.shopId,
      customerId: visitInput.customerId,
      branchId: authResult.branchId,
      barberId: visitInput.barberId,
      skinnerId: visitInput.skinnerId,
      status: "pending",
      totalPrice,
      createdBy: authResult.userId,
      visitServices: {
        create: [
          ...services.map((service) => ({
            shopId: authResult.shopId,
            serviceId: service.id,
            price: Number(service.price.toString()),
          })),
          ...combos.map((combo) => ({
            shopId: authResult.shopId,
            comboId: combo.id,
            price: Number(combo.price.toString()),
          })),
        ],
      },
    },
    select: VISIT_SELECT,
  });

  return NextResponse.json(
    { visit: formatVisitResponse(visit) },
    { status: 201 },
  );
}
