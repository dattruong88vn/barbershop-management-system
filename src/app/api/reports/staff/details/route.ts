import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  MANAGEMENT_ROLES,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  STAFF_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
  VISIT_STATUS_COMPLETED,
  type ManagementRoleValue,
  type StaffRoleValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { StaffReportDetail } from "@/types";
import { parseReportDateRange, type ReportDateRange } from "@/utils/reports";

const STAFF_REPORT_DETAIL_RESPONSE_DATA_KEY = "report";
const UNKNOWN_STAFF_ID = "unknown";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const STAFF_REPORT_DETAIL_VISIT_SELECT = {
  branchNameSnapshot: true,
  completedAt: true,
  customer: { select: { name: true } },
  id: true,
} as const;

const STAFF_REPORT_DETAIL_SERVICE_SELECT = {
  comboNameSnapshot: true,
  responsibleRoleSnapshot: true,
  serviceNameSnapshot: true,
  visit: { select: STAFF_REPORT_DETAIL_VISIT_SELECT },
} as const;

type StaffReportDetailVisit = Prisma.VisitGetPayload<{
  select: typeof STAFF_REPORT_DETAIL_VISIT_SELECT;
}>;

type StaffReportDetailService = Prisma.VisitServiceGetPayload<{
  select: typeof STAFF_REPORT_DETAIL_SERVICE_SELECT;
}>;

type StaffReportDetailAuthResult =
  | {
      branchId: string | null;
      role: ManagementRoleValue;
      shopId: string;
      userId: string;
    }
  | {
      error: string;
      status: number;
    };

type StaffReportDetailTarget =
  | {
      role: StaffRoleValue;
      staffId: string;
    }
  | {
      role: "unknown";
      staffId: typeof UNKNOWN_STAFF_ID;
    };

type StaffReportServiceTarget =
  | {
      role:
        | typeof SERVICE_RESPONSIBLE_ROLE_BARBER
        | typeof SERVICE_RESPONSIBLE_ROLE_SKINNER;
      staffId: string;
    }
  | {
      role: "unknown";
      staffId: typeof UNKNOWN_STAFF_ID;
    };

async function getStaffReportDetailAuth(
  request: NextRequest,
): Promise<StaffReportDetailAuthResult> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: reportTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.some((role) => role === token.role) ||
    !token.shop_id
  ) {
    return { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return {
    branchId:
      typeof token.active_branch_id === "string"
        ? token.active_branch_id
        : typeof token.branch_id === "string"
          ? token.branch_id
          : null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
    userId: token.id,
  };
}

function getRequestedBranchId(request: NextRequest) {
  return request.nextUrl.searchParams.get("branchId")?.trim() || null;
}

function getRequestedStaffId(request: NextRequest) {
  return request.nextUrl.searchParams.get("staffId")?.trim() || "";
}

function getPositiveIntegerParam({
  fallback,
  max,
  request,
  searchParam,
}: {
  fallback: number;
  max?: number;
  request: NextRequest;
  searchParam: string;
}) {
  const value = Number(request.nextUrl.searchParams.get(searchParam));

  if (!Number.isInteger(value) || value < 1) {
    return fallback;
  }

  return max ? Math.min(value, max) : value;
}

async function getValidatedBranchId({
  authResult,
  requestedBranchId,
}: {
  authResult: Extract<StaffReportDetailAuthResult, { shopId: string }>;
  requestedBranchId: string | null;
}): Promise<
  | {
      branchId: string | null;
    }
  | {
      error: string;
      status: number;
    }
> {
  if (authResult.role === USER_ROLE_MANAGER) {
    if (!authResult.branchId) {
      return { error: reportTexts.api.errors.forbidden, status: 403 };
    }

    const branch = await prisma.branch.findFirst({
      where: {
        id: authResult.branchId,
        managerId: authResult.userId,
        shopId: authResult.shopId,
        status: "active",
      },
      select: { id: true },
    });

    return branch
      ? { branchId: branch.id }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  if (authResult.role === USER_ROLE_OWNER && requestedBranchId) {
    const branch = await prisma.branch.findFirst({
      where: {
        id: requestedBranchId,
        shopId: authResult.shopId,
      },
      select: { id: true },
    });

    return branch
      ? { branchId: branch.id }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return { branchId: null };
}

async function getStaffReportDetailTarget({
  branchId,
  shopId,
  staffId,
}: {
  branchId: string | null;
  shopId: string;
  staffId: string;
}): Promise<StaffReportDetailTarget | null> {
  if (staffId === UNKNOWN_STAFF_ID) {
    return {
      role: "unknown",
      staffId: UNKNOWN_STAFF_ID,
    };
  }

  const staffMember = await prisma.user.findFirst({
    select: {
      id: true,
      role: true,
    },
    where: {
      ...(branchId ? { branchId } : {}),
      id: staffId,
      role: { in: [...STAFF_ROLES] },
      shopId,
    },
  });

  return staffMember
    ? {
        role: staffMember.role as StaffRoleValue,
        staffId: staffMember.id,
      }
    : null;
}

function getVisitItemName(
  visitService: StaffReportDetailService,
) {
  return (
    visitService.serviceNameSnapshot ||
    visitService.comboNameSnapshot ||
    reportTexts.staffReport.unknownItem
  );
}

function createServiceDetail({
  visitService,
}: {
  visitService: StaffReportDetailService;
}): StaffReportDetail {
  return {
    branchName: visitService.visit.branchNameSnapshot,
    completedAt: visitService.visit.completedAt?.toISOString() ?? null,
    customerName: visitService.visit.customer.name,
    itemName: getVisitItemName(visitService),
    responsibleRole:
      visitService.responsibleRoleSnapshot ?? reportTexts.staffReport.unknownRole,
    visitId: visitService.visit.id,
  };
}

function createReceptionistDetail(
  visit: StaffReportDetailVisit,
): StaffReportDetail {
  return {
    branchName: visit.branchNameSnapshot,
    completedAt: visit.completedAt?.toISOString() ?? null,
    customerName: visit.customer.name,
    itemName: reportTexts.staffReport.receptionistVisitItem,
    responsibleRole: USER_ROLE_RECEPTIONIST,
    visitId: visit.id,
  };
}

function getBaseVisitWhere({
  branchId,
  range,
  shopId,
}: {
  branchId: string | null;
  range: ReportDateRange;
  shopId: string;
}): Prisma.VisitWhereInput {
  return {
    completedAt: {
      gte: range.start,
      lt: range.end,
    },
    ...(branchId ? { branchId } : {}),
    shopId,
    status: VISIT_STATUS_COMPLETED,
  } satisfies Prisma.VisitWhereInput;
}

function getStaffDetailServiceWhere({
  baseVisitWhere,
  shopId,
  target,
}: {
  baseVisitWhere: Prisma.VisitWhereInput;
  shopId: string;
  target: StaffReportServiceTarget;
}): Prisma.VisitServiceWhereInput {
  if (target.role === "unknown") {
    return {
      shopId,
      OR: [
        {
          responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_BARBER,
          visit: {
            ...baseVisitWhere,
            barberId: null,
          },
        },
        {
          responsibleRoleSnapshot: SERVICE_RESPONSIBLE_ROLE_SKINNER,
          visit: {
            ...baseVisitWhere,
            skinnerId: null,
          },
        },
      ],
    };
  }

  return {
    shopId,
    responsibleRoleSnapshot: target.role,
    visit: {
      ...baseVisitWhere,
      ...(target.role === SERVICE_RESPONSIBLE_ROLE_BARBER
        ? { barberId: target.staffId }
        : { skinnerId: target.staffId }),
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getStaffReportDetailAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const staffId = getRequestedStaffId(request);

    if (!staffId) {
      return NextResponse.json(
        { error: reportTexts.api.errors.forbidden },
        { status: 400 },
      );
    }

    const fromDate = request.nextUrl.searchParams.get("fromDate")?.trim() ?? "";
    const toDate = request.nextUrl.searchParams.get("toDate")?.trim() ?? "";
    const range = parseReportDateRange({ fromDate, toDate });

    if (!range) {
      return NextResponse.json(
        { error: reportTexts.api.errors.invalidDateRange },
        { status: 400 },
      );
    }
    const page = getPositiveIntegerParam({
      fallback: DEFAULT_PAGE,
      request,
      searchParam: "page",
    });
    const pageSize = getPositiveIntegerParam({
      fallback: DEFAULT_PAGE_SIZE,
      max: MAX_PAGE_SIZE,
      request,
      searchParam: "pageSize",
    });
    const branchResult = await getValidatedBranchId({
      authResult,
      requestedBranchId: getRequestedBranchId(request),
    });

    if ("error" in branchResult) {
      return NextResponse.json(
        { error: branchResult.error },
        { status: branchResult.status },
      );
    }

    const target = await getStaffReportDetailTarget({
      branchId: branchResult.branchId,
      shopId: authResult.shopId,
      staffId,
    });

    if (!target) {
      return NextResponse.json(
        { error: reportTexts.api.errors.forbidden },
        { status: 403 },
      );
    }

    const baseVisitWhere = getBaseVisitWhere({
      branchId: branchResult.branchId,
      range,
      shopId: authResult.shopId,
    });
    const total =
      target.role === USER_ROLE_RECEPTIONIST
        ? await prisma.visit.count({
            where: { ...baseVisitWhere, createdBy: target.staffId },
          })
        : await prisma.visitService.count({
            where: getStaffDetailServiceWhere({
              baseVisitWhere,
              shopId: authResult.shopId,
              target: target as StaffReportServiceTarget,
            }),
          });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;
    const details =
      target.role === USER_ROLE_RECEPTIONIST
        ? (
            await prisma.visit.findMany({
              orderBy: { completedAt: "desc" },
              select: STAFF_REPORT_DETAIL_VISIT_SELECT,
              skip,
              take: pageSize,
              where: { ...baseVisitWhere, createdBy: target.staffId },
            })
          ).map(createReceptionistDetail)
        : (
            await prisma.visitService.findMany({
              orderBy: { visit: { completedAt: "desc" } },
              select: STAFF_REPORT_DETAIL_SERVICE_SELECT,
              skip,
              take: pageSize,
              where: getStaffDetailServiceWhere({
                baseVisitWhere,
                shopId: authResult.shopId,
                target: target as StaffReportServiceTarget,
              }),
            })
          ).map((visitService) => createServiceDetail({ visitService }));

    return NextResponse.json({
      [STAFF_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
        details,
        pagination: {
          page: safePage,
          pageSize,
          total,
          totalPages,
        },
        staffId,
      },
    });
  } catch (error) {
    console.error("[staff-report-detail-api] Failed to load staff report detail", error);

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
