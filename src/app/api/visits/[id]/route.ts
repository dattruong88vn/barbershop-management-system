import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import { customerTexts, visitTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type {
  CustomerVisit,
  UserRole,
  VisitStaffUpdateRequestBody,
} from "@/types";

const STAFF_ROLES: UserRole[] = ["receptionist", "barber", "skinner"];
const STAFF_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;
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

type VisitPatchRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type StaffAuthResult =
  | {
      userId: string;
      shopId: string;
    }
  | {
      error: string;
      status: number;
    };

function isVisitStaffUpdateRequestBody(
  body: unknown,
): body is VisitStaffUpdateRequestBody {
  return typeof body === "object" && body !== null;
}

function normalizeNullableId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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

  return {
    userId: token.id,
    shopId: token.shop_id,
  };
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
      OR: roleFilters,
    },
    select: { id: true },
  });

  return staff.length === staffIds.length;
}

export async function PATCH(
  request: NextRequest,
  context: VisitPatchRouteContext,
) {
  const authResult = await getStaffAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isVisitStaffUpdateRequestBody(body)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const visit = await prisma.visit.findFirst({
    where: {
      id,
      shopId: authResult.shopId,
    },
    select: {
      id: true,
      completedAt: true,
      status: true,
    },
  });

  if (!visit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  if (visit.status !== "completed" || !visit.completedAt) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notCompleted },
      { status: 400 },
    );
  }

  if (Date.now() > visit.completedAt.getTime() + STAFF_EDIT_WINDOW_MS) {
    return NextResponse.json(
      { error: visitTexts.api.errors.lockedStaffEdit },
      { status: 400 },
    );
  }

  const barberId = normalizeNullableId(body.barberId);
  const skinnerId = normalizeNullableId(body.skinnerId);
  const isValidStaff = await validateStaff(
    barberId,
    skinnerId,
    authResult.shopId,
  );

  if (!isValidStaff) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidStaff },
      { status: 400 },
    );
  }

  const updatedVisit = await prisma.visit.update({
    where: { id: visit.id },
    data: {
      barberId,
      skinnerId,
      lastUpdatedBy: authResult.userId,
    },
    select: VISIT_SELECT,
  });

  return NextResponse.json({ visit: formatVisitResponse(updatedVisit) });
}
