import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_ALL,
  BRANCH_STATUS_INACTIVE,
  USER_ROLE_OWNER,
  VISIT_STATUS_COMPLETED,
  type BranchStatusFilterValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { BranchReportDetail } from "@/types";
import { parseReportDateRange, type ReportDateRange } from "@/utils/reports";
import { getStaffDisplayName } from "@/utils/staff";

const BRANCH_REPORT_DETAIL_RESPONSE_DATA_KEY = "report";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const BRANCH_REPORT_DETAIL_VISIT_SELECT = {
  barber: {
    select: {
      fullName: true,
      username: true,
    },
  },
  completedAt: true,
  createdBy: true,
  creator: {
    select: {
      fullName: true,
      username: true,
    },
  },
  customer: {
    select: {
      name: true,
    },
  },
  id: true,
  skinner: {
    select: {
      fullName: true,
      username: true,
    },
  },
  visitServices: {
    select: {
      allocatedPrice: true,
      comboId: true,
      serviceId: true,
    },
  },
} as const;

type BranchReportDetailVisit = Prisma.VisitGetPayload<{
  select: typeof BRANCH_REPORT_DETAIL_VISIT_SELECT;
}>;

type BranchReportDetailAuthResult =
  | {
      shopId: string;
    }
  | {
      error: string;
      status: number;
    };

async function getBranchReportDetailAuth(
  request: NextRequest,
): Promise<BranchReportDetailAuthResult> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: reportTexts.api.errors.unauthorized, status: 401 };
  }

  if (token.role !== USER_ROLE_OWNER || !token.shop_id) {
    return { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return { shopId: token.shop_id };
}

function getRequestedBranchId(request: NextRequest) {
  return request.nextUrl.searchParams.get("branchId")?.trim() || "";
}

function getRequestedStatus(request: NextRequest): BranchStatusFilterValue {
  const status = request.nextUrl.searchParams.get("status")?.trim();

  return status === BRANCH_STATUS_ACTIVE || status === BRANCH_STATUS_INACTIVE
    ? status
    : BRANCH_STATUS_ALL;
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

function getActiveDuringRangeWhere(
  range: ReportDateRange,
): Prisma.BranchWhereInput {
  return {
    createdAt: { lt: range.end },
    OR: [{ deactivatedAt: null }, { deactivatedAt: { gte: range.start } }],
  };
}

function getVisitServiceCount(visit: BranchReportDetailVisit) {
  const comboIds = new Set<string>();
  let serviceCount = 0;

  visit.visitServices.forEach((visitService) => {
    if (visitService.comboId) {
      comboIds.add(visitService.comboId);
      return;
    }

    serviceCount += 1;
  });

  return serviceCount + comboIds.size;
}

function getVisitRevenue(visit: BranchReportDetailVisit) {
  return visit.visitServices.reduce(
    (total, visitService) => total + Number(visitService.allocatedPrice),
    0,
  );
}

function createVisitDetail(visit: BranchReportDetailVisit): BranchReportDetail {
  return {
    barberName: visit.barber ? getStaffDisplayName(visit.barber) : null,
    completedAt: visit.completedAt?.toISOString() ?? null,
    customerName: visit.customer.name,
    receptionistName: getStaffDisplayName(visit.creator),
    revenue: getVisitRevenue(visit),
    serviceCount: getVisitServiceCount(visit),
    skinnerName: visit.skinner ? getStaffDisplayName(visit.skinner) : null,
    visitId: visit.id,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getBranchReportDetailAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const branchId = getRequestedBranchId(request);

    if (!branchId) {
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

    const requestedStatus = getRequestedStatus(request);
    const branchStatusWhere =
      requestedStatus === BRANCH_STATUS_ALL ? {} : { status: requestedStatus };
    const branch = await prisma.branch.findFirst({
      select: { id: true },
      where: {
        ...getActiveDuringRangeWhere(range),
        ...branchStatusWhere,
        id: branchId,
        shopId: authResult.shopId,
      },
    });

    if (!branch) {
      return NextResponse.json(
        { error: reportTexts.api.errors.forbidden },
        { status: 403 },
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
    const visitWhere = {
      branchId,
      completedAt: {
        gte: range.start,
        lt: range.end,
      },
      shopId: authResult.shopId,
      status: VISIT_STATUS_COMPLETED,
    } satisfies Prisma.VisitWhereInput;
    const total = await prisma.visit.count({ where: visitWhere });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;
    const details = (
      await prisma.visit.findMany({
        orderBy: { completedAt: "desc" },
        select: BRANCH_REPORT_DETAIL_VISIT_SELECT,
        skip,
        take: pageSize,
        where: visitWhere,
      })
    ).map(createVisitDetail);

    return NextResponse.json({
      [BRANCH_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
        branchId,
        details,
        pagination: {
          page: safePage,
          pageSize,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error(
      "[branch-report-detail-api] Failed to load branch report detail",
      error,
    );

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
