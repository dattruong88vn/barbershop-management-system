import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Prisma } from "@prisma/client";

import {
  BRANCH_STATUS_ACTIVE,
  MANAGEMENT_ROLES,
  REVENUE_REPORT_ITEM_TYPE_COMBO,
  REVENUE_REPORT_ITEM_TYPE_SERVICE,
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
import type {
  RevenueReportBranchRow,
  RevenueReportItemRow,
  RevenueReportPieSegment,
} from "@/types";
import {
  formatReportDateRangeLabel,
  parseReportDateRange,
  type ReportDateRange,
} from "@/utils/reports";

const REVENUE_REPORT_RESPONSE_DATA_KEY = "report";

const REVENUE_REPORT_VISIT_SELECT = {
  branchId: true,
  branchNameSnapshot: true,
  completedAt: true,
  customerId: true,
  id: true,
  visitServices: {
    select: {
      allocatedPrice: true,
      comboId: true,
      comboNameSnapshot: true,
      id: true,
      serviceId: true,
      serviceNameSnapshot: true,
    },
  },
} as const;

type RevenueReportVisit = Prisma.VisitGetPayload<{
  select: typeof REVENUE_REPORT_VISIT_SELECT;
}>;

type RevenueReportAuthResult =
  | {
      branchId: string | null;
      branchName: string | null;
      role: ManagementRoleValue;
      shopId: string;
      userId: string;
    }
  | {
      error: string;
      status: number;
    };

type RevenueBranchAccumulator = Omit<
  RevenueReportBranchRow,
  "customerCount" | "revenue" | "serviceCount" | "visitCount"
> & {
  customers: Set<string>;
  revenue: number;
  serviceCount: number;
  visits: Set<string>;
};

type RevenueItemAccumulator = Omit<
  RevenueReportItemRow,
  "customerCount" | "detailCount" | "revenueShare" | "usageCount"
> & {
  customers: Set<string>;
  detailCount: number;
  revenue: number;
  usageCount: number;
  usageKeys: Set<string>;
};

async function getRevenueReportAuth(
  request: NextRequest,
): Promise<RevenueReportAuthResult> {
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
      select: { id: true, name: true },
      where: {
        id: branchId,
        managerId: token.id,
        shopId: token.shop_id,
        status: BRANCH_STATUS_ACTIVE,
      },
    });

    if (!branch) {
      return { error: reportTexts.api.errors.forbidden, status: 403 };
    }

    return {
      branchId: branch.id,
      branchName: branch.name,
      role: token.role as ManagementRoleValue,
      shopId: token.shop_id,
      userId: token.id,
    };
  }

  return {
    branchId: null,
    branchName: null,
    role: token.role as ManagementRoleValue,
    shopId: token.shop_id,
    userId: token.id,
  };
}

function getRequestedTab(request: NextRequest): RevenueReportTabValue {
  const tab = request.nextUrl.searchParams.get("tab")?.trim();

  return tab === REVENUE_REPORT_TAB_ITEM ? tab : REVENUE_REPORT_TAB_BRANCH;
}

function getActiveDuringRangeWhere(
  range: ReportDateRange,
): Prisma.BranchWhereInput {
  return {
    createdAt: { lt: range.end },
    OR: [{ deactivatedAt: null }, { deactivatedAt: { gte: range.start } }],
  };
}

function getVisitServiceCount(visit: RevenueReportVisit) {
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

function getVisitRevenue(visit: RevenueReportVisit) {
  return visit.visitServices.reduce(
    (total, visitService) => total + Number(visitService.allocatedPrice),
    0,
  );
}

function createBranchAccumulator(input: {
  branchId: string;
  branchName: string;
}): RevenueBranchAccumulator {
  return {
    ...input,
    customers: new Set<string>(),
    detailCount: 0,
    revenue: 0,
    serviceCount: 0,
    visits: new Set<string>(),
  };
}

function getItemKey({
  itemId,
  itemType,
}: {
  itemId: string;
  itemType: RevenueReportItemTypeValue;
}) {
  return `${itemType}:${itemId}`;
}

function createItemAccumulator(input: {
  itemId: string;
  itemName: string;
  itemType: RevenueReportItemTypeValue;
}): RevenueItemAccumulator {
  return {
    ...input,
    customers: new Set<string>(),
    detailCount: 0,
    revenue: 0,
    usageCount: 0,
    usageKeys: new Set<string>(),
  };
}

function getRevenueShare(revenue: number, totalRevenue: number) {
  return totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
}

function createPieSegments({
  rows,
  totalRevenue,
}: {
  rows: Array<{ itemId: string; itemName: string; revenue: number }>;
  totalRevenue: number;
}): RevenueReportPieSegment[] {
  return rows
    .filter((row) => row.revenue > 0)
    .map((row) => ({
      id: row.itemId,
      label: row.itemName,
      revenue: row.revenue,
      revenueShare: getRevenueShare(row.revenue, totalRevenue),
    }));
}

function formatBranchRows(
  rows: RevenueBranchAccumulator[],
): RevenueReportBranchRow[] {
  return rows
    .map((row) => ({
      branchId: row.branchId,
      branchName: row.branchName,
      customerCount: row.customers.size,
      detailCount: row.detailCount,
      revenue: row.revenue,
      serviceCount: row.serviceCount,
      visitCount: row.visits.size,
    }))
    .sort((firstRow, secondRow) => {
      return (
        secondRow.revenue - firstRow.revenue ||
        secondRow.visitCount - firstRow.visitCount ||
        firstRow.branchName.localeCompare(secondRow.branchName, "vi")
      );
    });
}

function formatItemRows(
  rows: RevenueItemAccumulator[],
): RevenueReportItemRow[] {
  const totalRevenue = rows.reduce((total, row) => total + row.revenue, 0);

  return rows
    .map((row) => ({
      customerCount: row.customers.size,
      detailCount: row.detailCount,
      itemId: row.itemId,
      itemName: row.itemName,
      itemType: row.itemType,
      revenue: row.revenue,
      revenueShare: getRevenueShare(row.revenue, totalRevenue),
      usageCount: row.usageCount,
    }))
    .sort((firstRow, secondRow) => {
      return (
        secondRow.revenue - firstRow.revenue ||
        firstRow.itemName.localeCompare(secondRow.itemName, "vi")
      );
    });
}

function addServiceItemRevenue({
  rowMap,
  visit,
  visitService,
}: {
  rowMap: Map<string, RevenueItemAccumulator>;
  visit: RevenueReportVisit;
  visitService: RevenueReportVisit["visitServices"][number];
}) {
  if (!visitService.serviceId) return;

  const itemId = visitService.serviceId;
  const key = getItemKey({
    itemId,
    itemType: REVENUE_REPORT_ITEM_TYPE_SERVICE,
  });
  const row =
    rowMap.get(key) ??
    createItemAccumulator({
      itemId,
      itemName:
        visitService.serviceNameSnapshot ??
        reportTexts.revenueReport.unknownItem,
      itemType: REVENUE_REPORT_ITEM_TYPE_SERVICE,
    });

  row.customers.add(visit.customerId);
  row.detailCount += 1;
  row.revenue += Number(visitService.allocatedPrice);
  row.usageCount += 1;
  row.usageKeys.add(visitService.id);
  rowMap.set(key, row);
}

function addComboItemRevenue({
  rowMap,
  visit,
  visitService,
}: {
  rowMap: Map<string, RevenueItemAccumulator>;
  visit: RevenueReportVisit;
  visitService: RevenueReportVisit["visitServices"][number];
}) {
  if (!visitService.comboId) return;

  const itemId = visitService.comboId;
  const key = getItemKey({
    itemId,
    itemType: REVENUE_REPORT_ITEM_TYPE_COMBO,
  });
  const usageKey = `${visit.id}:${itemId}`;
  const row =
    rowMap.get(key) ??
    createItemAccumulator({
      itemId,
      itemName:
        visitService.comboNameSnapshot ?? reportTexts.revenueReport.unknownItem,
      itemType: REVENUE_REPORT_ITEM_TYPE_COMBO,
    });

  row.customers.add(visit.customerId);
  row.revenue += Number(visitService.allocatedPrice);

  if (!row.usageKeys.has(usageKey)) {
    row.detailCount += 1;
    row.usageCount += 1;
    row.usageKeys.add(usageKey);
  }

  rowMap.set(key, row);
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getRevenueReportAuth(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
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
    const branchWhere =
      authResult.role === USER_ROLE_MANAGER && authResult.branchId
        ? { id: authResult.branchId }
        : {};
    const visitWhere = {
      completedAt: {
        gte: range.start,
        lt: range.end,
      },
      ...(authResult.branchId ? { branchId: authResult.branchId } : {}),
      shopId: authResult.shopId,
      status: VISIT_STATUS_COMPLETED,
    } satisfies Prisma.VisitWhereInput;
    const [branches, visits] = await Promise.all([
      prisma.branch.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
        },
        where: {
          ...getActiveDuringRangeWhere(range),
          ...branchWhere,
          shopId: authResult.shopId,
        },
      }),
      prisma.visit.findMany({
        orderBy: { completedAt: "desc" },
        select: REVENUE_REPORT_VISIT_SELECT,
        where: visitWhere,
      }),
    ]);
    const branchRowMap = new Map<string, RevenueBranchAccumulator>();
    const itemRowMap = new Map<string, RevenueItemAccumulator>();
    const customers = new Set<string>();
    const visitsSet = new Set<string>();
    let serviceCount = 0;
    let totalRevenue = 0;

    branches.forEach((branch) => {
      branchRowMap.set(
        branch.id,
        createBranchAccumulator({
          branchId: branch.id,
          branchName: branch.name,
        }),
      );
    });

    visits.forEach((visit) => {
      customers.add(visit.customerId);
      visitsSet.add(visit.id);
      serviceCount += getVisitServiceCount(visit);
      totalRevenue += getVisitRevenue(visit);

      const branchRow = branchRowMap.get(visit.branchId);

      if (branchRow) {
        branchRow.branchName = visit.branchNameSnapshot || branchRow.branchName;
        branchRow.customers.add(visit.customerId);
        branchRow.detailCount += 1;
        branchRow.revenue += getVisitRevenue(visit);
        branchRow.serviceCount += getVisitServiceCount(visit);
        branchRow.visits.add(visit.id);
      }

      visit.visitServices.forEach((visitService) => {
        if (visitService.comboId) {
          addComboItemRevenue({ rowMap: itemRowMap, visit, visitService });
          return;
        }

        addServiceItemRevenue({ rowMap: itemRowMap, visit, visitService });
      });
    });

    const branchRows = formatBranchRows(Array.from(branchRowMap.values()));
    const itemRows = formatItemRows(Array.from(itemRowMap.values()));
    const comboRows = itemRows.filter(
      (row) => row.itemType === REVENUE_REPORT_ITEM_TYPE_COMBO,
    );
    const serviceRows = itemRows.filter(
      (row) => row.itemType === REVENUE_REPORT_ITEM_TYPE_SERVICE,
    );
    const comboRevenue = comboRows.reduce((total, row) => total + row.revenue, 0);
    const serviceRevenue = serviceRows.reduce(
      (total, row) => total + row.revenue,
      0,
    );

    return NextResponse.json({
      [REVENUE_REPORT_RESPONSE_DATA_KEY]: {
        branchName: authResult.branchName,
        branchRows,
        comboPie: createPieSegments({
          rows: comboRows.map((row) => ({
            itemId: row.itemId,
            itemName: row.itemName,
            revenue: row.revenue,
          })),
          totalRevenue: comboRevenue,
        }),
        itemRows,
        itemTypePie: [
          {
            id: REVENUE_REPORT_ITEM_TYPE_SERVICE,
            label: reportTexts.revenueReport.itemTypes.service,
            revenue: serviceRevenue,
            revenueShare: getRevenueShare(serviceRevenue, totalRevenue),
          },
          {
            id: REVENUE_REPORT_ITEM_TYPE_COMBO,
            label: reportTexts.revenueReport.itemTypes.combo,
            revenue: comboRevenue,
            revenueShare: getRevenueShare(comboRevenue, totalRevenue),
          },
        ].filter((segment) => segment.revenue > 0),
        periodLabel: formatReportDateRangeLabel(fromDate, toDate),
        servicePie: createPieSegments({
          rows: serviceRows.map((row) => ({
            itemId: row.itemId,
            itemName: row.itemName,
            revenue: row.revenue,
          })),
          totalRevenue: serviceRevenue,
        }),
        tab,
        totals: {
          customerCount: customers.size,
          revenue: totalRevenue,
          serviceCount,
          visitCount: visitsSet.size,
        },
      },
    });
  } catch (error) {
    console.error("[revenue-report-api] Failed to load revenue report", error);

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
