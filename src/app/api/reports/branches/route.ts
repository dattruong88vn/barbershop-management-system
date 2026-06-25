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
import type { BranchReportRow } from "@/types";
import {
  formatReportDateRangeLabel,
  parseReportDateRange,
  type ReportDateRange,
} from "@/utils/reports";

const BRANCH_REPORT_RESPONSE_DATA_KEY = "report";

const BRANCH_REPORT_VISIT_SELECT = {
  branchId: true,
  branchNameSnapshot: true,
  completedAt: true,
  customerId: true,
  id: true,
  visitServices: {
    select: {
      allocatedPrice: true,
      comboId: true,
      serviceId: true,
    },
  },
} as const;

type BranchReportVisit = Prisma.VisitGetPayload<{
  select: typeof BRANCH_REPORT_VISIT_SELECT;
}>;

type BranchReportAuthResult =
  | {
      shopId: string;
    }
  | {
      error: string;
      status: number;
    };

type BranchReportAccumulator = Omit<
  BranchReportRow,
  "customerCount" | "revenue" | "serviceCount" | "visitCount"
> & {
  customers: Set<string>;
  revenue: number;
  serviceCount: number;
  visits: Set<string>;
};

async function getBranchReportAuth(
  request: NextRequest,
): Promise<BranchReportAuthResult> {
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

function getRequestedStatus(request: NextRequest): BranchStatusFilterValue {
  const status = request.nextUrl.searchParams.get("status")?.trim();

  return status === BRANCH_STATUS_ACTIVE || status === BRANCH_STATUS_INACTIVE
    ? status
    : BRANCH_STATUS_ALL;
}

function getActiveDuringRangeWhere(
  range: ReportDateRange,
): Prisma.BranchWhereInput {
  return {
    createdAt: { lt: range.end },
    OR: [{ deactivatedAt: null }, { deactivatedAt: { gte: range.start } }],
  };
}

function getVisitServiceCount(visit: BranchReportVisit) {
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

function getVisitRevenue(visit: BranchReportVisit) {
  return visit.visitServices.reduce(
    (total, visitService) => total + Number(visitService.allocatedPrice),
    0,
  );
}

function createBranchAccumulator(input: {
  branchId: string;
  branchName: string;
  status: typeof BRANCH_STATUS_ACTIVE | typeof BRANCH_STATUS_INACTIVE;
}): BranchReportAccumulator {
  return {
    ...input,
    customers: new Set<string>(),
    detailCount: 0,
    revenue: 0,
    serviceCount: 0,
    visits: new Set<string>(),
  };
}

function formatRows(rows: BranchReportAccumulator[]): BranchReportRow[] {
  return rows
    .map((row) => ({
      branchId: row.branchId,
      branchName: row.branchName,
      customerCount: row.customers.size,
      detailCount: row.detailCount,
      revenue: row.revenue,
      serviceCount: row.serviceCount,
      status: row.status,
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

export async function GET(request: NextRequest) {
  try {
    const authResult = await getBranchReportAuth(request);

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

    const requestedStatus = getRequestedStatus(request);
    const branchStatusWhere =
      requestedStatus === BRANCH_STATUS_ALL ? {} : { status: requestedStatus };
    const [branches, visits] = await Promise.all([
      prisma.branch.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          status: true,
        },
        where: {
          ...getActiveDuringRangeWhere(range),
          ...branchStatusWhere,
          shopId: authResult.shopId,
        },
      }),
      prisma.visit.findMany({
        orderBy: { completedAt: "desc" },
        select: BRANCH_REPORT_VISIT_SELECT,
        where: {
          completedAt: {
            gte: range.start,
            lt: range.end,
          },
          shopId: authResult.shopId,
          status: VISIT_STATUS_COMPLETED,
        },
      }),
    ]);
    const rowMap = new Map<string, BranchReportAccumulator>();

    branches.forEach((branch) => {
      rowMap.set(
        branch.id,
        createBranchAccumulator({
          branchId: branch.id,
          branchName: branch.name,
          status: branch.status,
        }),
      );
    });

    visits.forEach((visit) => {
      const row = rowMap.get(visit.branchId);

      if (!row) return;

      row.branchName = visit.branchNameSnapshot || row.branchName;
      row.customers.add(visit.customerId);
      row.detailCount += 1;
      row.revenue += getVisitRevenue(visit);
      row.serviceCount += getVisitServiceCount(visit);
      row.visits.add(visit.id);
    });

    return NextResponse.json({
      [BRANCH_REPORT_RESPONSE_DATA_KEY]: {
        periodLabel: formatReportDateRangeLabel(fromDate, toDate),
        rows: formatRows(Array.from(rowMap.values())),
      },
    });
  } catch (error) {
    console.error("[branch-report-api] Failed to load branch report", error);

    return NextResponse.json(
      { error: reportTexts.api.errors.serverError },
      { status: 500 },
    );
  }
}
