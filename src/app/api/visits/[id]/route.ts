import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import { customerTexts, visitTexts } from "@/constants/texts";
import {
  MANAGEMENT_ROLES,
  STAFF_EDIT_WINDOW_MS,
  STAFF_ROLES,
  USER_ROLE_BARBER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_SKINNER,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/common";
import { prisma } from "@/lib/prisma";
import { buildVisitServiceSnapshots } from "@/utils/visits";
import { isVisitStatus } from "@/utils/visits/visitStatus";
import type {
  CustomerVisit,
  UserRole,
  VisitDetailUpdateInput,
  VisitDetailUpdateRequestBody,
  VisitStaffUpdateRequestBody,
  VisitStatusUpdateRequestBody,
} from "@/types";

const VISIT_DETAIL_ROLES: UserRole[] = [...MANAGEMENT_ROLES, ...STAFF_ROLES];
const VISIT_SELECT = {
  id: true,
  branchId: true,
  createdAt: true,
  completedAt: true,
  lastUpdatedBy: true,
  lastUpdater: {
    select: {
      username: true,
    },
  },
  customer: {
    select: {
      createdAt: true,
      id: true,
      name: true,
      phone: true,
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

function isVisitPatchRequestBody(body: unknown): body is Record<string, unknown> {
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
  return role === USER_ROLE_BARBER || role === USER_ROLE_SKINNER;
}

function canCompleteVisit(role: UserRole) {
  return role === USER_ROLE_RECEPTIONIST;
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
    canCreateNewVisit?: boolean;
    canStartVisit?: boolean;
    canUploadPhotos?: boolean;
  },
): CustomerVisit {
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
    canCompleteVisit: options?.canCompleteVisit ?? false,
    canCreateNewVisit: options?.canCreateNewVisit ?? false,
    canStartVisit: options?.canStartVisit ?? false,
    canUploadPhotos: options?.canUploadPhotos ?? false,
    customer: {
      createdAt: visit.customer.createdAt.toISOString(),
      id: visit.customer.id,
      name: visit.customer.name,
      phone: visit.customer.phone,
    },
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
    services,
  };
}

async function canCreateNewVisitForCustomer(customerId: string, shopId: string) {
  const incompleteVisitCount = await prisma.visit.count({
    where: {
      customerId,
      shopId,
      status: {
        not: VISIT_STATUS_COMPLETED,
      },
    },
  });

  return incompleteVisitCount === 0;
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
    barberId ? { id: barberId, role: USER_ROLE_BARBER } : null,
    skinnerId ? { id: skinnerId, role: USER_ROLE_SKINNER } : null,
  ].filter(
    (
      filter,
    ): filter is {
      id: string;
      role: typeof USER_ROLE_BARBER | typeof USER_ROLE_SKINNER;
    } => Boolean(filter),
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
      canCreateNewVisit: await canCreateNewVisitForCustomer(
        visit.customer.id,
        authResult.shopId,
      ),
      canStartVisit: canStartVisitStatus(authResult.role, visit.status),
      canUploadPhotos:
        authResult.role === USER_ROLE_BARBER &&
        visit.status !== VISIT_STATUS_COMPLETED,
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

  if (!isVisitPatchRequestBody(body)) {
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
      branchId: true,
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

    const noHaircut = normalizeBoolean(body.noHaircut);
    const noSkinnerService = normalizeBoolean(body.noSkinnerService);

    if (
      isCompletingVisit &&
      ((!visit.barberId && !noHaircut) ||
        (!visit.skinnerId && !noSkinnerService))
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
        canCreateNewVisit: await canCreateNewVisitForCustomer(
          updatedVisit.customer.id,
          authResult.shopId,
        ),
        canStartVisit: canStartVisitStatus(authResult.role, updatedVisit.status),
        canUploadPhotos:
          authResult.role === USER_ROLE_BARBER &&
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
          deletedAt: null,
          id: { in: visitInput.serviceIds },
          shopId: authResult.shopId,
          OR: [{ branchId: null }, { branchId: visit.branchId }],
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
    const updatedVisit = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        barberId,
        lastUpdatedBy: authResult.userId,
        skinnerId,
        totalPrice: visitServiceSnapshots.totalPrice,
        visitServices: {
          deleteMany: {},
          create: visitServiceSnapshots.visitServices,
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
        canCreateNewVisit: await canCreateNewVisitForCustomer(
          updatedVisit.customer.id,
          authResult.shopId,
        ),
        canStartVisit: canStartVisitStatus(authResult.role, updatedVisit.status),
        canUploadPhotos:
          authResult.role === USER_ROLE_BARBER &&
          updatedVisit.status !== VISIT_STATUS_COMPLETED,
      }),
    });
  }

  if (!isVisitStaffUpdateRequestBody(body)) {
    return NextResponse.json(
      { error: visitTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
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
      canCreateNewVisit: await canCreateNewVisitForCustomer(
        updatedVisit.customer.id,
        authResult.shopId,
      ),
      canStartVisit: canStartVisitStatus(authResult.role, updatedVisit.status),
      canUploadPhotos:
        authResult.role === USER_ROLE_BARBER &&
        updatedVisit.status !== VISIT_STATUS_COMPLETED,
    }),
  });
}
