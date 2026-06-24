import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  MANAGEMENT_ROLES,
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  REPORT_PERIODS,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  VISIT_STATUS_COMPLETED,
  type ManagementRoleValue,
  type ReportPeriodValue,
} from "@/constants/common";
import { dashboardTexts, reportTexts } from "@/constants/texts";
import { prisma } from "@/lib/prisma";
import type { DashboardTopItem, DashboardTrendPoint } from "@/types";
import {
  getMinimumReportMonthKey,
  getReportMonthDate,
  getReportMonthKey,
} from "@/utils/reports";
import { getStaffDisplayName } from "@/utils/staff";

const DASHBOARD_RESPONSE_DATA_KEY = "dashboard";
const DASHBOARD_TOP_ITEM_LIMIT = 5;
const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});
const REPORT_MONTH_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});
const REPORT_YEAR_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
});
const TREND_DAY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});
const TREND_MONTH_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  month: "2-digit",
  year: "numeric",
});

const DASHBOARD_VISIT_SELECT = {
  completedAt: true,
  customer: {
    select: {
      id: true,
      name: true,
    },
  },
  id: true,
  visitPhotos: {
    select: {
      id: true,
    },
    take: 1,
  },
  visitServices: {
    select: {
      allocatedPrice: true,
      comboId: true,
      comboNameSnapshot: true,
      responsibleRoleSnapshot: true,
      serviceId: true,
      serviceNameSnapshot: true,
    },
  },
  barber: {
    select: {
      fullName: true,
      username: true,
    },
  },
  skinner: {
    select: {
      fullName: true,
      username: true,
    },
  },
} as const;

type DashboardVisitRecord = Prisma.VisitGetPayload<{
  select: typeof DASHBOARD_VISIT_SELECT;
}>;

type DashboardAuthResult =
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

type ReportRange = {
  end: Date;
  start: Date;
};

type TopItemAccumulator = {
  count: number;
  revenue: number;
};

async function getDashboardAuth(
  request: NextRequest,
): Promise<DashboardAuthResult> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return { error: dashboardTexts.api.errors.unauthorized, status: 401 };
  }

  if (
    typeof token.role !== "string" ||
    !MANAGEMENT_ROLES.some((role) => role === token.role) ||
    !token.shop_id
  ) {
    return { error: dashboardTexts.api.errors.forbidden, status: 403 };
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

function getMonthRange(monthDate = new Date()): ReportRange {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

  return { end, start };
}

function getCurrentYearRange(): ReportRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);

  return { end, start };
}

function getReportPeriod(request: NextRequest): ReportPeriodValue {
  const period = request.nextUrl.searchParams.get("period");

  return REPORT_PERIODS.some((reportPeriod) => reportPeriod === period)
    ? (period as ReportPeriodValue)
    : REPORT_PERIOD_MONTH;
}

function getReportMonth(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const minimumMonth = getMinimumReportMonthKey();
  const maximumMonth = getReportMonthKey();

  if (!month || month < minimumMonth || month > maximumMonth) {
    return new Date();
  }

  return getReportMonthDate(month) ?? new Date();
}

function getReportRange(
  period: ReportPeriodValue,
  monthDate: Date,
): ReportRange | null {
  if (period === REPORT_PERIOD_YEAR) {
    return getCurrentYearRange();
  }

  if (period === REPORT_PERIOD_ALL) {
    return null;
  }

  return getMonthRange(monthDate);
}

function getReportPeriodLabel(period: ReportPeriodValue, monthDate: Date) {
  if (period === REPORT_PERIOD_YEAR) {
    return REPORT_YEAR_FORMATTER.format(new Date());
  }

  if (period === REPORT_PERIOD_ALL) {
    return reportTexts.personal.periodOptions.all;
  }

  return REPORT_MONTH_FORMATTER.format(monthDate);
}

function getDashboardServerError(error: unknown) {
  console.error("[dashboard-api] Failed to load dashboard", error);

  return NextResponse.json(
    { error: dashboardTexts.api.errors.serverError },
    { status: 500 },
  );
}

function getDashboardBranchId(request: NextRequest) {
  return request.nextUrl.searchParams.get("branchId")?.trim() || null;
}

async function getValidatedBranchId({
  authResult,
  requestedBranchId,
}: {
  authResult: Extract<DashboardAuthResult, { shopId: string }>;
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
      return { error: dashboardTexts.api.errors.forbidden, status: 403 };
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
      : { error: dashboardTexts.api.errors.forbidden, status: 403 };
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
      : { error: dashboardTexts.api.errors.forbidden, status: 403 };
  }

  return { branchId: null };
}

function getTrendKey(date: Date, period: ReportPeriodValue) {
  if (period === REPORT_PERIOD_MONTH) {
    return [
      getReportMonthKey(date),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return getReportMonthKey(date);
}

function getTrendLabel(date: Date, period: ReportPeriodValue) {
  if (period === REPORT_PERIOD_MONTH) {
    return TREND_DAY_FORMATTER.format(date);
  }

  return TREND_MONTH_FORMATTER.format(date);
}

function addTopItem(
  itemMap: Map<string, TopItemAccumulator>,
  name: string,
  revenue: number,
  count = 1,
) {
  const currentItem = itemMap.get(name) ?? { count: 0, revenue: 0 };

  itemMap.set(name, {
    count: currentItem.count + count,
    revenue: currentItem.revenue + revenue,
  });
}

function formatTopItems(itemMap: Map<string, TopItemAccumulator>) {
  return Array.from(itemMap.entries())
    .sort((firstItem, secondItem) => {
      const revenueDelta = secondItem[1].revenue - firstItem[1].revenue;

      return revenueDelta === 0
        ? secondItem[1].count - firstItem[1].count
        : revenueDelta;
    })
    .slice(0, DASHBOARD_TOP_ITEM_LIMIT)
    .map<DashboardTopItem>(([name, item]) => ({
      count: item.count,
      name,
      revenue: item.revenue,
    }));
}

function buildRevenueTrend(
  trendMap: Map<string, DashboardTrendPoint>,
): DashboardTrendPoint[] {
  return Array.from(trendMap.entries())
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([, trendPoint]) => trendPoint);
}

function getVisitRevenue(visit: DashboardVisitRecord) {
  return visit.visitServices.reduce(
    (totalRevenue, visitService) =>
      totalRevenue + Number(visitService.allocatedPrice.toString()),
    0,
  );
}

async function getCustomerMetrics({
  branchId,
  customerIds,
  range,
  shopId,
}: {
  branchId: string | null;
  customerIds: string[];
  range: ReportRange | null;
  shopId: string;
}) {
  if (!customerIds.length) {
    return {
      newCustomers: 0,
      returningCustomers: 0,
    };
  }

  const baseWhere = {
    ...(branchId ? { branchId } : {}),
    completedAt: {
      not: null,
    },
    customerId: {
      in: customerIds,
    },
    shopId,
    status: VISIT_STATUS_COMPLETED,
  } satisfies Prisma.VisitWhereInput;

  const customerVisitCounts = await prisma.visit.groupBy({
    _count: {
      _all: true,
    },
    by: ["customerId"],
    where: range
      ? {
          ...baseWhere,
          completedAt: {
            lt: range.start,
          },
        }
      : baseWhere,
  });

  if (!range) {
    return {
      newCustomers: customerVisitCounts.length,
      returningCustomers: customerVisitCounts.filter(
        (customerVisitCount) => customerVisitCount._count._all > 1,
      ).length,
    };
  }

  const firstCompletedVisits = await prisma.visit.groupBy({
    _min: {
      completedAt: true,
    },
    by: ["customerId"],
    where: baseWhere,
  });

  return {
    newCustomers: firstCompletedVisits.filter((customerVisit) => {
      const firstCompletedAt = customerVisit._min.completedAt;

      return (
        firstCompletedAt !== null &&
        firstCompletedAt >= range.start &&
        firstCompletedAt < range.end
      );
    }).length,
    returningCustomers: customerVisitCounts.length,
  };
}

function applyVisitToTrend(
  trendMap: Map<string, DashboardTrendPoint>,
  visit: DashboardVisitRecord,
  period: ReportPeriodValue,
  revenue: number,
) {
  const completedAt = visit.completedAt ?? new Date();
  const trendKey = getTrendKey(completedAt, period);
  const currentTrendPoint = trendMap.get(trendKey) ?? {
    label: getTrendLabel(completedAt, period),
    revenue: 0,
    visits: 0,
  };

  trendMap.set(trendKey, {
    ...currentTrendPoint,
    revenue: currentTrendPoint.revenue + revenue,
    visits: currentTrendPoint.visits + 1,
  });
}

function applyVisitServicesToTopItems({
  topBarbers,
  topCombos,
  topServices,
  topSkinners,
  visit,
}: {
  topBarbers: Map<string, TopItemAccumulator>;
  topCombos: Map<string, TopItemAccumulator>;
  topServices: Map<string, TopItemAccumulator>;
  topSkinners: Map<string, TopItemAccumulator>;
  visit: DashboardVisitRecord;
}) {
  const comboCounts = new Set<string>();

  visit.visitServices.forEach((visitService) => {
    const allocatedRevenue = Number(visitService.allocatedPrice.toString());

    if (visitService.serviceNameSnapshot) {
      addTopItem(topServices, visitService.serviceNameSnapshot, allocatedRevenue);
    }

    if (visitService.comboId && visitService.comboNameSnapshot) {
      const comboCountKey = `${visit.id}:${visitService.comboId}`;
      const comboCount = comboCounts.has(comboCountKey) ? 0 : 1;

      comboCounts.add(comboCountKey);
      addTopItem(
        topCombos,
        visitService.comboNameSnapshot,
        allocatedRevenue,
        comboCount,
      );
    }

    if (visitService.responsibleRoleSnapshot === SERVICE_RESPONSIBLE_ROLE_BARBER) {
      addTopItem(
        topBarbers,
        visit.barber
          ? getStaffDisplayName(visit.barber)
          : dashboardTexts.unknownStaff,
        allocatedRevenue,
      );
    }

    if (visitService.responsibleRoleSnapshot === SERVICE_RESPONSIBLE_ROLE_SKINNER) {
      addTopItem(
        topSkinners,
        visit.skinner
          ? getStaffDisplayName(visit.skinner)
          : dashboardTexts.unknownStaff,
        allocatedRevenue,
      );
    }
  });
}

function getHaircutWarnings(
  visits: DashboardVisitRecord[],
  haircutServiceIds: Set<string>,
) {
  return visits
    .filter((visit) => {
      const hasHaircutService = visit.visitServices.some(
        (visitService) =>
          visitService.serviceId && haircutServiceIds.has(visitService.serviceId),
      );

      return hasHaircutService && visit.visitPhotos.length === 0;
    })
    .map((visit) => ({
      customerName: visit.customer.name,
      visitId: visit.id,
    }));
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getDashboardAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      );
    }

    const period = getReportPeriod(request);
    const monthDate = getReportMonth(request);
    const range = getReportRange(period, monthDate);
    const branchResult = await getValidatedBranchId({
      authResult,
      requestedBranchId: getDashboardBranchId(request),
    });

    if ("error" in branchResult) {
      return NextResponse.json(
        { error: branchResult.error },
        { status: branchResult.status },
      );
    }

    const branchId = branchResult.branchId;

    const visits = await prisma.visit.findMany({
      orderBy: { completedAt: "asc" },
      select: DASHBOARD_VISIT_SELECT,
      where: {
        ...(range
          ? {
              completedAt: {
                gte: range.start,
                lt: range.end,
              },
            }
          : {}),
        ...(branchId ? { branchId } : {}),
        shopId: authResult.shopId,
        status: VISIT_STATUS_COMPLETED,
      },
    });
    const serviceIds = [
      ...new Set(
        visits.flatMap((visit) =>
          visit.visitServices
            .map((visitService) => visitService.serviceId)
            .filter((serviceId): serviceId is string => Boolean(serviceId)),
        ),
      ),
    ];
    const haircutServices = serviceIds.length
      ? await prisma.service.findMany({
          select: { id: true },
          where: {
            id: {
              in: serviceIds,
            },
            isHaircut: true,
            shopId: authResult.shopId,
          },
        })
      : [];
    const haircutServiceIds = new Set(
      haircutServices.map((service) => service.id),
    );
    const revenueTrend = new Map<string, DashboardTrendPoint>();
    const topBarbers = new Map<string, TopItemAccumulator>();
    const topCombos = new Map<string, TopItemAccumulator>();
    const topServices = new Map<string, TopItemAccumulator>();
    const topSkinners = new Map<string, TopItemAccumulator>();
    const customerIds = [...new Set(visits.map((visit) => visit.customer.id))];
    const customerMetrics = await getCustomerMetrics({
      branchId,
      customerIds,
      range,
      shopId: authResult.shopId,
    });
    let revenue = 0;

    visits.forEach((visit) => {
      const visitRevenue = getVisitRevenue(visit);

      revenue += visitRevenue;
      applyVisitToTrend(revenueTrend, visit, period, visitRevenue);
      applyVisitServicesToTopItems({
        topBarbers,
        topCombos,
        topServices,
        topSkinners,
        visit,
      });
    });

    return NextResponse.json({
      [DASHBOARD_RESPONSE_DATA_KEY]: {
        branchId,
        haircutWarnings: getHaircutWarnings(visits, haircutServiceIds),
        metrics: [
          {
            label: dashboardTexts.metrics.revenue,
            value: VND_FORMATTER.format(revenue),
          },
          {
            label: dashboardTexts.metrics.totalVisits,
            value: String(visits.length),
          },
          {
            label: dashboardTexts.metrics.newCustomers,
            value: String(customerMetrics.newCustomers),
          },
          {
            label: dashboardTexts.metrics.returningCustomers,
            value: String(customerMetrics.returningCustomers),
          },
        ],
        periodLabel: getReportPeriodLabel(period, monthDate),
        revenueTrend: buildRevenueTrend(revenueTrend),
        topBarbers: formatTopItems(topBarbers),
        topCombos: formatTopItems(topCombos),
        topServices: formatTopItems(topServices),
        topSkinners: formatTopItems(topSkinners),
      },
    });
  } catch (error) {
    return getDashboardServerError(error);
  }
}
