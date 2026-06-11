import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import { customerTexts, visitTexts } from "@/constants/texts";
import {
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
  isVisitStatus,
} from "@/constants/visitStatuses";
import { prisma } from "@/lib/prisma";
import type {
  CustomerVisit,
  UserRole,
  VisitDetailUpdateInput,
  VisitDetailUpdateRequestBody,
  VisitStaffUpdateRequestBody,
  VisitStatusUpdateRequestBody,
} from "@/types";

const VISIT_DETAIL_ROLES: UserRole[] = [
  "owner",
  "manager",
  "receptionist",
  "barber",
  "skinner",
];
const STAFF_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;
const VISIT_SELECT = {
  id: true,
  createdAt: true,
  completedAt: true,
  lastUpdatedBy: true,
  lastUpdater: {
    select: {
      username: true,
    },
  },
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

type VisitRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type StaffAuthResult =
  | {
      role: UserRole;
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

function isVisitStatusUpdateRequestBody(
  body: unknown,
): body is VisitStatusUpdateRequestBody {
  return typeof body === "object" && body !== null && "status" in body;
}

function isVisitDetailUpdateRequestBody(
  body: unknown,
): body is VisitDetailUpdateRequestBody {
  return (
    typeof body === "object" &&
    body !== null &&
    ("serviceIds" in body || "comboIds" in body)
  );
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

function normalizeBoolean(value: unknown) {
  return value === true;
}

function normalizeVisitDetailUpdateInput(
  body: VisitDetailUpdateRequestBody,
  visitId: string,
): VisitDetailUpdateInput {
  return {
    barberId: normalizeNullableId(body.barberId),
    comboIds: normalizeStringArray(body.comboIds),
    customerId: null,
    noHaircut: normalizeBoolean(body.noHaircut),
    noSkinnerService: normalizeBoolean(body.noSkinnerService),
    serviceIds: normalizeStringArray(body.serviceIds),
    skinnerId: normalizeNullableId(body.skinnerId),
    visitId,
  };
}

function canStartVisit(role: UserRole) {
  return role === "barber" || role === "skinner";
}

function canCompleteVisit(role: UserRole) {
  return role === "receptionist";
}

function canStartVisitStatus(role: UserRole, status: string) {
  return canStartVisit(role) && status === VISIT_STATUS_PENDING;
}

function canCompleteVisitStatus(role: UserRole, status: string) {
  return canCompleteVisit(role) && status === VISIT_STATUS_IN_PROGRESS;
}

function formatVisitResponse(
  visit: VisitRecord,
  options?: {
    canCompleteVisit?: boolean;
    canStartVisit?: boolean;
    canUploadPhotos?: boolean;
  },
): CustomerVisit {
  return {
    canCompleteVisit: options?.canCompleteVisit ?? false,
    canStartVisit: options?.canStartVisit ?? false,
    canUploadPhotos: options?.canUploadPhotos ?? false,
    id: visit.id,
    createdAt: visit.createdAt.toISOString(),
    completedAt: visit.completedAt?.toISOString() ?? null,
    lastUpdatedBy: visit.lastUpdatedBy,
    lastUpdatedByName: visit.lastUpdater?.username ?? null,
    noHaircut: false,
    noSkinnerService: false,
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
    !VISIT_DETAIL_ROLES.includes(token.role as UserRole) ||
    !token.shop_id
  ) {
    return { error: visitTexts.api.errors.forbidden, status: 403 };
  }

  return {
    role: token.role as UserRole,
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
      status: "active",
      OR: roleFilters,
    },
    select: { id: true },
  });

  return staff.length === staffIds.length;
}

export async function GET(request: NextRequest, context: VisitRouteContext) {
  const authResult = await getStaffAuth(request);

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const visit = await prisma.visit.findFirst({
    where: {
      id,
      shopId: authResult.shopId,
    },
    select: VISIT_SELECT,
  });

  if (!visit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  return NextResponse.json({
    visit: formatVisitResponse(visit, {
      canCompleteVisit: canCompleteVisitStatus(authResult.role, visit.status),
      canStartVisit: canStartVisitStatus(authResult.role, visit.status),
      canUploadPhotos:
        authResult.role === "barber" && visit.status !== VISIT_STATUS_COMPLETED,
    }),
  });
}

export async function PATCH(
  request: NextRequest,
  context: VisitRouteContext,
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
      barberId: true,
      completedAt: true,
      skinnerId: true,
      status: true,
    },
  });

  if (!visit) {
    return NextResponse.json(
      { error: visitTexts.api.errors.notFound },
      { status: 404 },
    );
  }

  if (isVisitStatusUpdateRequestBody(body)) {
    if (!isVisitStatus(body.status)) {
      return NextResponse.json(
        { error: visitTexts.api.errors.invalidStatusTransition },
        { status: 400 },
      );
    }

    const nextStatus = body.status;
    const isStartingVisit =
      visit.status === VISIT_STATUS_PENDING &&
      nextStatus === VISIT_STATUS_IN_PROGRESS &&
      canStartVisit(authResult.role);
    const isCompletingVisit =
      visit.status === VISIT_STATUS_IN_PROGRESS &&
      nextStatus === VISIT_STATUS_COMPLETED &&
      canCompleteVisit(authResult.role);

    if (!isStartingVisit && !isCompletingVisit) {
      return NextResponse.json(
        { error: visitTexts.api.errors.invalidStatusTransition },
        { status: 400 },
      );
    }

    if (
      isCompletingVisit &&
      (!visit.barberId || !visit.skinnerId)
    ) {
      return NextResponse.json(
        { error: visitTexts.api.errors.missingCompletionStaff },
        { status: 400 },
      );
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        completedAt: isCompletingVisit ? new Date() : null,
        lastUpdatedBy: authResult.userId,
        status: nextStatus,
      },
      select: VISIT_SELECT,
    });

    return NextResponse.json({
      visit: formatVisitResponse(updatedVisit, {
        canCompleteVisit: canCompleteVisitStatus(
          authResult.role,
          updatedVisit.status,
        ),
        canStartVisit: canStartVisitStatus(authResult.role, updatedVisit.status),
        canUploadPhotos:
          authResult.role === "barber" &&
          updatedVisit.status !== VISIT_STATUS_COMPLETED,
      }),
    });
  }

  if (isVisitDetailUpdateRequestBody(body)) {
    if (visit.status === VISIT_STATUS_COMPLETED) {
      return NextResponse.json(
        { error: visitTexts.api.errors.lockedDetailEdit },
        { status: 400 },
      );
    }

    const visitInput = normalizeVisitDetailUpdateInput(body, visit.id);

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

    const barberId = visitInput.noHaircut ? null : visitInput.barberId;
    const skinnerId = visitInput.noSkinnerService ? null : visitInput.skinnerId;

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
      validateStaff(
        barberId,
        skinnerId,
        authResult.shopId,
      ),
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
    const updatedVisit = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        barberId,
        lastUpdatedBy: authResult.userId,
        skinnerId,
        totalPrice,
        visitServices: {
          deleteMany: {},
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

    return NextResponse.json({
      visit: formatVisitResponse(updatedVisit, {
        canCompleteVisit: canCompleteVisitStatus(
          authResult.role,
          updatedVisit.status,
        ),
        canStartVisit: canStartVisitStatus(authResult.role, updatedVisit.status),
        canUploadPhotos:
          authResult.role === "barber" &&
          updatedVisit.status !== VISIT_STATUS_COMPLETED,
      }),
    });
  }

  if (visit.status !== VISIT_STATUS_COMPLETED || !visit.completedAt) {
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
  const noHaircut = normalizeBoolean(body.noHaircut);
  const skinnerId = normalizeNullableId(body.skinnerId);
  const noSkinnerService = normalizeBoolean(body.noSkinnerService);
  const effectiveBarberId = noHaircut ? null : barberId;
  const effectiveSkinnerId = noSkinnerService ? null : skinnerId;
  const isValidStaff = await validateStaff(
    effectiveBarberId,
    effectiveSkinnerId,
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
      barberId: effectiveBarberId,
      lastUpdatedBy: authResult.userId,
      skinnerId: effectiveSkinnerId,
    },
    select: VISIT_SELECT,
  });

  return NextResponse.json({
    visit: formatVisitResponse(updatedVisit, {
      canCompleteVisit: canCompleteVisitStatus(authResult.role, updatedVisit.status),
      canStartVisit: canStartVisitStatus(authResult.role, updatedVisit.status),
      canUploadPhotos:
        authResult.role === "barber" &&
        updatedVisit.status !== VISIT_STATUS_COMPLETED,
    }),
  });
}
