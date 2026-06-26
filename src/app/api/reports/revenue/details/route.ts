import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  BRANCH_STATUS_ACTIVE,
  MANAGEMENT_ROLES,
  REVENUE_REPORT_ITEM_TYPE_COMBO,
  REVENUE_REPORT_ITEM_TYPE_SERVICE,
  REVENUE_REPORT_ITEM_TYPES,
  REVENUE_REPORT_TAB_BRANCH,
  REVENUE_REPORT_TAB_ITEM,
  USER_ROLE_MANAGER,
  VISIT_STATUS_COMPLETED,
  type ManagementRoleValue,
  type RevenueReportItemTypeValue,
  type RevenueReportTabValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { RevenueReportDetail } from "@/types";
import { parseReportDateRange } from "@/utils/reports";
import { getStaffDisplayName } from "@/utils/staff";

const REVENUE_REPORT_DETAIL_RESPONSE_DATA_KEY = "report";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const REVENUE_REPORT_DETAIL_VISIT_SELECT = {
  barber: {
    select: {
      fullName: true,
      username: true,
    },
  },
  branchNameSnapshot: true,
  completedAt: true,
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
      comboNameSnapshot: true,
      serviceId: true,
    },
  },
} as const;

const REVENUE_REPORT_SERVICE_DETAIL_SELECT = {
  allocatedPrice: true,
  serviceNameSnapshot: true,
  visit: {
    select: REVENUE_REPORT_DETAIL_VISIT_SELECT,
  },
} as const;

type RevenueReportDetailVisit = Prisma.VisitGetPayload<{
  select: typeof REVENUE_REPORT_DETAIL_VISIT_SELECT;
}>;

type RevenueReportServiceDetail = Prisma.VisitServiceGetPayload<{
  select: typeof REVENUE_REPORT_SERVICE_DETAIL_SELECT;
}>;

type RevenueReportDetailAuthResult =
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

async function getRevenueReportDetailAuth(
  request: NextRequest,
): Promise<RevenueReportDetailAuthResult> {
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

  const branchId =
    typeof token.active_branch_id === "string"
      ? token.active_branch_id
      : typeof token.branch_id === "string"
        ? token.branch_id
        : null;

  if (token.role === USER_ROLE_MANAGER) {
    if (!branchId) {
      return { error: reportTexts.api.errors.forbidden, status: 403 };
    }

    const branch = await prisma.branch.findFirst({
      select: { id: true },
      where: {
        id: branchId,
        managerId: token.id,
        shopId: token.shop_id,
        status: BRANCH_STATUS_ACTIVE,
      },
    });

    return branch
      ? {
          branchId: branch.id,
          role: token.role as ManagementRoleValue,
          shopId: token.shop_id,
          userId: token.id,
        }
      : { error: reportTexts.api.errors.forbidden, status: 403 };
  }

  return {
    branchId: null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
    userId: token.id,
  };
}

function getRequestedTab(request: NextRequest): RevenueReportTabValue {
  const tab = request.nextUrl.searchParams.get("tab")?.trim();

  return tab === REVENUE_REPORT_TAB_ITEM ? tab : REVENUE_REPORT_TAB_BRANCH;
}

function getRequestedItemType(
  request: NextRequest,
): RevenueReportItemTypeValue | null {
  const itemType = request.nextUrl.searchParams.get("itemType")?.trim();

  return REVENUE_REPORT_ITEM_TYPES.some((type) => type === itemType)
    ? (itemType as RevenueReportItemTypeValue)
    : null;
}

function getRequestedDrilldownId(request: NextRequest) {
  return request.nextUrl.searchParams.get("drilldownId")?.trim() || "";
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

  if (!Number.isInteger(value) || value < 1) return fallback;

  return max ? Math.min(value, max) : value;
}

function getVisitServiceCount(visit: RevenueReportDetailVisit) {
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

function getVisitRevenue(visit: RevenueReportDetailVisit) {
  return visit.visitServices.reduce(
    (total, visitService) => total + Number(visitService.allocatedPrice),
    0,
  );
}

function createVisitDetail(visit: RevenueReportDetailVisit): RevenueReportDetail {
  return {
    barberName: visit.barber ? getStaffDisplayName(visit.barber) : null,
    branchName: visit.branchNameSnapshot,
    completedAt: visit.completedAt?.toISOString() ?? null,
    customerName: visit.customer.name,
    receptionistName: getStaffDisplayName(visit.creator),
    revenue: getVisitRevenue(visit),
    serviceCount: getVisitServiceCount(visit),
    skinnerName: visit.skinner ? getStaffDisplayName(visit.skinner) : null,
    visitId: visit.id,
  };
}

function createServiceDetail(
  visitService: RevenueReportServiceDetail,
): RevenueReportDetail {
  return {
    ...createVisitDetail(visitService.visit),
    itemName:
      visitService.serviceNameSnapshot ?? reportTexts.revenueReport.unknownItem,
    itemType: REVENUE_REPORT_ITEM_TYPE_SERVICE,
    revenue: Number(visitService.allocatedPrice),
    serviceCount: 1,
  };
}

function createComboDetail({
  comboId,
  comboName,
  visit,
}: {
  comboId: string;
  comboName: string;
  visit: RevenueReportDetailVisit;
}): RevenueReportDetail {
  const comboRevenue = visit.visitServices.reduce((total, visitService) => {
    return visitService.comboId === comboId
      ? total + Number(visitService.allocatedPrice)
      : total;
  }, 0);

  return {
    ...createVisitDetail(visit),
    itemName: comboName,
    itemType: REVENUE_REPORT_ITEM_TYPE_COMBO,
    revenue: comboRevenue,
    serviceCount: 1,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getRevenueReportDetailAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const drilldownId = getRequestedDrilldownId(request);

    if (!drilldownId) {
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

    const tab = getRequestedTab(request);
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
    const baseVisitWhere = {
      completedAt: {
        gte: range.start,
        lt: range.end,
      },
      ...(authResult.branchId ? { branchId: authResult.branchId } : {}),
      shopId: authResult.shopId,
      status: VISIT_STATUS_COMPLETED,
    } satisfies Prisma.VisitWhereInput;

    if (tab === REVENUE_REPORT_TAB_BRANCH) {
      const branchId =
        authResult.role === USER_ROLE_MANAGER && authResult.branchId
          ? authResult.branchId
          : drilldownId;
      const branch = await prisma.branch.findFirst({
        select: { id: true },
        where: {
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

      const visitWhere = {
        ...baseVisitWhere,
        branchId,
      } satisfies Prisma.VisitWhereInput;
      const total = await prisma.visit.count({ where: visitWhere });
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);
      const details = (
        await prisma.visit.findMany({
          orderBy: { completedAt: "desc" },
          select: REVENUE_REPORT_DETAIL_VISIT_SELECT,
          skip: (safePage - 1) * pageSize,
          take: pageSize,
          where: visitWhere,
        })
      ).map(createVisitDetail);

      return NextResponse.json({
        [REVENUE_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
          details,
          drilldownId: branchId,
          itemType: null,
          pagination: { page: safePage, pageSize, total, totalPages },
          tab,
        },
      });
    }

    const itemType = getRequestedItemType(request);

    if (!itemType) {
      return NextResponse.json(
        { error: reportTexts.api.errors.forbidden },
        { status: 400 },
      );
    }

    if (itemType === REVENUE_REPORT_ITEM_TYPE_SERVICE) {
      const where = {
        comboId: null,
        serviceId: drilldownId,
        shopId: authResult.shopId,
        visit: baseVisitWhere,
      } satisfies Prisma.VisitServiceWhereInput;
      const total = await prisma.visitService.count({ where });
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);
      const details = (
        await prisma.visitService.findMany({
          orderBy: { visit: { completedAt: "desc" } },
          select: REVENUE_REPORT_SERVICE_DETAIL_SELECT,
          skip: (safePage - 1) * pageSize,
          take: pageSize,
          where,
        })
      ).map(createServiceDetail);

      return NextResponse.json({
        [REVENUE_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
          details,
          drilldownId,
          itemType,
          pagination: { page: safePage, pageSize, total, totalPages },
          tab,
        },
      });
    }

    const combo = await prisma.combo.findFirst({
      select: { name: true },
      where: {
        id: drilldownId,
        shopId: authResult.shopId,
      },
    });
    const visitWhere = {
      ...baseVisitWhere,
      visitServices: {
        some: {
          comboId: drilldownId,
          shopId: authResult.shopId,
        },
      },
    } satisfies Prisma.VisitWhereInput;
    const total = await prisma.visit.count({ where: visitWhere });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const visits = await prisma.visit.findMany({
      orderBy: { completedAt: "desc" },
      select: REVENUE_REPORT_DETAIL_VISIT_SELECT,
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      where: visitWhere,
    });
    const details = visits.map((visit) =>
      createComboDetail({
        comboId: drilldownId,
        comboName:
          combo?.name ??
          visit.visitServices.find(
            (visitService) => visitService.comboId === drilldownId,
          )?.comboNameSnapshot ??
          reportTexts.revenueReport.unknownItem,
        visit,
      }),
    );

    return NextResponse.json({
      [REVENUE_REPORT_DETAIL_RESPONSE_DATA_KEY]: {
        details,
        drilldownId,
        itemType,
        pagination: { page: safePage, pageSize, total, totalPages },
        tab,
      },
    });
  } catch (error) {
    console.error(
      "[revenue-report-detail-api] Failed to load revenue report detail",
      error,
    );

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
